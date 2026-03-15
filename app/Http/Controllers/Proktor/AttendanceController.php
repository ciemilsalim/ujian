<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use App\Models\ExamSession;
use Barryvdh\DomPDF\Facade\Pdf;

class AttendanceController extends Controller
{
    public function generate($id)
    {
        $session = ExamSession::with(['exam', 'classroom', 'examUsers.user.classroom'])
            ->findOrFail($id);

        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();

        $pdf = Pdf::loadView('pdf.attendance', compact('session', 'settings'));
        return $pdf->download("daftar_hadir_{$session->name}.pdf");
    }
}
