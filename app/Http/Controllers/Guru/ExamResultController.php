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
    public function index(Request $request)
    {
        $activeYear = \App\Models\AcademicYear::getActive();
        $academicYearId = $request->input('academic_year_id', $activeYear ? $activeYear->id : null);

        $query = ExamSession::with(['exam.questionBank.academicYear', 'classroom'])
            ->whereHas('exam.questionBank', fn($q) => $q->where('user_id', auth()->id()))
            ->latest();

        if ($academicYearId && $academicYearId !== 'all') {
            $query->whereHas('exam', function ($q) use ($academicYearId) {
                $q->where('academic_year_id', $academicYearId);
            });
        }

        $sessions = $query->get();
        $academicYears = \App\Models\AcademicYear::orderBy('id', 'desc')->get();

        return Inertia::render('Guru/Results/Index', [
            'sessions' => $sessions,
            'academicYears' => $academicYears,
            'selectedAcademicYearId' => $academicYearId ? (string)$academicYearId : 'all',
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

    public function detail($id)
    {
        $examSessionUser = ExamSessionUser::with([
            'user',
            'examSession.exam.questionBank',
            'answers.question'
        ])->findOrFail($id);

        // Otorisasi: pastikan bank soal milik guru yang login
        if ($examSessionUser->examSession->exam->questionBank->user_id !== auth()->id()) {
            abort(403, 'Anda tidak memiliki akses ke data ini.');
        }

        return Inertia::render('Guru/Results/Detail', [
            'examSessionUser' => $examSessionUser
        ]);
    }

    public function exportPdf($id)
    {
        $session = ExamSession::with(['exam.questionBank', 'classroom', 'examUsers.user'])
            ->findOrFail($id);

        if ($session->exam->questionBank->user_id !== auth()->id()) {
            abort(403, 'Anda tidak memiliki akses ke data sesi ini.');
        }

        $maxCheatWarnings = (int) (\App\Models\Setting::where('key', 'max_cheat_warnings')->first()->value ?? 3);
        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.results', compact('session', 'maxCheatWarnings', 'settings'));
        return $pdf->download("hasil_ujian_{$session->name}.pdf");
    }

    public function exportWord($id)
    {
        $session = ExamSession::with(['exam.questionBank', 'classroom', 'examUsers.user'])->findOrFail($id);
        
        if ($session->exam->questionBank->user_id !== auth()->id()) {
            abort(403, 'Anda tidak memiliki akses ke data sesi ini.');
        }

        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();
        $maxCheatWarnings = (int) ($settings['max_cheat_warnings'] ?? 3);
        $passingGrade = (int) ($settings['passing_grade'] ?? 70);

        $phpWord = new \PhpOffice\PhpWord\PhpWord();
        $section = $phpWord->addSection([
            'marginTop' => 1200,
            'marginBottom' => 1200,
            'marginLeft' => 1200,
            'marginRight' => 1200,
        ]);

        // Kop Surat
        $headerTable = $section->addTable(['borderBottomSize' => 18, 'borderBottomColor' => '000000', 'cellMargin' => 80]);
        $headerTable->addRow();

        // Logo Cell
        $logoCell = $headerTable->addCell(2000, ['valign' => 'center']);
        $logoPath = null;
        if (!empty($settings['school_logo'])) {
            $logoPath = public_path($settings['school_logo']);
        } else {
            $logoPath = public_path('images/logo.png');
        }
        if ($logoPath && file_exists($logoPath) && is_file($logoPath)) {
            $logoCell->addImage($logoPath, ['height' => 60, 'alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]);
        }

        // Text Cell
        $textCell = $headerTable->addCell(8000, ['valign' => 'center']);
        $textCell->addText($settings['school_name'] ?? config('app.name'), ['bold' => true, 'size' => 18], ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]);
        $textCell->addText($settings['school_address'] ?? '-', ['size' => 10], ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]);

        $section->addTextBreak(1);

        // Judul Laporan
        $section->addText('LAPORAN HASIL UJIAN SISWA', ['bold' => true, 'size' => 14, 'underline' => 'single'], ['alignment' => 'center']);
        $section->addTextBreak(1);

        // Informasi Ujian
        $infoTable = $section->addTable(['cellMargin' => 80]);
        
        $infoTable->addRow();
        $infoTable->addCell(2500)->addText('Nama Sesi', ['bold' => true]);
        $infoTable->addCell(200)->addText(':');
        $infoTable->addCell(7300)->addText($session->name, ['bold' => true]);
        
        $infoTable->addRow();
        $infoTable->addCell(2500)->addText('Mata Pelajaran', ['bold' => true]);
        $infoTable->addCell(200)->addText(':');
        $infoTable->addCell(7300)->addText($session->exam->title);
        
        $infoTable->addRow();
        $infoTable->addCell(2500)->addText('Kelas', ['bold' => true]);
        $infoTable->addCell(200)->addText(':');
        $infoTable->addCell(7300)->addText($session->classroom->name ?? 'Semua Kelas');
        
        $infoTable->addRow();
        $infoTable->addCell(2500)->addText('Waktu Pelaksanaan', ['bold' => true]);
        $infoTable->addCell(200)->addText(':');
        $infoTable->addCell(7300)->addText(date('d-m-Y H:i', strtotime($session->start_time)) . ' s/d ' . date('H:i', strtotime($session->end_time)));

        $section->addTextBreak(1);

        // Tabel Nilai
        $styleTable = ['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 80];
        $styleHeader = ['bold' => true, 'fill' => 'F2F2F2'];
        $phpWord->addTableStyle('ResultTable', $styleTable);
        $table = $section->addTable('ResultTable');

        $table->addRow();
        $table->addCell(600, $styleHeader)->addText('NO', ['bold' => true], ['alignment' => 'center']);
        $table->addCell(3500, $styleHeader)->addText('NAMA PESERTA', ['bold' => true]);
        $table->addCell(2000, $styleHeader)->addText('STATUS', ['bold' => true], ['alignment' => 'center']);
        $table->addCell(1500, $styleHeader)->addText('NILAI AKHIR', ['bold' => true], ['alignment' => 'center']);
        $table->addCell(2400, $styleHeader)->addText('KETERANGAN', ['bold' => true], ['alignment' => 'center']);

        foreach ($session->examUsers as $index => $eu) {
            $isDisqualified = $eu->cheat_warnings >= $maxCheatWarnings;
            $score = $isDisqualified ? 0 : ($eu->score ?? 0);
            $isPassed = $score >= $passingGrade && !$isDisqualified;

            $table->addRow();
            $table->addCell(600)->addText($index + 1, null, ['alignment' => 'center']);
            $table->addCell(3500)->addText($eu->user->name);
            
            if ($isDisqualified) {
                $table->addCell(2000)->addText('DISKUALIFIKASI', ['color' => 'dc2626', 'bold' => true], ['alignment' => 'center']);
            } else {
                $table->addCell(2000)->addText(strtoupper($eu->status), null, ['alignment' => 'center']);
            }

            if ($isDisqualified) {
                $table->addCell(1500)->addText('0', ['color' => 'dc2626', 'bold' => true, 'size' => 12], ['alignment' => 'center']);
                $table->addCell(2400)->addText('TIDAK LULUS', ['color' => 'dc2626', 'bold' => true], ['alignment' => 'center']);
            } else {
                $table->addCell(1500)->addText($eu->score ?? '0', ['bold' => true, 'size' => 12], ['alignment' => 'center']);
                
                if ($eu->status === 'finished') {
                    if ($isPassed) {
                        $table->addCell(2400)->addText('LULUS', ['color' => '059669', 'bold' => true], ['alignment' => 'center']);
                    } else {
                        $table->addCell(2400)->addText('TIDAK LULUS', ['color' => 'dc2626', 'bold' => true], ['alignment' => 'center']);
                    }
                } else {
                    $table->addCell(2400)->addText('-', null, ['alignment' => 'center']);
                }
            }
        }

        $section->addTextBreak(2);

        // Tanda Tangan
        $footerTable = $section->addTable(['cellMargin' => 80, 'borderSize' => 0]);
        $footerTable->addRow();
        
        $leftCell = $footerTable->addCell(5000, ['valign' => 'top']);
        $leftCell->addText('Mengetahui,', null, ['alignment' => 'center']);
        $leftCell->addText('Kepala Sekolah,', null, ['alignment' => 'center']);
        $leftCell->addTextBreak(3);
        $leftCell->addText($settings['principal_name'] ?? '...........................', ['bold' => true, 'underline' => 'single'], ['alignment' => 'center']);
        $leftCell->addText('NIP. ' . ($settings['principal_nip'] ?? '...........................'), ['size' => 10], ['alignment' => 'center']);

        $rightCell = $footerTable->addCell(5000, ['valign' => 'top']);
        $locationDate = ($settings['location'] ?? 'Buol') . ', ' . date('d F Y');
        $rightCell->addText($locationDate, null, ['alignment' => 'center']);
        $rightCell->addText('Guru Mata Pelajaran,', null, ['alignment' => 'center']);
        $rightCell->addTextBreak(3);
        $rightCell->addText('( __________________________ )', ['bold' => true], ['alignment' => 'center']);
        $rightCell->addText('NIP. ......................................', ['size' => 10], ['alignment' => 'center']);

        $fileName = "Hasil_Ujian_{$session->name}.docx";
        $writer = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');

        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName);
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
