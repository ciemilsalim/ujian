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
        $activeYear = \App\Models\AcademicYear::getActive();
        $academicYearId = $activeYear?->id;

        // Statistik Bank Soal milik guru ini
        $qbQuery = QuestionBank::where('user_id', $userId);
        if ($academicYearId) {
            $qbQuery->where('academic_year_id', $academicYearId);
        }
        $totalQuestionBanks = $qbQuery->count();
        
        $qQuery = Question::whereHas('questionBank', function($q) use ($userId, $academicYearId) {
            $q->where('user_id', $userId);
            if ($academicYearId) {
                $q->where('academic_year_id', $academicYearId);
            }
        });
        $totalQuestions = $qQuery->count();

        // Statistik ujian yang menggunakan bank soal guru ini pada tahun ajaran ini
        $relatedSessions = ExamSession::whereHas('exam', function($q) use ($userId, $academicYearId) {
            $q->whereHas('questionBank', fn($sq) => $sq->where('user_id', $userId));
            if ($academicYearId) {
                $q->where('academic_year_id', $academicYearId);
            }
        });
        $totalSessions = $relatedSessions->count();

        $sessionUserQuery = ExamSessionUser::whereHas('examSession.exam', function($q) use ($userId, $academicYearId) {
            $q->whereHas('questionBank', fn($sq) => $sq->where('user_id', $userId));
            if ($academicYearId) {
                $q->where('academic_year_id', $academicYearId);
            }
        });
        $totalParticipants = (clone $sessionUserQuery)->count();
        $avgScore = (clone $sessionUserQuery)->whereNotNull('score')->avg('score');

        // Sesi terbaru
        $recentSessions = ExamSession::with(['exam.questionBank'])
            ->whereHas('exam', function($q) use ($userId, $academicYearId) {
                $q->whereHas('questionBank', fn($sq) => $sq->where('user_id', $userId));
                if ($academicYearId) {
                    $q->where('academic_year_id', $academicYearId);
                }
            })
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
