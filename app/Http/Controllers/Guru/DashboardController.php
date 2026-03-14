<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use App\Models\Question;
use App\Models\ExamSession;
use App\Models\ExamSessionUser;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        // Statistik Bank Soal milik guru ini
        $totalQuestionBanks = QuestionBank::where('user_id', $userId)->count();
        $totalQuestions = Question::whereHas('questionBank', fn($q) => $q->where('user_id', $userId))->count();

        // Statistik ujian yang menggunakan bank soal guru ini
        $relatedSessions = ExamSession::whereHas('exam.questionBank', fn($q) => $q->where('user_id', $userId));
        $totalSessions = $relatedSessions->count();
        $totalParticipants = ExamSessionUser::whereHas('examSession.exam.questionBank', fn($q) => $q->where('user_id', $userId))->count();

        // Rata-rata skor dari semua peserta ujian guru ini
        $avgScore = ExamSessionUser::whereHas('examSession.exam.questionBank', fn($q) => $q->where('user_id', $userId))
            ->whereNotNull('score')
            ->avg('score');

        // Sesi terbaru
        $recentSessions = ExamSession::with(['exam.questionBank'])
            ->whereHas('exam.questionBank', fn($q) => $q->where('user_id', $userId))
            ->withCount('examUsers as participants_count')
            ->withCount([
                'examUsers as finished_count' => function ($q) {
                    $q->where('status', 'finished');
                }
            ])
            ->latest()
            ->take(5)
            ->get();

        return \Inertia\Inertia::render('Guru/Dashboard', [
            'stats' => [
                'totalQuestionBanks' => $totalQuestionBanks,
                'totalQuestions' => $totalQuestions,
                'totalSessions' => $totalSessions,
                'totalParticipants' => $totalParticipants,
                'avgScore' => $avgScore ? round($avgScore, 1) : 0,
            ],
            'recentSessions' => $recentSessions,
        ]);
    }
}
