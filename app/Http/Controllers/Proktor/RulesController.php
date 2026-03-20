<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;

class RulesController extends Controller
{
    public function examRules()
    {
        $settings = Setting::pluck('value', 'key')->toArray();
        $pdf = Pdf::loadView('pdf.exam-rules', compact('settings'));
        return $pdf->stream("tata_tertib_peserta.pdf");
    }

    public function proctorRules()
    {
        $settings = Setting::pluck('value', 'key')->toArray();
        $pdf = Pdf::loadView('pdf.proctor-rules', compact('settings'));
        return $pdf->stream("tata_tertib_pengawas.pdf");
    }
}
