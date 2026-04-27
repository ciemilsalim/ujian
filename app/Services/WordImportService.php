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
use PhpOffice\PhpWord\Element\Formula;
use PhpOffice\Math\Writer\MathML;
use PhpOffice\Math\Reader\OfficeMathML;

class WordImportService
{
    /**
     * Store the original file path for direct XML extraction fallback.
     */
    protected $docxFilePath;

    /**
     * Raw oMath XML elements extracted directly from DOCX, with proper namespaces.
     * These are extracted before PHPWord loads the file, so namespace context is preserved.
     */
    protected $rawOmathElements = [];

    /**
     * Counter to match Formula elements from PHPWord to the raw XML array.
     */
    protected $formulaIndex = 0;

    public function import($filePath, $questionBankId)
    {
        $this->docxFilePath = $filePath;
        $this->formulaIndex = 0;
        $this->rawOmathElements = [];

        // PRE-STEP: Extract all oMath elements directly from DOCX zip with full namespace context.
        // This is needed because PHPWord extracts XML fragments that lose their namespace
        // declarations, causing 'Namespace prefix m on oMath is not defined' errors.
        $this->extractRawOmathElements($filePath);

        // Suppress libxml errors during load to prevent any remaining namespace warnings
        // from crashing the import (PHPWord's OfficeMathML reader uses DOMDocument internally).
        $prevLibxmlErrors = libxml_use_internal_errors(true);
        $phpWord = IOFactory::load($filePath);
        libxml_clear_errors();
        libxml_use_internal_errors($prevLibxmlErrors);
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

        $successCount = 0;
        $errorCount = 0;
        foreach ($questions as $qData) {
            try {
                if (empty(trim($qData['text']))) {
                    $errorCount++;
                    continue;
                }

                $options = null;
                if ($qData['type'] === 'pilihan_ganda' || $qData['type'] === 'pilihan_ganda_kompleks') {
                    $options = array_filter($qData['options'], function($val) {
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
                    'type' => $type,
                    'question_text' => $qData['text'],
                    'options' => $options,
                    'answer_key' => $qData['answer_key'] ?? 'a',
                    'score_default' => 1,
                ]);
                $successCount++;
            } catch (\Exception $e) {
                $errorCount++;
            }
        }

        return [
            'success' => $successCount,
            'failed' => $errorCount
        ];
    }

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
                } elseif ($child instanceof Formula) {
                    $text .= $this->processFormulaElement($child);
                }
            }
            $this->parseLine($text, $currentQuestion, $questions);
        } elseif ($element instanceof Text) {
            $this->parseLine($this->processTextElement($element), $currentQuestion, $questions);
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
            $this->parseLine(' ', $currentQuestion, $questions);
        } elseif ($element instanceof Formula) {
            $this->parseLine($this->processFormulaElement($element), $currentQuestion, $questions);
        }
    }

    protected function processTextElement($textElement)
    {
        $text = $textElement->getText();
        $fontStyle = $textElement->getFontStyle();
        
        if ($fontStyle) {
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

    protected function processFormulaElement($formulaElement)
    {
        // First try: use our pre-extracted raw oMath XML with proper namespace context.
        // This is far more reliable than PHPWord's MathML writer for complex equations.
        if (isset($this->rawOmathElements[$this->formulaIndex])) {
            $mathXml = $this->rawOmathElements[$this->formulaIndex];
            $this->formulaIndex++;
            return $this->parseMathXmlToHtml($mathXml);
        }
        $this->formulaIndex++;

        // Second try: use PHPWord's built-in MathML writer.
        try {
            $writer = new MathML();
            return $writer->write($formulaElement->getMath());
        } catch (\Exception $e) {
            return '[Rumus]';
        }
    }

    /**
     * Pre-extract all oMath nodes from the DOCX zip file with full namespace context.
     * Stored in $this->rawOmathElements[] indexed by position (0-based).
     */
    protected function extractRawOmathElements($filePath)
    {
        try {
            $zip = new \ZipArchive();
            if ($zip->open($filePath) !== true) return;

            $documentXml = $zip->getFromName('word/document.xml');
            $zip->close();

            if (!$documentXml) return;

            $prevErrors = libxml_use_internal_errors(true);
            $dom = new \DOMDocument();
            $dom->loadXML($documentXml);
            libxml_clear_errors();
            libxml_use_internal_errors($prevErrors);

            $xpath = new \DOMXPath($dom);
            $xpath->registerNamespace('m', 'http://schemas.openxmlformats.org/officeDocument/2006/math');

            // Get all top-level oMath nodes (not nested ones inside oMathPara)
            $oMathNodes = $xpath->query('//m:oMath');
            if (!$oMathNodes) return;

            foreach ($oMathNodes as $node) {
                // Save the node XML — it already has full namespace context from the parent document.
                $this->rawOmathElements[] = $dom->saveXML($node);
            }
        } catch (\Exception $e) {
            // Silently fail - formulaElement MathML writer will be used as fallback
        }
    }

    /**
     * Parse oMath XML string into readable HTML (with sup/sub tags).
     * We add required namespace declarations to the fragment before parsing.
     */
    protected function parseMathXmlToHtml($mathXml)
    {
        try {
            // Inject namespace declarations if missing (common with extracted fragments)
            if (strpos($mathXml, 'xmlns:m') === false) {
                $mathXml = str_replace(
                    '<m:oMath>',
                    '<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
                    $mathXml
                );
            }

            $prevErrors = libxml_use_internal_errors(true);
            $dom = new \DOMDocument();
            $dom->loadXML($mathXml);
            libxml_clear_errors();
            libxml_use_internal_errors($prevErrors);

            $xpath = new \DOMXPath($dom);
            $xpath->registerNamespace('m', 'http://schemas.openxmlformats.org/officeDocument/2006/math');

            $root = $dom->documentElement;
            return $this->extractTextFromMathNode($root, $xpath);
        } catch (\Exception $e) {
            return '[Rumus]';
        }
    }

    /**
     * Extract readable text from an oMath DOM node.
     * Handles fractions, superscripts, subscripts and basic math runs.
     */
    protected function extractTextFromMathNode(\DOMNode $node, \DOMXPath $xpath)
    {
        $result = '';

        foreach ($node->childNodes as $child) {
            if (!($child instanceof \DOMElement)) continue;

            $localName = $child->localName;

            switch ($localName) {
                case 'f': // Fraction: m:f
                    $num = $xpath->query('m:num//m:t', $child);
                    $den = $xpath->query('m:den//m:t', $child);
                    $numText = $num && $num->length ? trim($num->item(0)->nodeValue) : '?';
                    $denText = $den && $den->length ? trim($den->item(0)->nodeValue) : '?';
                    $result .= "({$numText}/{$denText})";
                    break;

                case 'sSup': // Superscript: m:sSup
                    $base = $xpath->query('m:e//m:t', $child);
                    $sup  = $xpath->query('m:sup//m:t', $child);
                    $baseText = $base && $base->length ? trim($base->item(0)->nodeValue) : '';
                    $supText  = $sup && $sup->length ? trim($sup->item(0)->nodeValue) : '';
                    $result .= "<sup>{$supText}</sup>" ? "{$baseText}<sup>{$supText}</sup>" : $baseText;
                    break;

                case 'sSub': // Subscript: m:sSub
                    $base = $xpath->query('m:e//m:t', $child);
                    $sub  = $xpath->query('m:sub//m:t', $child);
                    $baseText = $base && $base->length ? trim($base->item(0)->nodeValue) : '';
                    $subText  = $sub && $sub->length ? trim($sub->item(0)->nodeValue) : '';
                    $result .= "{$baseText}<sub>{$subText}</sub>";
                    break;

                case 'sSubSup': // Sub-superscript: m:sSubSup
                    $base = $xpath->query('m:e//m:t', $child);
                    $sub  = $xpath->query('m:sub//m:t', $child);
                    $sup  = $xpath->query('m:sup//m:t', $child);
                    $baseText = $base && $base->length ? trim($base->item(0)->nodeValue) : '';
                    $subText  = $sub && $sub->length ? trim($sub->item(0)->nodeValue) : '';
                    $supText  = $sup && $sup->length ? trim($sup->item(0)->nodeValue) : '';
                    $result .= "{$baseText}<sub>{$subText}</sub><sup>{$supText}</sup>";
                    break;

                case 'r': // Math run: m:r contains m:t
                    $t = $xpath->query('m:t', $child);
                    if ($t && $t->length) {
                        $result .= trim($t->item(0)->nodeValue);
                    }
                    break;

                case 'oMath': // Nested oMath
                case 'oMathPara':
                    $result .= $this->extractTextFromMathNode($child, $xpath);
                    break;

                default:
                    // For any other math container, recurse into it
                    $result .= $this->extractTextFromMathNode($child, $xpath);
                    break;
            }
        }

        return $result;
    }

    protected function parseLine($line, &$currentQuestion, &$questions)
    {
        $line = trim($line);
        if (empty($line)) return;

        $isDigitMatch = preg_match('/^\d+[\.\)]\s*(.*)/i', $line, $matches);
        $isOptionMatch = preg_match('/^([A-E])[\.\)]\s*(.*)/i', $line, $matchesOption);
        $isTypeMatch = preg_match('/^(Tipe|Jenis):\s*(.*)/i', $line, $matchesType);
        $isAnswerKeyMatch = preg_match('/^(Kunci|Jawaban|Jawab|Answer):\s*(.*)/i', $line, $matchesKey);

        // Detect New Question
        // Case 1: Starts with Digit (1. or 1))
        // Case 2: No digit, but previous question already has a key (meaning it's the start of a new one)
        if ($isDigitMatch || ($currentQuestion['is_complete'] && !$isOptionMatch && !$isTypeMatch && !$isAnswerKeyMatch)) {
            if (!empty($currentQuestion['text'])) {
                $questions[] = $currentQuestion;
                $currentQuestion = $this->resetQuestion();
            }
            $currentQuestion['text'] = $isDigitMatch ? $matches[1] : $line;
        } 
        // Detect Options (A. B. C. D. E.)
        elseif ($isOptionMatch) {
            $key = strtolower($matchesOption[1]);
            $val = trim($matchesOption[2]);

            if ($currentQuestion['type'] === 'menjodohkan' && strpos($val, '|') !== false) {
                [$left, $right] = explode('|', $val, 2);
                $currentQuestion['options']["left_$key"] = trim($left);
                $currentQuestion['options']["right_$key"] = trim($right);
                
                $currentMap = $currentQuestion['answer_key'] ? json_decode($currentQuestion['answer_key'], true) : [];
                $currentMap[$key] = $key;
                $currentQuestion['answer_key'] = json_encode($currentMap);
            } else {
                $currentQuestion['options'][$key] = $val;
                if ($currentQuestion['type'] === 'essay') {
                    $currentQuestion['type'] = 'pilihan_ganda';
                }
            }
        }
        // Detect Question Type
        elseif ($isTypeMatch) {
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
        }
        // Detect Answer Key
        elseif ($isAnswerKeyMatch) {
            $currentQuestion['answer_key'] = str_replace(' ', '', strtolower(trim($matchesKey[2])));
            $currentQuestion['is_complete'] = true; // Mark as potentially finished
        }
        // Otherwise append to current question text
        else {
            if (empty($currentQuestion['text'])) {
                $currentQuestion['text'] = $line;
            } else {
                $currentQuestion['text'] .= ' ' . $line;
            }
        }
    }

    protected function saveImage($imageElement)
    {
        $imageData = $imageElement->getImageString();
        $extension = $imageElement->getImageExtension();
        $fileName = 'questions/' . Str::random(40) . '.' . $extension;
        Storage::disk('public')->put($fileName, $imageData);
        return $fileName;
    }

    protected function resetQuestion()
    {
        return [
            'type' => 'essay',
            'text' => '',
            'options' => [
                'a' => '', 'b' => '', 'c' => '', 'd' => '', 'e' => ''
            ],
            'answer_key' => '',
            'is_complete' => false,
        ];
    }
}
