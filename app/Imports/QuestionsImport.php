<?php

namespace App\Imports;

use App\Models\Question;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;

class QuestionsImport implements ToCollection, WithHeadingRow, WithEvents
{
    protected $questionBankId;
    protected $drawings = [];
    public $successCount = 0;
    public $errorCount = 0;

    public function __construct($questionBankId)
    {
        $this->questionBankId = $questionBankId;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            // Index heading row is ignored, so we need to offset based on start row
            // Maatwebsite Excel WithHeadingRow starts collection from row 2
            $actualRowNumber = $index + 2; 

            $questionText = (string)($row['pertanyaan'] ?? '');
            $rawTypeInput = (string)($row['tipe'] ?? '');
            $cleanType = mb_strtolower(trim(str_replace(['-', '/', '_', ' '], '', $rawTypeInput)), 'UTF-8');

            if (in_array($cleanType, [
                'benarsalah', 'bs', 'tf', 'truefalse', 'pernyataanbenarsalah', 'pernyataanbenar', 'benar',
                'صحيحخطأ', 'صحخطأ', 'صحيحوخطأ', 'صحوخطأ', 'صحيحاوخطأ', 'صحاوخطأ', 'صخ', 'صحيح', 'صح'
            ])) {
                $type = 'benar_salah';
            } elseif (in_array($cleanType, ['pilihangandakompleks', 'pgkompleks', 'pgk'])) {
                $type = 'pilihan_ganda_kompleks';
            } elseif (in_array($cleanType, ['isiansingkat', 'isian', 'singkat'])) {
                $type = 'isian_singkat';
            } elseif (in_array($cleanType, ['menjodohkan', 'jodohkan', 'match'])) {
                $type = 'menjodohkan';
            } elseif (in_array($cleanType, ['essay', 'uraian', 'مقال', 'مقالي'])) {
                $type = 'essay';
            } elseif (in_array($cleanType, ['pilihanganda', 'pg', 'اختيارمنمتعدد'])) {
                $type = 'pilihan_ganda';
            } elseif (in_array($rawTypeInput, ['pilihan_ganda', 'pilihan_ganda_kompleks', 'benar_salah', 'isian_singkat', 'menjodohkan', 'essay'])) {
                $type = $rawTypeInput;
            } else {
                $type = 'pilihan_ganda';
            }

            // Auto-detect benar_salah if key has true/false indicators (Latin & Arabic)
            $rawKey = trim((string)($row['kunci'] ?? ''));
            $lowerKey = mb_strtolower($rawKey, 'UTF-8');
            if ($type === 'pilihan_ganda' || empty($cleanType)) {
                if (
                    str_contains($lowerKey, 'benar') || 
                    str_contains($lowerKey, 'salah') || 
                    str_contains($lowerKey, 'صحيح') || 
                    str_contains($lowerKey, 'خطأ') || 
                    str_contains($lowerKey, 'خطا') || 
                    str_contains($lowerKey, 'صح') || 
                    preg_match('/^[a-eأ-ه]:[bsصخ]([,;،][a-eأ-ه]:[bsصخ])*$/iu', str_replace(' ', '', $lowerKey))
                ) {
                    $type = 'benar_salah';
                }
            }
            
            // Format plain fractions (e.g. (1/2) -> math-frac) unless already HTML
            if (!str_contains($questionText, 'math-frac')) {
                $questionText = preg_replace(
                    '/\((\d+)\/(\d+)\)/',
                    '<span class="math-frac"><span class="math-num">$1</span><span class="math-den">$2</span></span>',
                    $questionText
                );
            }

            // Handle Images for this row if any
            if (isset($this->drawings[$actualRowNumber])) {
                foreach ($this->drawings[$actualRowNumber] as $imagePath) {
                    $questionText .= '<br><img src="/storage/' . $imagePath . '" class="max-w-full h-auto mt-2 rounded-lg py-2 block">';
                }
            }

            $options = null;
            if ($type === 'pilihan_ganda' || $type === 'pilihan_ganda_kompleks' || $type === 'benar_salah') {
                $options = array_filter([
                    'a' => (string)($row['opsi_a'] ?? ''),
                    'b' => (string)($row['opsi_b'] ?? ''),
                    'c' => (string)($row['opsi_c'] ?? ''),
                    'd' => (string)($row['opsi_d'] ?? ''),
                    'e' => (string)($row['opsi_e'] ?? ''),
                ], function($value) {
                    return !is_null($value) && trim($value) !== '';
                });

                // Format plain fractions in options
                foreach ($options as $k => $optVal) {
                    if (!str_contains($optVal, 'math-frac')) {
                        $options[$k] = preg_replace(
                            '/\((\d+)\/(\d+)\)/',
                            '<span class="math-frac"><span class="math-num">$1</span><span class="math-den">$2</span></span>',
                            $optVal
                        );
                    }
                }
            } elseif ($type === 'menjodohkan') {
                $options = [];
                foreach (['a', 'b', 'c', 'd', 'e'] as $opt) {
                    $raw = (string)($row["opsi_$opt"] ?? '');
                    if (strpos($raw, '|') !== false) {
                        [$left, $right] = explode('|', $raw, 2);
                        $options["left_$opt"] = trim($left);
                        $options["right_$opt"] = trim($right);
                    }
                }
            }

            // Normalize answer key
            if ($type === 'benar_salah') {
                $answerKey = Question::normalizeBenarSalahKey($rawKey, $options ?: []);
            } elseif ($type === 'menjodohkan') {
                $answerKey = str_replace(' ', '', strtolower(trim($rawKey)));
                if (empty($answerKey)) {
                    $answerMap = [];
                    foreach (['a', 'b', 'c', 'd', 'e'] as $opt) {
                        if (isset($options["left_$opt"])) {
                            $answerMap[$opt] = $opt; // Default assume same index match
                        }
                    }
                    $answerKey = json_encode($answerMap);
                }
            } else {
                $answerKey = str_replace(' ', '', strtolower(trim($rawKey)));
            }

            try {
                if (empty(trim($questionText))) {
                    $this->errorCount++;
                    continue;
                }

                Question::create([
                    'question_bank_id' => $this->questionBankId,
                    'type' => $type,
                    'question_text' => $questionText,
                    'options' => $options,
                    'answer_key' => $answerKey,
                    'score_default' => (int) ($row['skor'] ?? 1),
                ]);
                $this->successCount++;
            } catch (\Exception $e) {
                $this->errorCount++;
            }
        }
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                foreach ($sheet->getDrawingCollection() as $drawing) {
                    // Get coordinates
                    $coordinates = $drawing->getCoordinates(); // e.g., A5
                    preg_match('/[A-Z]+(\d+)/', $coordinates, $matches);
                    $rowNumber = isset($matches[1]) ? (int)$matches[1] : null;

                    if ($rowNumber) {
                        // Extract image
                        if ($drawing instanceof \PhpOffice\PhpSpreadsheet\Worksheet\MemoryDrawing) {
                            ob_start();
                            call_user_func($drawing->getRenderingFunction(), $drawing->getImageResource());
                            $imageContents = ob_get_contents();
                            ob_end_clean();
                            $extension = 'png';
                        } elseif ($drawing instanceof \PhpOffice\PhpSpreadsheet\Worksheet\Drawing) {
                            $imageContents = file_get_contents($drawing->getPath());
                            $extension = $drawing->getExtension();
                        }

                        if (isset($imageContents)) {
                            $fileName = 'questions/' . Str::random(40) . '.' . $extension;
                            Storage::disk('public')->put($fileName, $imageContents);
                            $this->drawings[$rowNumber][] = $fileName;
                        }
                    }
                }
            },
        ];
    }
}
