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
                    $text .= '<br><img src="/storage/' . $imagePath . '" class="max-w-full h-auto mt-2 rounded-lg py-2 block">';
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

        $isDigitMatch = preg_match('/^\d+[\.\)]\s*(.*)/i', $line, $matches);
        $isOptionMatch = preg_match('/^([A-E])[\.\)]\s*(.*)/i', $line, $matchesOption);
        $isTypeMatch = preg_match('/^(Tipe|Jenis):\s*(.*)/i', $line, $matchesType);
        $isAnswerKeyMatch = preg_match('/^(Kunci|Jawab|Answer):\s*(.*)/i', $line, $matchesKey);

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
            $currentQuestion['answer_key'] = strtolower(trim($matchesKey[2]));
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
