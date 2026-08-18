<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use App\Models\ExamSession;
use App\Models\ExamSessionUser;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class ResultController extends Controller
{
    public function index(Request $request)
    {
        $activeYear = \App\Models\AcademicYear::where('is_active', true)->first();
        $academicYearId = $request->input('academic_year_id', $activeYear ? $activeYear->id : null);

        $query = ExamSession::with(['exam.academicYear', 'classroom'])
            ->withCount(['examUsers as participants_count'])
            ->withCount([
                'examUsers as finished_count' => function ($q) {
                    $q->where('status', 'finished');
                }
            ])
            ->latest();

        if ($academicYearId && $academicYearId !== 'all') {
            $query->whereHas('exam', function ($q) use ($academicYearId) {
                $q->where('academic_year_id', $academicYearId);
            });
        }

        $sessions = $query->get();
        $academicYears = \App\Models\AcademicYear::orderBy('id', 'desc')->get();

        return Inertia::render('Proktor/Results/Index', [
            'sessions' => [
                'data' => $sessions,
                'total' => $sessions->count(),
                'current_page' => 1,
                'last_page' => 1,
                'from' => 1,
                'to' => $sessions->count(),
                'links' => [],
            ],
            'academicYears' => $academicYears,
            'selectedAcademicYearId' => $academicYearId ? (string)$academicYearId : 'all',
        ]);
    }

    public function show($id)
    {
        $session = ExamSession::with(['exam', 'classroom', 'examUsers.user'])
            ->findOrFail($id);

        $scores = $session->examUsers->pluck('score')->filter(fn($s) => !is_null($s));
        $count = $scores->count();

        $maxCheatWarnings = (int) (\App\Models\Setting::where('key', 'max_cheat_warnings')->first()->value ?? 3);
        $passingGrade = (int) (\App\Models\Setting::where('key', 'passing_grade')->first()->value ?? 70);

        // Filter out disqualified students from base scores for pure stats if needed, 
        // but typically they should count as 0. Since we set them to 0 in ExamController, 
        // we just need to make sure pass_count doesn't count them if they somehow had scores.
        
        $stats = [
            'average' => $count > 0 ? round($scores->avg(), 2) : 0,
            'max' => $count > 0 ? $scores->max() : 0,
            'min' => $count > 0 ? $scores->min() : 0,
            'median' => $count > 0 ? $this->calculateMedian($scores->toArray()) : 0,
            'pass_count' => $session->examUsers->where('cheat_warnings', '<', $maxCheatWarnings)
                                             ->where('score', '>=', $passingGrade)->count(),
            'fail_count' => $session->examUsers->filter(function($eu) use ($maxCheatWarnings, $passingGrade) {
                                return ($eu->cheat_warnings >= $maxCheatWarnings) || ($eu->score !== null && $eu->score < $passingGrade);
                            })->count(),
            'passing_grade' => $passingGrade,
            'max_cheat_warnings' => $maxCheatWarnings,
        ];

        // Distribution data for charts
        $distribution = [
            '0-20' => $scores->filter(fn($s) => $s < 20)->count(),
            '21-40' => $scores->filter(fn($s) => $s >= 21 && $s <= 40)->count(),
            '41-60' => $scores->filter(fn($s) => $s >= 41 && $s <= 60)->count(),
            '61-80' => $scores->filter(fn($s) => $s >= 61 && $s <= 80)->count(),
            '81-100' => $scores->filter(fn($s) => $s > 80)->count(),
        ];

        return Inertia::render('Proktor/Results/Analysis', [
            'session' => $session,
            'stats' => $stats,
            'distribution' => $distribution
        ]);
    }

    public function exportPdf($id)
    {
        $session = ExamSession::with(['exam', 'classroom', 'examUsers.user'])
            ->findOrFail($id);

        $maxCheatWarnings = (int) (\App\Models\Setting::where('key', 'max_cheat_warnings')->first()->value ?? 3);
        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();

        $pdf = Pdf::loadView('pdf.results', compact('session', 'maxCheatWarnings', 'settings'));
        $safeName = str_replace(['/', '\\'], '-', $session->name);
        return $pdf->download("hasil_ujian_{$safeName}.pdf");
    }

    public function exportExcel($id)
    {
        $session = ExamSession::with(['exam', 'classroom', 'examUsers.user'])
            ->findOrFail($id);

        $safeName = str_replace(['/', '\\'], '-', $session->name);
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\ResultExport($session),
            "hasil_ujian_{$safeName}.xlsx"
        );
    }

    public function exportWord($id)
    {
        $session = ExamSession::with(['exam', 'classroom', 'examUsers.user'])->findOrFail($id);
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
        $rightCell->addText('Proktor / Panitia Ujian,', null, ['alignment' => 'center']);
        $rightCell->addTextBreak(3);
        $rightCell->addText('( __________________________ )', ['bold' => true], ['alignment' => 'center']);
        $rightCell->addText('NIP. ......................................', ['size' => 10], ['alignment' => 'center']);

        $safeName = str_replace(['/', '\\'], '-', $session->name);
        $fileName = "Hasil_Ujian_{$safeName}.docx";
        $writer = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');

        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName);
    }

    public function resetResult($id)
    {
        $eu = ExamSessionUser::findOrFail($id);

        // Reset status and score
        $eu->update([
            'status' => 'waiting',
            'score' => null,
            'started_at' => null,
            'finished_at' => null,
        ]);

        // Delete all student answers
        \App\Models\StudentAnswer::where('exam_session_user_id', $id)->delete();

        return redirect()->back()->with('success', 'Hasil ujian siswa berhasil direset.');
    }

    public function deleteResult($id)
    {
        $eu = ExamSessionUser::findOrFail($id);
        $eu->delete(); // Cascade will delete answers

        return redirect()->back()->with('success', 'Data ujian siswa berhasil dihapus.');
    }

    private function calculateMedian($numbers)
    {
        sort($numbers);
        $count = count($numbers);
        if ($count === 0)
            return 0;
        $middle = floor(($count - 1) / 2);
        if ($count % 2) {
            return $numbers[$middle];
        } else {
            return ($numbers[$middle] + $numbers[$middle + 1]) / 2;
        }
    }
}
