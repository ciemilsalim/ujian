<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use App\Models\Question;
use App\Models\StudentAnswer;
use Inertia\Inertia;

class QuestionAnalysisController extends Controller
{
    public function show($id)
    {
        $data = $this->getAnalysisData($id);
        
        return Inertia::render('Proktor/Results/ItemAnalysis', [
            'questionBank' => $data['questionBank'],
            'analysis' => $data['analysis'],
            'session' => $data['session'],
        ]);
    }

    public function exportWord($id)
    {
        $data = $this->getAnalysisData($id);
        $questionBank = $data['questionBank'];
        $analysis = $data['analysis'];
        $session = $data['session'];

        $phpWord = new \PhpOffice\PhpWord\PhpWord();
        $section = $phpWord->addSection([
            'marginTop' => 1200,
            'marginBottom' => 1200,
            'marginLeft' => 1200,
            'marginRight' => 1200,
        ]);

        // Header
        $section->addText('LAPORAN ANALISIS BUTIR SOAL', ['bold' => true, 'size' => 16], ['alignment' => 'center']);
        $section->addText($session ? $session->name : $questionBank->name, ['bold' => true, 'size' => 12], ['alignment' => 'center']);
        if ($session) {
            $section->addText($session->exam->title, ['size' => 10], ['alignment' => 'center']);
        }
        $section->addTextBreak(1);

        // Info Table
        $table = $section->addTable(['cellMargin' => 80]);
        $table->addRow();
        $table->addCell(2000)->addText('Mata Pelajaran');
        $table->addCell(100)->addText(':');
        $table->addCell(6000)->addText($questionBank->subject->name ?? '-', ['bold' => true]);
        
        $table->addRow();
        $table->addCell(2000)->addText('Jumlah Soal');
        $table->addCell(100)->addText(':');
        $table->addCell(6000)->addText(count($analysis) . ' Butir');

        $section->addTextBreak(1);

        // Analysis Table
        $styleTable = ['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 80];
        $styleHeader = ['bold' => true, 'fill' => 'F2F2F2'];
        $phpWord->addTableStyle('AnalysisTable', $styleTable);
        $table = $section->addTable('AnalysisTable');

        $table->addRow();
        $table->addCell(800, $styleHeader)->addText('No', ['bold' => true], ['alignment' => 'center']);
        $table->addCell(4000, $styleHeader)->addText('Butir Soal', ['bold' => true]);
        $table->addCell(1500, $styleHeader)->addText('Kesukaran (P)', ['bold' => true], ['alignment' => 'center']);
        $table->addCell(1500, $styleHeader)->addText('Daya Pembeda (D)', ['bold' => true], ['alignment' => 'center']);
        $table->addCell(1200, $styleHeader)->addText('Respon', ['bold' => true], ['alignment' => 'center']);

        foreach ($analysis as $index => $item) {
            $table->addRow();
            $table->addCell(800)->addText($index + 1, null, ['alignment' => 'center']);
            
            // Clean HTML from question text
            $text = strip_tags($item['question_text']);
            $table->addCell(4000)->addText($text);
            
            $table->addCell(1500)->addText($item['difficulty']['index'] . "\n(" . $item['difficulty']['label'] . ")", null, ['alignment' => 'center']);
            $table->addCell(1500)->addText($item['discrimination']['index'] . "\n(" . $item['discrimination']['label'] . ")", null, ['alignment' => 'center']);
            $table->addCell(1200)->addText($item['total_answers'], null, ['alignment' => 'center']);
        }

        $fileName = 'Analisis_Butir_Soal_' . ($session ? $session->name : $questionBank->name) . '.docx';
        $writer = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');

        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName);
    }

    private function getAnalysisData($id)
    {
        $sessionId = null;
        $session = null;
        if (request()->routeIs('proktor.results.item-analysis') || request()->routeIs('proktor.results.item-analysis-export')) {
            $sessionId = $id;
            $session = \App\Models\ExamSession::with(['exam.questionBank.questions', 'exam.questionBank.subject'])->findOrFail($sessionId);
            $questionBank = $session->exam->questionBank;
        } else {
            $questionBank = QuestionBank::with(['questions', 'subject'])->findOrFail($id);
            if ($questionBank->user_id !== auth()->id() && !auth()->user()->isProktor()) {
                abort(403);
            }
        }

        $analysis = [];

        foreach ($questionBank->questions as $question) {
            $query = StudentAnswer::where('question_id', $question->id);
            
            if ($sessionId) {
                $query->whereHas('examSessionUser', function($q) use ($sessionId) {
                    $q->where('exam_session_id', $sessionId);
                });
            }

            $answers = $query->with('examSessionUser')->get();
            $totalAnswers = $answers->count();

            if ($question->type === 'pilihan_ganda' && $totalAnswers > 0) {
                $correctCount = $answers->where('is_correct', true)->count();
                $difficultyLevel = round($correctCount / $totalAnswers, 2);
                
                $difficultyLabel = match (true) {
                    $difficultyLevel >= 0.7 => 'Mudah',
                    $difficultyLevel >= 0.3 => 'Sedang',
                    default => 'Sukar',
                };

                $sortedAnswers = $answers->sortByDesc(function($a) {
                    return $a->examSessionUser->score ?? 0;
                });
                
                $n = floor($totalAnswers * 0.27) ?: 1;
                $upperGroup = $sortedAnswers->take($n);
                $lowerGroup = $sortedAnswers->take(-$n);
                
                $upperCorrect = $upperGroup->where('is_correct', true)->count();
                $lowerCorrect = $lowerGroup->where('is_correct', true)->count();
                
                $discriminationIndex = round(($upperCorrect - $lowerCorrect) / $n, 2);
                
                $discriminationLabel = match (true) {
                    $discriminationIndex >= 0.4 => 'Sangat Baik',
                    $discriminationIndex >= 0.3 => 'Baik',
                    $discriminationIndex >= 0.2 => 'Cukup',
                    default => 'Buruk',
                };

                $analysis[] = [
                    'id' => $question->id,
                    'question_text' => $question->question_text,
                    'type' => $question->type,
                    'difficulty' => [
                        'index' => $difficultyLevel,
                        'label' => $difficultyLabel
                    ],
                    'discrimination' => [
                        'index' => $discriminationIndex,
                        'label' => $discriminationLabel
                    ],
                    'total_answers' => $totalAnswers,
                    'correct_count' => $correctCount
                ];
            }
        }

        return [
            'questionBank' => $questionBank,
            'analysis' => $analysis,
            'session' => $session
        ];
    }
}
