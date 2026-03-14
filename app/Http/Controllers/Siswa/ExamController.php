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
            ->where('is_active', true)
            ->where(function ($q) use ($user) {
                $q->where('classroom_id', $user->classroom_id)
                    ->orWhereNull('classroom_id');
            })
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

    public function history()
    {
        $user = auth()->user();
        $passingGrade = (int) (\App\Models\Setting::where('key', 'passing_grade')->first()->value ?? 70);

        $examHistory = \App\Models\ExamSessionUser::with(['examSession.exam', 'examSession.classroom'])
            ->where('user_id', $user->id)
            ->where('status', 'finished')
            ->latest('finished_at')
            ->get();

        return \Inertia\Inertia::render('Siswa/History', [
            'examHistory' => $examHistory,
            'passingGrade' => $passingGrade,
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

        $isFinishing = $request->has('finish') && $request->finish;
        $examSessionUser->update(['status' => $isFinishing ? 'finished' : 'working']);

        if ($isFinishing) {
            $examSessionUser->update(['finished_at' => now()]);

            // === Auto-Scoring untuk Pilihan Ganda ===
            $this->calculateScore($examSessionUser);

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

    /**
     * Hitung skor otomatis untuk pilihan ganda.
     * Essay tidak dinilai otomatis (perlu koreksi manual oleh Guru).
     */
    private function calculateScore(\App\Models\ExamSessionUser $examSessionUser): void
    {
        $answers = $examSessionUser->answers()->with('question')->get();

        if ($answers->isEmpty()) {
            return;
        }

        $totalScore = 0;
        $maxScore = 0;

        foreach ($answers as $studentAnswer) {
            $question = $studentAnswer->question;
            if (!$question) {
                continue;
            }

            $maxScore += $question->score_default;

            if ($question->type === 'pilihan_ganda') {
                // Bandingkan jawaban siswa dengan kunci jawaban (case-insensitive, trim)
                $isCorrect = strtolower(trim($studentAnswer->answer_text ?? ''))
                    === strtolower(trim($question->answer_key ?? ''));

                $studentAnswer->update([
                    'is_correct' => $isCorrect,
                    'score' => $isCorrect ? $question->score_default : 0,
                ]);

                if ($isCorrect) {
                    $totalScore += $question->score_default;
                }
            }
            // Essay: is_correct dan score tetap null/0, perlu koreksi manual
        }

        // Hitung skor persentase (0-100)
        $percentageScore = $maxScore > 0 ? round(($totalScore / $maxScore) * 100) : 0;

        $examSessionUser->update(['score' => $percentageScore]);
    }
}
