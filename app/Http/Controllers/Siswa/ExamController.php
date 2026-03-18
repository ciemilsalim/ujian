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
            ->where('end_time', '>', now()) // Hanya tampilkan yang belum berakhir
            ->where(function ($q) use ($user) {
                $q->where('classroom_id', $user->classroom_id)
                    ->orWhereNull('classroom_id');
            })
            ->orderBy('start_time', 'asc') // Urutkan yang terdekat lebih dulu
            ->get();

        // Security: Clear exam tokens when returning to dashboard
        // Student must re-enter token to resume or start an exam
        session()->forget('exam_tokens');

        return \Inertia\Inertia::render('Siswa/Dashboard', [
            'sessions' => $sessions
        ]);
    }

    public function show($id, Request $request)
    {
        $session = \App\Models\ExamSession::with(['exam.questionBank.subject', 'classroom', 'exam.questionBank.questions'])->findOrFail($id);

        // Validasi waktu akses
        $now = now();
        if ($now->lt($session->start_time)) {
            return redirect()->route('siswa.dashboard')->with('error', 'Ujian ini belum dimulai. Silakan tunggu hingga waktu yang ditentukan.');
        }

        if ($now->gt($session->end_time)) {
            return redirect()->route('siswa.dashboard')->with('error', 'Maaf, batas waktu untuk memulai ujian ini telah berakhir.');
        }

        // Initialize session record for user if not exists
        $examUser = \App\Models\ExamSessionUser::with(['user.classroom'])->firstOrCreate(
            ['exam_session_id' => $id, 'user_id' => auth()->id()],
            ['status' => 'working']
        );

        // Clear Information for Finished Exams
        if ($examUser->status === 'finished') {
            return \Inertia\Inertia::render('Siswa/Exam/Finished', [
                'session' => [
                    'id' => $session->id,
                    'name' => $session->name,
                    'exam' => ['title' => $session->exam->title]
                ],
                'examUser' => $examUser,
                'maxCheatWarnings' => (int) (\App\Models\Setting::where('key', 'max_cheat_warnings')->first()->value ?? 3),
            ]);
        }

        // Token Protection Check
        $tokens = session('exam_tokens', []);
        $tokenVerified = $tokens[$id] ?? false;
        
        if (!$tokenVerified && $session->token) {
            return \Inertia\Inertia::render('Siswa/Exam/EnterToken', [
                'session' => [
                    'id' => $session->id,
                    'name' => $session->name,
                    'exam' => ['title' => $session->exam->title]
                ]
            ]);
        }

        // Randomize questions if enabled
        if ($session->exam->random_question) {
            $userId = auth()->id();
            $sessionId = $session->id;
            
            $shuffledQuestions = $session->exam->questionBank->questions->sortBy(function ($question) use ($userId, $sessionId) {
                // Menggunakan md5 untuk pengacakan deterministik yang konsisten per user & session
                return md5($question->id . '_' . $userId . '_' . $sessionId);
            })->values();
            
            $session->exam->questionBank->setRelation('questions', $shuffledQuestions);
        }

        // Initializing session record handled above

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

        // Initialize started_at if null to start the absolute timer
        if (!$examUser->started_at) {
            $examUser->update(['started_at' => now()]);
        }

        // Calculate absolute time left in seconds
        $durationInSeconds = ($session->exam->duration ?? 0) * 60;
        $elapsedSeconds = $examUser->started_at->diffInSeconds(now());
        $timeLeft = max(0, $durationInSeconds - $elapsedSeconds);

        if ($timeLeft <= 0 && $examUser->status !== 'finished') {
            $examUser->update(['status' => 'finished', 'finished_at' => now()]);
            return redirect()->route('siswa.dashboard')->with('error', 'Waktu ujian Anda telah habis.');
        }

        if ($examUser->status === 'finished') {
            // Repetition handled by the check at the top
            return redirect()->route('siswa.dashboard');
        }

        // Fetch existing answers to restore the state if student refreshes the tab
        $existingAnswers = \App\Models\StudentAnswer::where('exam_session_user_id', $examUser->id)
            ->pluck('answer_text', 'question_id')
            ->toArray();

        // Fetch all application settings
        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();

        return \Inertia\Inertia::render('Siswa/Exam/Show', [
            'session' => $session,
            'examUser' => $examUser,
            'serverTimeLeft' => $timeLeft,
            'existingAnswers' => $existingAnswers,
            'settings' => $settings
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

        // Security: Clear exam tokens when viewing history
        session()->forget('exam_tokens');

        return \Inertia\Inertia::render('Siswa/History', [
            'examHistory' => $examHistory,
            'passingGrade' => $passingGrade,
            'maxCheatWarnings' => (int) (\App\Models\Setting::where('key', 'max_cheat_warnings')->first()->value ?? 3),
        ]);
    }

    public function verifyToken(Request $request)
    {
        $request->validate([
            'exam_session_id' => 'required|exists:exam_sessions,id',
            'token' => 'required|string|size:6',
        ]);

        $session = \App\Models\ExamSession::findOrFail($request->exam_session_id);

        if (strtoupper($request->token) !== $session->token) {
            return back()->withErrors(['token' => 'Token yang Anda masukkan tidak valid atau sudah kedaluwarsa.']);
        }

        // Store verification in user session
        $tokens = session('exam_tokens', []);
        $tokens[$session->id] = true;
        session(['exam_tokens' => $tokens]);

        return redirect()->route('siswa.exams.show', $session->id)->with('success', 'Token berhasil diverifikasi.');
    }
    public function reportCheat(Request $request)
    {
        $request->validate([
            'exam_session_id' => 'required|exists:exam_sessions,id',
            'type' => 'required|string',
        ]);

        $examSessionUser = \App\Models\ExamSessionUser::where('exam_session_id', $request->exam_session_id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if ($examSessionUser->status === 'finished') {
            return response()->json(['status' => 'ignored']);
        }

        // Increment cheat warnings
        $examSessionUser->increment('cheat_warnings');
        $examSessionUser->refresh();

        \App\Events\StudentCheatDetected::dispatch(
            $request->exam_session_id,
            auth()->id(),
            auth()->user()->name,
            $request->type . ' (Peringatan ke-' . $examSessionUser->cheat_warnings . ')'
        );

        // Auto Disqualification based on max_cheat_warnings setting
        $maxWarnings = (int) (\App\Models\Setting::where('key', 'max_cheat_warnings')->first()->value ?? 3);

        if ($examSessionUser->cheat_warnings >= $maxWarnings) {
            $examSessionUser->update([
                'status' => 'finished',
                'finished_at' => now(),
                'score' => 0, // Set skor ke 0 jika diskualifikasi
            ]);

            \App\Events\StudentExamUpdated::dispatch(
                $examSessionUser->exam_session_id,
                $examSessionUser->user_id,
                auth()->user()->name,
                'finished'
            );

            return response()->json([
                'status' => 'disqualified',
                'message' => 'Anda didiskualifikasi karena terlalu banyak indikasi kecurangan.'
            ]);
        }

        return response()->json(['status' => 'success', 'warnings' => $examSessionUser->cheat_warnings]);
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

        // Guard: Jangan proses apapun jika ujian siswa sudah selesai
        if ($examSessionUser->status === 'finished') {
            if ($request->expectsJson()) {
                return response()->json(['status' => 'already_finished']);
            }
            return redirect()->route('siswa.dashboard');
        }

        // Server-side time check
        $durationInSeconds = ($examSessionUser->examSession->exam->duration ?? 0) * 60;
        $elapsedSeconds = $examSessionUser->started_at->diffInSeconds(now());
        if ($elapsedSeconds > $durationInSeconds + 30) { // Beri toleransi 30 detik untuk network lag
            $examSessionUser->update(['status' => 'finished', 'finished_at' => now()]);
            if ($request->expectsJson()) {
                return response()->json(['status' => 'time_up', 'message' => 'Waktu ujian telah habis.']);
            }
            return redirect()->route('siswa.dashboard')->with('error', 'Waktu ujian telah habis.');
        }

        // Validasi sesi masih aktif sebelum menyimpan jawaban
        $session = \App\Models\ExamSession::find($request->exam_session_id);
        if (!$session || !$session->is_active) {
            if ($request->expectsJson()) {
                return response()->json(['status' => 'session_inactive', 'message' => 'Sesi ujian sudah tidak aktif. Hubungi Proktor.'], 403);
            }
            return redirect()->route('siswa.dashboard')->with('error', 'Sesi ujian sudah tidak aktif.');
        }

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
            } elseif ($question->type === 'pilihan_ganda_kompleks') {
                // PGK: Jawaban dan Kunci biasanya format "a,c,d"
                $studentAnswers = explode(',', strtolower(trim($studentAnswer->answer_text ?? '')));
                $correctKeys = explode(',', strtolower(trim($question->answer_key ?? '')));
                
                sort($studentAnswers);
                sort($correctKeys);
                
                $isCorrect = ($studentAnswers === $correctKeys);
                
                $studentAnswer->update([
                    'is_correct' => $isCorrect,
                    'score' => $isCorrect ? $question->score_default : 0,
                ]);

                if ($isCorrect) {
                    $totalScore += $question->score_default;
                }
            } elseif ($question->type === 'isian_singkat') {
                // Isian Singkat: Case-insensitive match
                $isCorrect = strtolower(trim($studentAnswer->answer_text ?? ''))
                    === strtolower(trim($question->answer_key ?? ''));
                
                $studentAnswer->update([
                    'is_correct' => $isCorrect,
                    'score' => $isCorrect ? $question->score_default : 0,
                ]);

                if ($isCorrect) {
                    $totalScore += $question->score_default;
                }
            } elseif ($question->type === 'menjodohkan') {
                // Menjodohkan: Jawaban disimpan dalam format JSON pasangan
                $isCorrect = (trim($studentAnswer->answer_text ?? '') === trim($question->answer_key ?? ''));
                
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
