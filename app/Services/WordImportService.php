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

class WordImportService
{
    public function import($filePath, $questionBankId)
    {
        $phpWord = IOFactory::load($filePath);
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

        $count = 0;
        foreach ($questions as $qData) {
            Question::create([
                'question_bank_id' => $questionBankId,
                'type' => $qData['type'],
                'question_text' => $qData['text'],
                'options' => $qData['type'] === 'pilihan_ganda' ? $qData['options'] : null,
                'answer_key' => $qData['answer_key'] ?? 'a',
                'score_default' => 1,
            ]);
            $count++;
        }

        return $count;
    }

    protected function processElement($element, &$currentQuestion, &$questions)
    {
        if ($element instanceof TextRun) {
            $text = '';
            $hasImage = false;
            foreach ($element->getElements() as $child) {
                if ($child instanceof Text) {
                    $text .= $child->getText();
                } elseif ($child instanceof Image) {
                    $imagePath = $this->saveImage($child);
                    $text .= '<br><img src="' . asset('storage/' . $imagePath) . '" class="max-w-full h-auto mt-2 rounded-lg py-2 block">';
                    $hasImage = true;
                }
            }

            $this->parseLine($text, $currentQuestion, $questions);
        } elseif ($element instanceof Text) {
            $this->parseLine($element->getText(), $currentQuestion, $questions);
        } elseif ($element instanceof Table) {
            foreach ($element->getRows() as $row) {
                foreach ($row->getCells() as $cell) {
                    foreach ($cell->getElements() as $cellElement) {
                        $this->processElement($cellElement, $currentQuestion, $questions);
                    }
                }
            }
        }
    }

    protected function parseLine($line, &$currentQuestion, &$questions)
    {
        $line = trim($line);
        if (empty($line)) return;

        // Detect New Question (Starst with Digit + dot or brace, e.g., 1. or 1))
        if (preg_match('/^\d+[\.\)]\s*(.*)/i', $line, $matches)) {
            if (!empty($currentQuestion['text'])) {
                $questions[] = $currentQuestion;
                $currentQuestion = $this->resetQuestion();
            }
            $currentQuestion['text'] = $matches[1];
        } 
        // Detect Options (A. B. C. D. E.)
        elseif (preg_match('/^([A-E])[\.\)]\s*(.*)/i', $line, $matches)) {
            $key = strtolower($matches[1]);
            $currentQuestion['options'][$key] = $matches[2];
            $currentQuestion['type'] = 'pilihan_ganda';
        }
        // Detect Answer Key (Kunci: A or Jawab: A)
        elseif (preg_match('/^(Kunci|Jawab|Answer):\s*([A-E])/i', $line, $matches)) {
            $currentQuestion['answer_key'] = strtolower($matches[2]);
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
        $imageData = $imageElement->getImageBlob();
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
        ];
    }
}
