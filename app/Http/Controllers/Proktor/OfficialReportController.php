<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use App\Models\ExamSession;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class OfficialReportController extends Controller
{
    public function generate(Request $request, $id)
    {
        $session = ExamSession::with(['exam', 'classroom', 'examUsers'])
            ->findOrFail($id);
            
        $proctor_name = $request->proctor_name ?? '...........................';
        $proctor_nip = $request->proctor_nip ?? '-';
        
        $settings = Setting::pluck('value', 'key')->toArray();
        
        $pdf = Pdf::loadView('pdf.official-report', compact('session', 'settings', 'proctor_name', 'proctor_nip'));
        // Set paper to F4/Legal or A4. User asked for A4 cards, but reports are usually A4/F4.
        $pdf->setPaper('a4', 'portrait');
        
        return $pdf->stream("berita_acara_{$session->name}.pdf");
    }
}
