<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\ExamSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamResultController extends Controller
{
    public function index()
    {
        // Only show sessions that use question banks owned by this Guru
        $sessions = ExamSession::with(['exam.questionBank'])
            ->whereHas('exam.questionBank', fn($q) => $q->where('user_id', auth()->id()))
            ->latest()
            ->get();

        return Inertia::render('Guru/Results/Index', [
            'sessions' => $sessions
        ]);
    }

    public function show($id)
    {
        // Load the session with participants and their scores
        $session = ExamSession::with([
            'exam.questionBank.questions',
            'examUsers.user',
            'examUsers.answers.question'
        ])->findOrFail($id);

        return Inertia::render('Guru/Results/Show', [
            'session' => $session
        ]);
    }
}
