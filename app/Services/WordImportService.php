<?php

namespace App\Services;

use App\Models\Question;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Element\Text;
use PhpOffice\PhpWord\Element\TextRun;
use PhpOffice\PhpWord\Element\Image;
use PhpOffice\PhpWord\Element\Table;
use PhpOffice\PhpWord\Element\Row;
use PhpOffice\PhpWord\Element\Cell;
use PhpOffice\PhpWord\Element\ListItem;
use PhpOffice\PhpWord\Element\ListItemRun;
use PhpOffice\PhpWord\Element\TextBreak;

class WordImportService
{
    /**
     * Parsed math formulas indexed by position (0-based).
     * Key = [[MATH_N]] placeholder index, Value = HTML string.
     */
    protected $parsedFormulas = [];

    public function import($filePath, $questionBankId)
    {
        $this->parsedFormulas = [];

        // STRATEGY: Instead of using PHPWord's broken oMath parser,
        // we directly read the DOCX XML ourselves.
        // PHPWord's phpoffice/math library throws unrecoverable exceptions
        // ('m:r has no tag m:t') for many real-world equation structures.
        //
        // Our approach:
        // 1. Open DOCX as zip, read word/document.xml directly
        // 2. Extract all oMath elements and convert to HTML (sup/sub/fraction)
        // 3. Replace oMath XML blocks with [[MATH_N]] placeholders in document.xml
        // 4. Save modified XML to a temp DOCX file (PHPWord can load it without crashing)
        // 5. Load temp DOCX with PHPWord to get paragraphs, images, etc.
        // 6. When we find [[MATH_N]] text, replace with parsed formula HTML

        $tempDocxPath = $this->createProcessedDocx($filePath);
        $workingPath = $tempDocxPath ?? $filePath;

        try {
            $prevLibxmlErrors = libxml_use_internal_errors(true);
            $phpWord = IOFactory::load($workingPath);
            libxml_clear_errors();
            libxml_use_internal_errors($prevLibxmlErrors);
        } catch (\Exception $e) {
            if ($tempDocxPath && file_exists($tempDocxPath)) {
                @unlink($tempDocxPath);
            }
            throw $e;
        }

        $questions = [];
        $currentQuestion = $this->resetQuestion();

        foreach ($phpWord->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                $this->processElement($element, $currentQuestion, $questions);
            }
        }

        // Push last question if exists
        if (!empty($currentQuestion['text'])) {
            $questions[] = $currentQuestion;
        }

        // Cleanup temp file
        if ($tempDocxPath && file_exists($tempDocxPath)) {
            @unlink($tempDocxPath);
        }

        $successCount = 0;
        $errorCount = 0;
        foreach ($questions as $qData) {
            try {
                if (empty(trim(strip_tags($qData['text'])))) {
                    $errorCount++;
                    continue;
                }

                $options = null;
                if ($qData['type'] === 'pilihan_ganda' || $qData['type'] === 'pilihan_ganda_kompleks') {
                    $options = array_filter($qData['options'], function ($val) {
                        return !is_null($val) && trim($val) !== '';
                    });
                } elseif ($qData['type'] === 'menjodohkan') {
                    $options = $qData['options'];
                }

                // Auto-detect PGK if answer key has multiple options
                $type = $qData['type'];
                if ($type === 'pilihan_ganda' && strpos($qData['answer_key'], ',') !== false) {
                    $type = 'pilihan_ganda_kompleks';
                }

                Question::create([
                    'question_bank_id' => $questionBankId,
                    'type'             => $type,
                    'question_text'    => $qData['text'],
                    'options'          => $options,
                    'answer_key'       => $qData['answer_key'] ?? 'a',
                    'score_default'    => 1,
                ]);
                $successCount++;
            } catch (\Exception $e) {
                $errorCount++;
            }
        }

