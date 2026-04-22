<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ExamSession;
use Barryvdh\DomPDF\Facade\Pdf;

class AttendanceController extends Controller
{
    public function generate($id, Request $request)
    {
        $roomId = $request->input('room_id');
        $proctorId = $request->input('proctor_id');
        
        $query = ExamSession::with(['exam', 'classroom', 'examUsers' => function($q) use ($roomId) {
            if ($roomId) {
                $q->where('exam_room_id', $roomId);
            }
            $q->with('user.classroom');
        }]);

        $session = $query->findOrFail($id);
        
        $room = $roomId ? \App\Models\ExamRoom::find($roomId) : null;
        
        // Priority 1: From Request (Selected in Modal)
        if ($proctorId) {
            $selectedProctor = \App\Models\Proctor::find($proctorId);
            if ($selectedProctor) {
                $proctorWrapper = new \App\Models\ExamSessionProctor();
                $proctorWrapper->setRelation('proctor', $selectedProctor);
                $proctors = collect([$proctorWrapper]);
            }
        } 
        // Priority 2: Room specific (Assigned in DB)
        elseif ($roomId) {
            $proctors = \App\Models\ExamSessionProctor::where('exam_session_id', $id)
                ->where('exam_room_id', $roomId)
                ->with('proctor')
                ->get();
        }

        // Priority 3: Global Session Proctor (Stored in Session)
        if (count($proctors) == 0 && $session->proctor_id) {
            $globalProctor = \App\Models\Proctor::find($session->proctor_id);
            if ($globalProctor) {
                $proctorWrapper = new \App\Models\ExamSessionProctor();
                $proctorWrapper->setRelation('proctor', $globalProctor);
                $proctors = collect([$proctorWrapper]);
            }
        }

        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();

        $pdf = Pdf::loadView('pdf.attendance', compact('session', 'settings', 'room', 'proctors'));
        $filename = $room ? "daftar_hadir_{$session->name}_{$room->name}.pdf" : "daftar_hadir_{$session->name}.pdf";
        
        return $pdf->download($filename);
    }

    public function generateProctorAttendance($id, Request $request)
    {
        $session = ExamSession::with(['exam', 'proctors.proctor', 'proctors.room'])->findOrFail($id);
        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();

        $roomId = $request->input('room_id');
        $proctorId = $request->input('proctor_id');

        // Group proctors by room
        $roomProctors = $session->proctors->groupBy('exam_room_id');

        if ($proctorId) {
            $selectedProctor = \App\Models\Proctor::find($proctorId);
            if ($selectedProctor) {
                $proctorWrapper = new \App\Models\ExamSessionProctor();
                $proctorWrapper->setRelation('proctor', $selectedProctor);
                
                $room = null;
                if ($roomId) {
                    $room = \App\Models\ExamRoom::find($roomId);
                    if ($room) {
                        $proctorWrapper->setRelation('room', $room);
                    }
                }
                
                $roomKey = $room ? $room->name : 'Semua Ruang';
                $roomProctors = collect([ $roomKey => collect([$proctorWrapper]) ]);
            }
        } elseif ($roomProctors->isEmpty() && $session->proctor_id) {
            $globalProctor = \App\Models\Proctor::find($session->proctor_id);
            if ($globalProctor) {
                $proctorWrapper = new \App\Models\ExamSessionProctor();
                $proctorWrapper->setRelation('proctor', $globalProctor);
                $roomProctors = collect([ 'Semua Ruang' => collect([$proctorWrapper]) ]);
            }
        }

        $pdf = Pdf::loadView('pdf.proctor-attendance', compact('session', 'settings', 'roomProctors'));
        return $pdf->download("daftar_hadir_pengawas_{$session->name}.pdf");
    }
}
