<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use App\Models\Question;
use App\Models\StudentAnswer;
use Inertia\Inertia;

class QuestionAnalysisController extends Controller
{
    public function show($questionBankId)
    {
        $questionBank = QuestionBank::with('questions')->findOrFail($questionBankId);

        if ($questionBank->user_id !== auth()->id()) {
            abort(403);
        }

        $analysis = [];

        foreach ($questionBank->questions as $question) {
            $answers = StudentAnswer::where('question_id', $question->id)
                ->with('examSessionUser')
                ->get();
            
            $totalAnswers = $answers->count();

            if ($question->type === 'pilihan_ganda' && $totalAnswers > 0) {
                // 1. Tingkat Kesukaran (P)
                $correctCount = $answers->where('is_correct', true)->count();
                $difficultyLevel = round($correctCount / $totalAnswers, 2);
                
                $difficultyLabel = match (true) {
                    $difficultyLevel >= 0.7 => 'Mudah',
                    $difficultyLevel >= 0.3 => 'Sedang',
                    default => 'Sukar',
                };

                // 2. Daya Pembeda (D) - Sederhana (Kelompok Atas - Kelompok Bawah)
                // Kita ambil 27% atas dan 27% bawah berdasarkan skor total sesi (jika ada data cukup)
                // Untuk kesederhanaan di MVP ini, kita bagi 50/50 jika data sedikit
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
                    $discriminationIndex >= 0.2 => 'Cukup (Perlu Revisi)',
                    default => 'Buruk (Buang/Ganti)',
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

        return Inertia::render('Proktor/Results/ItemAnalysis', [
            'questionBank' => $questionBank,
            'analysis' => $analysis,
        ]);
    }
}