        return [
            'success' => $successCount,
            'failed'  => $errorCount,
        ];
    }

    // =========================================================================
    // DOCX PRE-PROCESSING
    // =========================================================================

    /**
     * Create a processed copy of the DOCX where all m:oMath elements are replaced
     * with [[MATH_N]] placeholder text. PHPWord can load this without crashing.
     * Returns path to temp file, or null on failure.
     */
    protected function createProcessedDocx($filePath)
    {
        try {
            $zip = new \ZipArchive();
            if ($zip->open($filePath) !== true) {
                return null;
            }

            $documentXml = $zip->getFromName('word/document.xml');
            $zip->close();

            if (!$documentXml) {
                return null;
            }

            // Parse the document XML (full context = all namespaces present)
            $prevErrors = libxml_use_internal_errors(true);
            $dom = new \DOMDocument();
            $dom->loadXML($documentXml);
            libxml_clear_errors();
            libxml_use_internal_errors($prevErrors);

            $xpath = new \DOMXPath($dom);
            $xpath->registerNamespace('m', 'http://schemas.openxmlformats.org/officeDocument/2006/math');
            $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

            // Find all oMath top-level nodes
            // oMath can appear standalone as a paragraph (wrapped in w:p) or inline in a w:p
            $oMathNodes = $xpath->query('//m:oMath');

            if (!$oMathNodes || $oMathNodes->length === 0) {
                // No math equations - no need for temp file
                return null;
            }

            $index = 0;
            $nodesToReplace = [];

            foreach ($oMathNodes as $mathNode) {
                // Parse the math and store it
                $mathHtml = $this->extractTextFromMathNode($mathNode, $xpath);
                $this->parsedFormulas[$index] = $mathHtml;

                $placeholder = "[[MATH_{$index}]]";
                $nodesToReplace[] = ['node' => $mathNode, 'placeholder' => $placeholder];
                $index++;
            }

            // Replace each oMath node with a w:r > w:t placeholder text node
            foreach ($nodesToReplace as $item) {
                $mathNode = $item['node'];
                $placeholder = $item['placeholder'];
                $parentNode = $mathNode->parentNode;

                // Create replacement: <w:r><w:t>[[MATH_N]]</w:t></w:r>
                $wNs = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
                $wRun = $dom->createElementNS($wNs, 'w:r');
                $wText = $dom->createElementNS($wNs, 'w:t', htmlspecialchars($placeholder));
                $wText->setAttribute('xml:space', 'preserve');
                $wRun->appendChild($wText);

                if ($parentNode) {
                    $parentNode->replaceChild($wRun, $mathNode);
                }
            }

            // Save modified XML
            $modifiedXml = $dom->saveXML();

            // Copy original DOCX to temp file and replace document.xml inside it
            $tempPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'word_import_' . Str::random(16) . '.docx';
            copy($filePath, $tempPath);

            $zipOut = new \ZipArchive();
            if ($zipOut->open($tempPath) !== true) {
                @unlink($tempPath);
                return null;
            }

            $zipOut->addFromString('word/document.xml', $modifiedXml);
            $zipOut->close();

            return $tempPath;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Extract readable HTML text from an oMath DOM node.
     * Handles: basic runs, fractions, superscripts, subscripts, sub-superscripts,
     * radicals, and recursively processes any unknown containers.
     */
    protected function extractTextFromMathNode(\DOMNode $node, \DOMXPath $xpath)
    {
        $result = '';

        foreach ($node->childNodes as $child) {
            if (!($child instanceof \DOMElement)) continue;

            $localName = $child->localName;

            switch ($localName) {
                case 'r': // Math run: m:r > m:t
                    // m:r may contain m:rPr (run props) and m:t (text)
                    // Collect ALL m:t children (not just first)
                    $tNodes = $xpath->query('m:t', $child);
                    if ($tNodes && $tNodes->length > 0) {
                        foreach ($tNodes as $t) {
                            $result .= $t->nodeValue;
                        }
                    }
                    break;

                case 'f': // Fraction: m:f > m:num, m:den
                    $numText = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'num', $xpath),
                        $xpath
                    );
                    $denText = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'den', $xpath),
                        $xpath
                    );
                    $result .= "({$numText}/{$denText})";
                    break;

                case 'sSup': // Superscript: m:sSup > m:e (base), m:sup (exponent)
                    $baseText = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'e', $xpath),
                        $xpath
                    );
                    $supText = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'sup', $xpath),
                        $xpath
                    );
                    $result .= "{$baseText}<sup>{$supText}</sup>";
                    break;

                case 'sSub': // Subscript: m:sSub > m:e (base), m:sub (subscript)
                    $baseText = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'e', $xpath),
                        $xpath
                    );
                    $subText = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'sub', $xpath),
                        $xpath
                    );
                    $result .= "{$baseText}<sub>{$subText}</sub>";
                    break;

                case 'sSubSup': // Sub+Superscript: m:sSubSup
                    $baseText = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'e', $xpath),
                        $xpath
                    );
                    $subText = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'sub', $xpath),
                        $xpath
                    );
                    $supText = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'sup', $xpath),
                        $xpath
                    );
                    $result .= "{$baseText}<sub>{$subText}</sub><sup>{$supText}</sup>";
                    break;

                case 'rad': // Radical / Square root: m:rad > m:deg, m:e
                    $degNode = $this->getFirstChild($child, 'deg', $xpath);
                    $eNode   = $this->getFirstChild($child, 'e', $xpath);
                    $eText   = $this->extractTextFromMathNode($eNode, $xpath);
                    // Check if degree is empty (= plain square root)
                    $degText = $degNode ? trim($this->extractTextFromMathNode($degNode, $xpath)) : '';
                    if (empty($degText)) {
                        $result .= "√({$eText})";
                    } else {
                        $result .= "<sup>{$degText}</sup>√({$eText})";
                    }
                    break;

                case 'nary': // N-ary operator (sigma, integral, etc.): m:nary
                    // Extract the operator character and the expression
                    $subText = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'sub', $xpath),
                        $xpath
                    );
                    $supText = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'sup', $xpath),
                        $xpath
                    );
                    $eText = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'e', $xpath),
                        $xpath
                    );
                    // Get operator symbol from m:naryPr > m:chr
                    $chrNodes = $xpath->query('m:naryPr/m:chr', $child);
                    $chr = ($chrNodes && $chrNodes->length > 0)
                        ? $chrNodes->item(0)->getAttribute('m:val')
                        : '∑';
                    $result .= "{$chr}<sub>{$subText}</sub><sup>{$supText}</sup>({$eText})";
                    break;

                case 'func': // Function: m:func > m:fName, m:e
                    $fName = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'fName', $xpath),
                        $xpath
                    );
                    $eText = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'e', $xpath),
                        $xpath
                    );
                    $result .= "{$fName}({$eText})";
                    break;

                case 'd': // Delimiter: m:d > m:e (content between brackets)
                    // Get bracket characters from m:dPr
                    $begChrNodes = $xpath->query('m:dPr/m:begChr', $child);
                    $endChrNodes = $xpath->query('m:dPr/m:endChr', $child);
                    $beg = ($begChrNodes && $begChrNodes->length > 0)
                        ? $begChrNodes->item(0)->getAttribute('m:val')
                        : '(';
                    $end = ($endChrNodes && $endChrNodes->length > 0)
                        ? $endChrNodes->item(0)->getAttribute('m:val')
                        : ')';
                    $eText = $this->extractTextFromMathNode(
                        $this->getFirstChild($child, 'e', $xpath),
                        $xpath
                    );
                    $result .= "{$beg}{$eText}{$end}";
                    break;

                case 'eqArr': // Equation array: m:eqArr
                case 'mr':    // Matrix row: m:mr
                case 'm':     // Matrix: m:m
                case 'limLow': // Lower limit: m:limLow
                case 'limUpp': // Upper limit: m:limUpp
                case 'groupChr': // Group character: m:groupChr
                case 'bar':   // Overbar/underbar: m:bar
                case 'acc':   // Accent: m:acc
                case 'box':   // Box: m:box
                case 'borderBox': // Border box
                case 'phant': // Phantom
                    // For all other containers, just recurse
                    $result .= $this->extractTextFromMathNode($child, $xpath);
                    break;

                // Skip property nodes
                case 'rPr':   // Run properties
                case 'sPr':   // Subscript/superscript properties
                case 'fPr':   // Fraction properties
                case 'naryPr': // N-ary properties
                case 'dPr':   // Delimiter properties
                case 'radPr': // Radical properties
                case 'funcPr': // Function properties
                case 'ctrlPr': // Control properties
                case 'oMathParaPr': // Paragraph properties
                    break;

                case 'oMath':
                case 'oMathPara':
                    $result .= $this->extractTextFromMathNode($child, $xpath);
                    break;

                default:
                    // Unknown element — try recursing into it
                    $result .= $this->extractTextFromMathNode($child, $xpath);
                    break;
            }
        }

        return $result;
    }

    /**
     * Helper: get first child element with given local name using XPath.
     * Returns a dummy empty DOMDocument if not found (safe for recursion).
     */
    protected function getFirstChild(\DOMNode $parent, $localName, \DOMXPath $xpath)
    {
        $nodes = $xpath->query("m:{$localName}", $parent);
        if ($nodes && $nodes->length > 0) {
            return $nodes->item(0);
        }
        // Return an empty DOMDocument (harmless for extractTextFromMathNode)
        return new \DOMDocument();
    }

    // =========================================================================
    // PHPWORD ELEMENT PROCESSING
    // =========================================================================

    protected function processElement($element, &$currentQuestion, &$questions)
    {
        if ($element instanceof TextRun || $element instanceof ListItemRun) {
            $text = '';
            foreach ($element->getElements() as $child) {
                if ($child instanceof Text) {
                    $text .= $this->processTextElement($child);
                } elseif ($child instanceof Image) {
                    $imagePath = $this->saveImage($child);
                    $text .= '<br><img src="/storage/' . $imagePath . '" class="max-w-full h-auto mt-2 rounded-lg py-2 block">';
                }
            }
            // Restore [[MATH_N]] placeholders with actual formula HTML
            $text = $this->resolveMathPlaceholders($text);
            $this->parseLine($text, $currentQuestion, $questions);
        } elseif ($element instanceof Text) {
            $text = $this->resolveMathPlaceholders($this->processTextElement($element));
            $this->parseLine($text, $currentQuestion, $questions);
        } elseif ($element instanceof ListItem) {
            $this->processElement($element->getTextObject(), $currentQuestion, $questions);
        } elseif ($element instanceof Table) {
            foreach ($element->getRows() as $row) {
                foreach ($row->getCells() as $cell) {
                    foreach ($cell->getElements() as $cellElement) {
                        $this->processElement($cellElement, $currentQuestion, $questions);
                    }
                }
            }
        } elseif ($element instanceof TextBreak) {
            // ignore — text breaks don't carry question content
        }
    }

    protected function processTextElement($textElement)
    {
        $text = $textElement->getText();
        $fontStyle = $textElement->getFontStyle();

        if ($fontStyle && is_object($fontStyle)) {
            if ($fontStyle->isSuperScript()) {
                $text = '<sup>' . $text . '</sup>';
            } elseif ($fontStyle->isSubScript()) {
                $text = '<sub>' . $text . '</sub>';
            }
            if ($fontStyle->isBold()) {
                $text = '<strong>' . $text . '</strong>';
            }
            if ($fontStyle->isItalic()) {
                $text = '<em>' . $text . '</em>';
            }
        }
        return $text;
    }

    /**
     * Replace [[MATH_N]] placeholders in a text string with the parsed formula HTML.
     */
    protected function resolveMathPlaceholders($text)
    {
        return preg_replace_callback('/\[\[MATH_(\d+)\]\]/', function ($matches) {
            $index = (int) $matches[1];
            return $this->parsedFormulas[$index] ?? '';
        }, $text);
    }

    // =========================================================================
    // QUESTION LINE PARSING
    // =========================================================================

    protected function parseLine($line, &$currentQuestion, &$questions)
    {
        $plainLine = trim(strip_tags($line));
        if (empty($plainLine)) return;

        $isDigitMatch     = preg_match('/^\d+[\.\)]\s*(.*)/is', $plainLine, $matches);
        $isOptionMatch    = preg_match('/^([A-E])[\.\)]\s*(.*)/is', $plainLine, $matchesOption);
        $isTypeMatch      = preg_match('/^(Tipe|Jenis):\s*(.*)/i', $plainLine, $matchesType);
        $isAnswerKeyMatch = preg_match('/^(Kunci|Jawaban|Jawab|Answer):\s*(.*)/i', $plainLine, $matchesKey);

        // Rebuild the "rich" version of the line (with HTML) for the digit match
        if ($isDigitMatch) {
            // Strip the leading number from the original (HTML-preserved) line
            $richContent = preg_replace('/^\d+[\.\)]\s*/s', '', $line);
        }

        if ($isDigitMatch || ($currentQuestion['is_complete'] && !$isOptionMatch && !$isTypeMatch && !$isAnswerKeyMatch)) {
            if (!empty($currentQuestion['text'])) {
                $questions[] = $currentQuestion;
                $currentQuestion = $this->resetQuestion();
            }
            $currentQuestion['text'] = $isDigitMatch ? ($richContent ?? $matches[1]) : $line;
        } elseif ($isOptionMatch) {
            $key = strtolower($matchesOption[1]);
            // Build rich value: strip "X. " from the beginning of the original line
            $richVal = trim(preg_replace('/^[A-E][\.\)]\s*/is', '', $line));

            if ($currentQuestion['type'] === 'menjodohkan' && strpos($richVal, '|') !== false) {
                [$left, $right] = explode('|', $richVal, 2);
                $currentQuestion['options']["left_$key"]  = trim($left);
                $currentQuestion['options']["right_$key"] = trim($right);
                $currentMap = $currentQuestion['answer_key'] ? json_decode($currentQuestion['answer_key'], true) : [];
                $currentMap[$key] = $key;
                $currentQuestion['answer_key'] = json_encode($currentMap);
            } else {
                $currentQuestion['options'][$key] = $richVal;
                if ($currentQuestion['type'] === 'essay') {
                    $currentQuestion['type'] = 'pilihan_ganda';
                }
            }
        } elseif ($isTypeMatch) {
            $typeName = strtolower(trim($matchesType[2]));
            if (str_contains($typeName, 'kompleks') || str_contains($typeName, 'pgk')) {
                $currentQuestion['type'] = 'pilihan_ganda_kompleks';
            } elseif (str_contains($typeName, 'jodoh') || str_contains($typeName, 'match')) {
                $currentQuestion['type'] = 'menjodohkan';
                $currentQuestion['options'] = [];
                $currentQuestion['answer_key'] = '';
            } elseif (str_contains($typeName, 'isian') || str_contains($typeName, 'singkat')) {
                $currentQuestion['type'] = 'isian_singkat';
            } elseif (str_contains($typeName, 'essay') || str_contains($typeName, 'uraian')) {
                $currentQuestion['type'] = 'essay';
            }
        } elseif ($isAnswerKeyMatch) {
            $currentQuestion['answer_key'] = str_replace(' ', '', strtolower(trim($matchesKey[2])));
            $currentQuestion['is_complete'] = true;
        } else {
            if (empty($currentQuestion['text'])) {
                $currentQuestion['text'] = $line;
            } else {
                $currentQuestion['text'] .= ' ' . $line;
            }
        }
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    protected function saveImage($imageElement)
    {
        $imageData = $imageElement->getImageString();
        $extension = $imageElement->getImageExtension();
        $fileName  = 'questions/' . Str::random(40) . '.' . $extension;
        Storage::disk('public')->put($fileName, $imageData);
        return $fileName;
    }

    protected function resetQuestion()
    {
        return [
            'type'        => 'essay',
            'text'        => '',
            'options'     => ['a' => '', 'b' => '', 'c' => '', 'd' => '', 'e' => ''],
            'answer_key'  => '',
            'is_complete' => false,
        ];
    }
}
