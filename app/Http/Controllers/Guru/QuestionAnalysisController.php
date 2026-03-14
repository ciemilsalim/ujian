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
            $totalAnswers = StudentAnswer::where('question_id', $question->id)->count();

            if ($question->type === 'pilihan_ganda') {
                $correctCount = StudentAnswer::where('question_id', $question->id)
                    ->where('is_correct', true)
                    ->count();

                // Tingkat kesulitan: persentase siswa yang menjawab benar
                $difficultyLevel = $totalAnswers > 0 ? round(($correctCount / $totalAnswers) * 100, 1) : 0;

                // Klasifikasi tingkat kesulitan
                $difficultyLabel = match (true) {
                    $difficultyLevel >= 70 => 'Mudah',
                    $difficultyLevel >= 30 => 'Sedang',
                    default => 'Sulit',
                };

                // Distribusi jawaban per opsi
                $optionDistribution = [];
                if ($question->options) {
                    foreach (array_keys($question->options) as $opt) {
                        $optionDistribution[$opt] = StudentAnswer::where('question_id', $question->id)
                            ->where('answer_text', $opt)
                            ->count();
                    }
                }

                $analysis[] = [
                    'id' => $question->id,
                    'question_text' => $question->question_text,
                    'type' => $question->type,
                    'answer_key' => $question->answer_key,
                    'total_answers' => $totalAnswers,
                    'correct_count' => $correctCount,
                    'difficulty_level' => $difficultyLevel,
                    'difficulty_label' => $difficultyLabel,
                    'option_distribution' => $optionDistribution,
                ];
            } else {
                // Essay — hanya tampilkan total yang telah dinilai
                $scoredCount = StudentAnswer::where('question_id', $question->id)
                    ->whereNotNull('is_correct')
                    ->count();
                $avgScore = StudentAnswer::where('question_id', $question->id)
                    ->whereNotNull('score')
                    ->avg('score');

                $analysis[] = [
                    'id' => $question->id,
                    'question_text' => $question->question_text,
                    'type' => $question->type,
                    'total_answers' => $totalAnswers,
                    'scored_count' => $scoredCount,
                    'avg_score' => $avgScore ? round($avgScore, 1) : 0,
                ];
            }
        }

        return Inertia::render('Guru/Questions/Analysis', [
            'questionBank' => $questionBank,
            'analysis' => $analysis,
        ]);
    }
}
