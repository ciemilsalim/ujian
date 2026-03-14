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

        $pdf = Pdf::loadView('pdf.attendance', compact('session'));
        return $pdf->download("daftar_hadir_{$session->name}.pdf");
    }
}
