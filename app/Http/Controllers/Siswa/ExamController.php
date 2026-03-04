<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $sessions = \App\Models\ExamSession::with('exam')
            ->whereHas('exam.questionBank.subject', function ($q) {}) // Can refine based on classroom
            ->where('is_active', true)
            ->latest()
            ->get();

        return \Inertia\Inertia::render('Siswa/Dashboard', [
            'sessions' => $sessions
        ]);
    }

    public function show($id)
    {
        $session = \App\Models\ExamSession::with(['exam.questionBank.questions'])->findOrFail($id);

        // Initializing session record for user if not exists
        $examUser = \App\Models\ExamSessionUser::with('user')->firstOrCreate(
            ['exam_session_id' => $id, 'user_id' => auth()->id()],
            ['status' => 'working']
        );

        // Session tracking logic
        $currentSessionId = session()->getId();
        if (!$examUser->session_id) {
            $examUser->update(['session_id' => $currentSessionId]);
        } elseif ($examUser->session_id !== $currentSessionId) {
            return redirect()->route('siswa.dashboard')->with('error', 'Akun Anda sedang aktif di perangkat lain. Silakan hubungi Proktor untuk Reset Login.');
        }

        if ($examUser->status !== 'working' && $examUser->status !== 'finished') {
            $examUser->update(['status' => 'working']);
        }

        \App\Events\StudentExamUpdated::dispatch(
            $session->id,
            auth()->id(),
            auth()->user()->name,
            'working'
        );

        return \Inertia\Inertia::render('Siswa/Exam/Show', [
            'session' => $session,
            'examUser' => $examUser
        ]);
    }
    public function reportCheat(Request $request)
    {
        $request->validate([
            'exam_session_id' => 'required|exists:exam_sessions,id',
            'type' => 'required|string',
        ]);

        \App\Events\StudentCheatDetected::dispatch(
            $request->exam_session_id,
            auth()->id(),
            auth()->user()->name,
            $request->type
        );

        return response()->json(['status' => 'success']);
    }

    public function submitAnswer(Request $request)
    {
        $request->validate([
            'exam_session_id' => 'required|exists:exam_sessions,id',
            'answers' => 'required|array',
        ]);

        $examSessionUser = \App\Models\ExamSessionUser::where('exam_session_id', $request->exam_session_id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        foreach ($request->answers as $questionId => $answer) {
            \App\Models\StudentAnswer::updateOrCreate(
                ['exam_session_user_id' => $examSessionUser->id, 'question_id' => $questionId],
                ['answer_text' => $answer]
            );
        }

        $examSessionUser->update(['status' => ($request->has('finish') && $request->finish) ? 'finished' : 'working']);

        if ($request->has('finish') && $request->finish) {
            $examSessionUser->update([
                'finished_at' => now()
            ]);

            \App\Events\StudentExamUpdated::dispatch(
                $examSessionUser->exam_session_id,
                $examSessionUser->user_id,
                auth()->user()->name,
                'finished'
            );

            return redirect()->route('siswa.dashboard')->with('success', 'Ujian telah diselesaikan.');
        }

        \App\Events\StudentExamUpdated::dispatch(
            $examSessionUser->exam_session_id,
            $examSessionUser->user_id,
            auth()->user()->name,
            'working'
        );

        return redirect()->back();
    }
}
