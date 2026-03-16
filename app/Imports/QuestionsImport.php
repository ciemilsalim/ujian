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
            $type = ($row['tipe'] ?? 'pilihan_ganda') === 'essay' ? 'essay' : 'pilihan_ganda';
            
            // Handle Images for this row if any
            if (isset($this->drawings[$actualRowNumber])) {
                foreach ($this->drawings[$actualRowNumber] as $imagePath) {
                    $questionText .= '<br><img src="' . asset('storage/' . $imagePath) . '" class="max-w-full h-auto mt-2 rounded-lg py-2 block">';
                }
            }

            $options = null;
            if ($type === 'pilihan_ganda') {
                $options = [
                    'a' => $row['opsi_a'] ?? '',
                    'b' => $row['opsi_b'] ?? '',
                    'c' => $row['opsi_c'] ?? '',
                    'd' => $row['opsi_d'] ?? '',
                    'e' => $row['opsi_e'] ?? '',
                ];
            }

            Question::create([
                'question_bank_id' => $this->questionBankId,
                'type' => $type,
                'question_text' => $questionText,
                'options' => $options,
                'answer_key' => strtolower(trim($row['kunci'] ?? '')),
                'score_default' => (int) ($row['skor'] ?? 1),
            ]);
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
