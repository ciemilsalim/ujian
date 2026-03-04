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
    public function index()
    {
        $sessions = ExamSession::with(['exam', 'classroom'])
            ->withCount(['examUsers as participants_count'])
            ->withCount([
                'examUsers as finished_count' => function ($query) {
                    $query->where('status', 'finished');
                }
            ])
            ->latest()
            ->paginate(10);

        return Inertia::render('Proktor/Results/Index', [
            'sessions' => $sessions
        ]);
    }

    public function show($id)
    {
        $session = ExamSession::with(['exam', 'classroom', 'examUsers.user'])
            ->findOrFail($id);

        $scores = $session->examUsers->pluck('score')->filter(fn($s) => !is_null($s));
        $count = $scores->count();

        $stats = [
            'average' => $count > 0 ? round($scores->avg(), 2) : 0,
            'max' => $count > 0 ? $scores->max() : 0,
            'min' => $count > 0 ? $scores->min() : 0,
            'median' => $count > 0 ? $this->calculateMedian($scores->toArray()) : 0,
            'pass_count' => $session->examUsers->where('score', '>=', 70)->count(), // Assuming 70 is pass
            'fail_count' => $session->examUsers->where('score', '<', 70)->whereNotNull('score')->count(),
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

        $pdf = Pdf::loadView('pdf.results', compact('session'));
        return $pdf->download("hasil_ujian_{$session->name}.pdf");
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
