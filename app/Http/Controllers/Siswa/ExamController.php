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

        // Initialize session record for user if not exists (safe against concurrent requests)
        try {
            $examUser = \App\Models\ExamSessionUser::with(['user.classroom'])->firstOrCreate(
                ['exam_session_id' => $id, 'user_id' => auth()->id()],
                ['status' => 'working']
            );
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            $examUser = \App\Models\ExamSessionUser::with(['user.classroom'])
                ->where('exam_session_id', $id)
                ->where('user_id', auth()->id())
                ->firstOrFail();
        }

        // Clear Information for Finished Exams
        if ($examUser->status === 'finished') {
            return \Inertia\Inertia::render('Siswa/Exam/Finished', [
                'session' => [
                    'id' => $session->id,
                    'name' => $session->name,
                    'exam' => ['title' => $session->exam?->title ?? 'Ujian']
                ],
                'examUser' => $examUser,
                'maxCheatWarnings' => (int) (\App\Models\Setting::where('key', 'max_cheat_warnings')->value('value') ?? 3),
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
                    'exam' => ['title' => $session->exam?->title ?? 'Ujian']
                ]
            ]);
        }

        // Randomize questions if enabled
        if ($session->exam?->random_question && $session->exam?->questionBank?->questions) {
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

        try {
            \App\Events\StudentExamUpdated::dispatch(
                $session->id,
                auth()->id(),
                auth()->user()->name,
                'working'
            );
        } catch (\Throwable $e) {
            // Broadcast failed, but continue with exam
            \Log::warning('Broadcast failed: ' . $e->getMessage());
        }

        // Initialize started_at if null to start the absolute timer
        if (!$examUser->started_at) {
            $nowStarted = now();
            $examUser->update(['started_at' => $nowStarted]);
            $examUser->started_at = $nowStarted;
        }

        // Calculate absolute time left in seconds
        $durationInSeconds = ($session->exam?->duration ?? 0) * 60;
        $startedAt = $examUser->started_at ? \Carbon\Carbon::parse($examUser->started_at) : now();
        $elapsedSeconds = $startedAt->diffInSeconds(now());
        $timeLeft = max(0, $durationInSeconds - $elapsedSeconds);

        if ($durationInSeconds > 0 && $timeLeft <= 0 && $examUser->status !== 'finished') {
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
            'settings' => $settings,
            'isPractice' => (bool) ($session->exam->is_practice ?? false),
        ]);
    }

    public function history()
    {
        $user = auth()->user();
        $passingGrade = (int) (\App\Models\Setting::where('key', 'passing_grade')->value('value') ?? 70);

        $examHistory = \App\Models\ExamSessionUser::with(['examSession.exam', 'examSession.classroom'])
            ->where('user_id', $user->id)
            ->where('status', 'finished')
            // Hanya tampilkan ujian resmi (bukan mode latihan)
            ->whereHas('examSession.exam', fn($q) => $q->where('is_practice', false))
            ->latest('finished_at')
            ->get();

        // Security: Clear exam tokens when viewing history
        session()->forget('exam_tokens');

        return \Inertia\Inertia::render('Siswa/History', [
            'examHistory' => $examHistory,
            'passingGrade' => $passingGrade,
            'maxCheatWarnings' => (int) (\App\Models\Setting::where('key', 'max_cheat_warnings')->value('value') ?? 3),
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
            'type' => 'required|string|max:100',
        ]);

        try {
            $examSessionUser = \App\Models\ExamSessionUser::firstOrCreate(
                [
                    'exam_session_id' => $request->exam_session_id,
                    'user_id' => auth()->id(),
                ],
                [
                    'status' => 'working',
                    'started_at' => now(),
                ]
            );
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            $examSessionUser = \App\Models\ExamSessionUser::where('exam_session_id', $request->exam_session_id)
                ->where('user_id', auth()->id())
                ->firstOrFail();
        }

        // Mode Latihan: tidak ada pencatatan kecurangan
        $session = \App\Models\ExamSession::with('exam')->find($request->exam_session_id);
        if ($session && $session->exam && $session->exam->is_practice) {
            return response()->json(['status' => 'practice_mode']);
        }

        if ($examSessionUser->status === 'finished') {
            return response()->json(['status' => 'ignored']);
        }

        // Increment cheat warnings
        $examSessionUser->increment('cheat_warnings');
        $examSessionUser->refresh();

        try {
            \App\Events\StudentCheatDetected::dispatch(
                $request->exam_session_id,
                auth()->id(),
                auth()->user()->name,
                $request->type . ' (Peringatan ke-' . $examSessionUser->cheat_warnings . ')'
            );
        } catch (\Throwable $e) {
            // Broadcast failed, but continue with cheat detection
            \Log::warning('Broadcast failed: ' . $e->getMessage());
        }

        // Auto Disqualification based on max_cheat_warnings setting
        $maxWarnings = (int) (\App\Models\Setting::where('key', 'max_cheat_warnings')->value('value') ?? 3);

        if ($examSessionUser->cheat_warnings >= $maxWarnings) {
            $examSessionUser->update([
                'status' => 'finished',
                'finished_at' => now(),
                'score' => 0, // Set skor ke 0 jika diskualifikasi
            ]);

            try {
                \App\Events\StudentExamUpdated::dispatch(
                    $examSessionUser->exam_session_id,
                    $examSessionUser->user_id,
                    auth()->user()->name,
                    'finished'
                );
            } catch (\Throwable $e) {
                // Broadcast failed, but continue with disqualification
                \Log::warning('Broadcast failed: ' . $e->getMessage());
            }

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
            'answers' => 'present|array',
        ]);

        // Load session & exam once to avoid duplicate queries
        $session = \App\Models\ExamSession::with('exam')->find($request->exam_session_id);
        if (!$session || !$session->is_active) {
            if ($request->expectsJson() && !$request->header('X-Inertia')) {
                return response()->json(['status' => 'session_inactive', 'message' => 'Sesi ujian sudah tidak aktif. Hubungi Proktor.'], 403);
            }
            return redirect()->route('siswa.dashboard')->with('error', 'Sesi ujian sudah tidak aktif.');
        }

        // Resilience: Ensure ExamSessionUser exists even if student was added late or record was missing
        try {
            $examSessionUser = \App\Models\ExamSessionUser::firstOrCreate(
                [
                    'exam_session_id' => $request->exam_session_id,
                    'user_id' => auth()->id(),
                ],
                [
                    'status' => 'working',
                    'started_at' => now(),
                ]
            );
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            $examSessionUser = \App\Models\ExamSessionUser::where('exam_session_id', $request->exam_session_id)
                ->where('user_id', auth()->id())
                ->firstOrFail();
        }

        // Guard: Jangan proses apapun jika ujian siswa sudah selesai
        if ($examSessionUser->status === 'finished') {
            if ($request->expectsJson() && !$request->header('X-Inertia')) {
                return response()->json(['status' => 'already_finished']);
            }
            return redirect()->route('siswa.dashboard');
        }

        // Ensure started_at is initialized if null
        if (!$examSessionUser->started_at) {
            $nowStarted = now();
            $examSessionUser->update(['started_at' => $nowStarted]);
            $examSessionUser->started_at = $nowStarted;
        }

        // Server-side time check
        $durationInSeconds = ($session->exam?->duration ?? 0) * 60;
        if ($durationInSeconds > 0 && $examSessionUser->started_at) {
            $startedAt = \Carbon\Carbon::parse($examSessionUser->started_at);
            $elapsedSeconds = $startedAt->diffInSeconds(now());
            if ($elapsedSeconds > $durationInSeconds + 30) { // Beri toleransi 30 detik untuk network lag
                $examSessionUser->update(['status' => 'finished', 'finished_at' => now()]);
                if ($request->expectsJson() && !$request->header('X-Inertia')) {
                    return response()->json(['status' => 'time_up', 'message' => 'Waktu ujian telah habis.']);
                }
                return redirect()->route('siswa.dashboard')->with('error', 'Waktu ujian telah habis.');
            }
        }

        // Batch upsert answers with deadlock/lock retry for 300+ concurrent students
        $rawAnswers = is_array($request->answers) ? $request->answers : [];
        $nowTimestamp = now();
        $upsertRows = [];

        foreach ($rawAnswers as $questionId => $answer) {
            if (!is_numeric($questionId) || (int) $questionId <= 0) {
                continue;
            }
            $normalizedAnswer = is_array($answer)
                ? json_encode($answer)
                : ($answer === null ? null : (string) $answer);

            $upsertRows[] = [
                'exam_session_user_id' => $examSessionUser->id,
                'question_id' => (int) $questionId,
                'answer_text' => $normalizedAnswer,
                'created_at' => $nowTimestamp,
                'updated_at' => $nowTimestamp,
            ];
        }

        $isFinishing = $request->boolean('finish');

        \Illuminate\Support\Facades\DB::transaction(function () use ($upsertRows, $examSessionUser, $isFinishing) {
            if (!empty($upsertRows)) {
                \App\Models\StudentAnswer::upsert(
                    $upsertRows,
                    ['exam_session_user_id', 'question_id'],
                    ['answer_text', 'updated_at']
                );
            }

            if ($isFinishing) {
                $examSessionUser->update([
                    'status' => 'finished',
                    'finished_at' => now(),
                ]);
            } elseif ($examSessionUser->status !== 'working') {
                $examSessionUser->update(['status' => 'working']);
            }
        }, 3);

        if ($isFinishing) {
            // === Mode Latihan: Reset sesi agar bisa diulang, tidak simpan skor ===
            $isLatihan = (bool) ($session->exam?->is_practice ?? false);
            if ($isLatihan) {
                \Illuminate\Support\Facades\DB::transaction(function () use ($examSessionUser) {
                    // Hapus semua jawaban
                    \App\Models\StudentAnswer::where('exam_session_user_id', $examSessionUser->id)->delete();
                    // Reset status ke waiting agar siswa bisa mengikuti lagi
                    $examSessionUser->update([
                        'status' => 'waiting',
                        'started_at' => null,
                        'finished_at' => null,
                        'score' => null,
                        'cheat_warnings' => 0,
                        'session_id' => null,
                    ]);
                }, 3);

                if ($request->expectsJson() && !$request->header('X-Inertia')) {
                    return response()->json([
                        'status' => 'practice_finished',
                        'redirect' => route('siswa.dashboard'),
                    ]);
                }
                return redirect()->route('siswa.dashboard')->with('success', 'Sesi latihan selesai! Hasil tidak disimpan. Anda bisa mengulang kapan saja.');
            }

            // === Auto-Scoring untuk Pilihan Ganda (ujian resmi) ===
            \Illuminate\Support\Facades\DB::transaction(function () use ($examSessionUser) {
                $this->calculateScore($examSessionUser);
            }, 3);

            try {
                \App\Events\StudentExamUpdated::dispatch(
                    $examSessionUser->exam_session_id,
                    $examSessionUser->user_id,
                    auth()->user()->name,
                    'finished'
                );
            } catch (\Throwable $e) {
                // Broadcast failed, but continue with exam submission
                \Log::warning('Broadcast failed: ' . $e->getMessage());
            }

            if ($request->expectsJson() && !$request->header('X-Inertia')) {
                return response()->json([
                    'status' => 'finished',
                    'score' => $examSessionUser->score,
                    'redirect' => route('siswa.dashboard'),
                ]);
            }

            return redirect()->route('siswa.dashboard')->with('success', 'Ujian telah diselesaikan.');
        }

        // For pure AJAX auto-save (Axios/JSON), avoid broadcasting on every keystroke and return lightweight JSON
        if ($request->expectsJson() && !$request->header('X-Inertia')) {
            return response()->json([
                'status' => 'saved',
                'saved_count' => count($upsertRows),
            ]);
        }

        try {
            \App\Events\StudentExamUpdated::dispatch(
                $examSessionUser->exam_session_id,
                $examSessionUser->user_id,
                auth()->user()->name,
                'working'
            );
        } catch (\Throwable $e) {
            // Broadcast failed, but continue with answer submission
            \Log::warning('Broadcast failed: ' . $e->getMessage());
        }

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
            } elseif ($question->type === 'benar_salah') {
                // Benar / Salah: Mendukung format JSON map {"a":"benar","b":"salah"} atau single value "benar"/"salah"
                $keyRaw = trim($question->answer_key ?? '');
                $ansRaw = trim($studentAnswer->answer_text ?? '');
                
                $keyMap = json_decode($keyRaw, true);
                $ansMap = json_decode($ansRaw, true);

                if (is_array($keyMap) && is_array($ansMap)) {
                    $allMatched = true;
                    $hasStatements = false;
                    foreach ($keyMap as $k => $expectedVal) {
                        $hasStatements = true;
                        $expected = in_array(strtolower(trim((string)$expectedVal)), ['b', 'benar', 'true', '1']) ? 'benar' : 'salah';
                        $actual = isset($ansMap[$k]) && in_array(strtolower(trim((string)$ansMap[$k])), ['b', 'benar', 'true', '1']) ? 'benar' : 'salah';
                        if (!isset($ansMap[$k]) || $expected !== $actual) {
                            $allMatched = false;
                            break;
                        }
                    }
                    $isCorrect = $hasStatements && $allMatched;
                } else {
                    $expected = in_array(strtolower($keyRaw), ['b', 'benar', 'true', '1']) ? 'benar' : 'salah';
                    $actual = in_array(strtolower($ansRaw), ['b', 'benar', 'true', '1']) ? 'benar' : 'salah';
                    $isCorrect = ($expected === $actual && !empty($ansRaw));
                }

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
