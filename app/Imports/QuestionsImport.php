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

            $questionText = $row['pertanyaan'] ?? '';
            $type = $row['tipe'] ?? 'pilihan_ganda';
            if (!in_array($type, ['pilihan_ganda', 'pilihan_ganda_kompleks', 'isian_singkat', 'menjodohkan', 'essay'])) {
                $type = 'pilihan_ganda';
            }
            
            // Handle Images for this row if any
            if (isset($this->drawings[$actualRowNumber])) {
                foreach ($this->drawings[$actualRowNumber] as $imagePath) {
                    $questionText .= '<br><img src="/storage/' . $imagePath . '" class="max-w-full h-auto mt-2 rounded-lg py-2 block">';
                }
            }

            $options = null;
            if ($type === 'pilihan_ganda' || $type === 'pilihan_ganda_kompleks') {
                $options = array_filter([
                    'a' => $row['opsi_a'] ?? '',
                    'b' => $row['opsi_b'] ?? '',
                    'c' => $row['opsi_c'] ?? '',
                    'd' => $row['opsi_d'] ?? '',
                    'e' => $row['opsi_e'] ?? '',
                ], function($value) {
                    return !is_null($value) && trim($value) !== '';
                });
            } elseif ($type === 'menjodohkan') {
                $options = [];
                foreach (['a', 'b', 'c', 'd', 'e'] as $opt) {
                    $raw = $row["opsi_$opt"] ?? '';
                    if (strpos($raw, '|') !== false) {
                        [$left, $right] = explode('|', $raw, 2);
                        $options["left_$opt"] = trim($left);
                        $options["right_$opt"] = trim($right);
                    }
                }
            }

            // For Menjodohkan, build the default answer key if empty
            // Normalize answer key: lower case and remove all spaces for multiple response
            $answerKey = str_replace(' ', '', strtolower(trim($row['kunci'] ?? '')));
            if ($type === 'menjodohkan' && empty($answerKey)) {
                $answerMap = [];
                foreach (['a', 'b', 'c', 'd', 'e'] as $opt) {
                    if (isset($options["left_$opt"])) {
                        $answerMap[$opt] = $opt; // Default assume same index match
                    }
                }
                $answerKey = json_encode($answerMap);
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
