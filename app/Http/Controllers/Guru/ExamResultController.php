<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\ExamSession;
use App\Models\ExamSessionUser;
use App\Models\StudentAnswer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamResultController extends Controller
{
    public function index()
    {
        // Hanya tampilkan sesi yang menggunakan bank soal milik Guru ini
        $sessions = ExamSession::with(['exam.questionBank', 'classroom'])
            ->whereHas('exam.questionBank', fn($q) => $q->where('user_id', auth()->id()))
            ->latest()
            ->get();

        return Inertia::render('Guru/Results/Index', [
            'sessions' => $sessions
        ]);
    }

    public function show($id)
    {
        // Load sesi dengan peserta, jawaban, dan soal terkait
        $session = ExamSession::with([
            'exam.questionBank.questions',
            'examUsers.user',
            'examUsers.answers.question',
            'classroom'
        ])->findOrFail($id);

        // Otorisasi: pastikan bank soal milik guru yang login
        if ($session->exam->questionBank->user_id !== auth()->id()) {
            abort(403, 'Anda tidak memiliki akses ke sesi ujian ini.');
        }

        return Inertia::render('Guru/Results/Show', [
            'session' => $session
        ]);
    }

    /**
     * Koreksi manual jawaban essay oleh Guru.
     * Setelah koreksi, skor total siswa dihitung ulang secara otomatis.
     */
    public function gradeEssay(Request $request)
    {
        $request->validate([
            'student_answer_id' => 'required|exists:student_answers,id',
            'score'             => 'required|integer|min:0',
            'is_correct'        => 'required|boolean',
        ]);

        $studentAnswer = StudentAnswer::with(['question.questionBank', 'examSessionUser'])->findOrFail($request->student_answer_id);

        // Otorisasi: hanya guru pemilik bank soal yang boleh menilai
        if ($studentAnswer->question->questionBank->user_id !== auth()->id()) {
            abort(403, 'Anda tidak berhak menilai jawaban ini.');
        }

        // Pastikan skor tidak melebihi nilai maksimum soal
        $maxScore = $studentAnswer->question->score_default;
        $score = min($request->score, $maxScore);

        $studentAnswer->update([
            'score'      => $score,
            'is_correct' => $request->is_correct,
        ]);

        // Hitung ulang total skor ExamSessionUser
        $this->recalculateScore($studentAnswer->examSessionUser);

        return redirect()->back()->with('success', 'Jawaban essay berhasil dinilai.');
    }

    /**
     * Hitung ulang skor persentase siswa setelah koreksi essay.
     * Logika sama dengan calculateScore di Siswa/ExamController.
     */
    private function recalculateScore(ExamSessionUser $examSessionUser): void
    {
        $answers = $examSessionUser->answers()->with('question')->get();

        if ($answers->isEmpty()) {
            return;
        }

        $totalScore = 0;
        $maxScore   = 0;

        foreach ($answers as $answer) {
            $question = $answer->question;
            if (!$question) continue;

            $maxScore += $question->score_default;

            // Hanya hitung skor yang sudah dinilai (is_correct tidak null)
            if (!is_null($answer->is_correct)) {
                $totalScore += ($answer->score ?? 0);
            } elseif ($question->type === 'pilihan_ganda') {
                // Pilihan ganda yang belum dinilai (seharusnya tidak terjadi) — lewati
                $totalScore += ($answer->score ?? 0);
            }
            // Essay yang belum dinilai: score = 0 (default)
        }

        $percentageScore = $maxScore > 0 ? round(($totalScore / $maxScore) * 100) : 0;
        $examSessionUser->update(['score' => $percentageScore]);
    }
}
