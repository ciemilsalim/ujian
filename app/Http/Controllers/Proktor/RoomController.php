<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ExamRoom;
use App\Models\ExamSession;
use App\Models\ExamSessionUser;
use App\Models\ExamSessionProctor;
use App\Models\Proctor;
use App\Models\User;
use App\Models\Classroom;
use App\Models\StudentAnswer;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index()
    {
        return Inertia::render('Proktor/Rooms/Index', [
            'rooms' => ExamRoom::withCount('sessionParticipants')->get()
        ]);
    }

    public function roomAssignment(ExamSession $session)
    {
        $session->load(['exam', 'classroom']);
        
        $students = ExamSessionUser::where('exam_session_id', $session->id)
            ->with(['user.classroom'])
            ->get()
            ->map(function($su) {
                return [
                    'id' => $su->user_id,
                    'name' => $su->user->name,
                    'classroom' => $su->user->classroom ? ['id' => $su->user->classroom->id, 'name' => $su->user->classroom->name] : null,
                    'classroom_id' => $su->user->classroom_id,
                    'exam_room_id' => $su->exam_room_id,
                    'default_exam_room_id' => $su->user->exam_room_id
                ];
            });

        $proctors = Proctor::orderBy('name')->get(['id', 'name']);
        
        $currentProctors = ExamSessionProctor::where('exam_session_id', $session->id)->get();

        return Inertia::render('Proktor/Sessions/RoomAssignment', [
            'session' => $session,
            'students' => $students,
            'rooms' => ExamRoom::all(),
            'proctors' => $proctors,
            'currentProctors' => $currentProctors,
            'classrooms' => Classroom::orderBy('name')->get(['id', 'name'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:0',
        ]);

        ExamRoom::create($request->all());

        return redirect()->back()->with('success', 'Ruang berhasil dibuat.');
    }

    public function update(Request $request, ExamRoom $room)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:0',
        ]);

        $room->update($request->all());

        return redirect()->back()->with('success', 'Ruang berhasil diperbarui.');
    }

    public function destroy(ExamRoom $room)
    {
        $room->delete();
        return redirect()->back()->with('success', 'Ruang berhasil dihapus.');
    }

    /**
     * Assign students to rooms for a specific session
     */
    public function assignStudents(Request $request, ExamSession $session)
    {
        $request->validate([
            'assignments' => 'required|array',
            'assignments.*.room_id' => 'required|exists:exam_rooms,id',
            'assignments.*.student_ids' => 'nullable|array',
        ]);

        // First, clear all room assignments for this session
        ExamSessionUser::where('exam_session_id', $session->id)
            ->update(['exam_room_id' => null]);

        foreach ($request->assignments as $assignment) {
            if (!empty($assignment['student_ids'])) {
                ExamSessionUser::where('exam_session_id', $session->id)
                    ->whereIn('user_id', $assignment['student_ids'])
                    ->update(['exam_room_id' => $assignment['room_id']]);
            }
        }

        return redirect()->back()->with('success', 'Sesi ' . $session->name . ': Siswa berhasil dibagikan ke ruang.');
    }

    /**
     * Assign proctors to room-session
     */
    public function assignProctors(Request $request, ExamSession $session)
    {
        $request->validate([
            'room_id' => 'required|exists:exam_rooms,id',
            'proctor_ids' => 'required|array|max:2',
            'proctor_ids.*' => 'exists:proctors,id'
        ]);

        // Clear existing proctors for this room-session
        ExamSessionProctor::where('exam_session_id', $session->id)
            ->where('exam_room_id', $request->room_id)
            ->delete();

        foreach ($request->proctor_ids as $pId) {
            ExamSessionProctor::create([
                'exam_session_id' => $session->id,
                'exam_room_id' => $request->room_id,
                'proctor_id' => $pId
            ]);
        }

        return redirect()->back()->with('success', 'Pengawas berhasil ditugaskan.');
    }

    /**
     * View for global student room assignment (Permanent)
     */
    public function globalStudentAssignment()
    {
        $students = User::where('role', 'siswa')
            ->with(['classroom'])
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'classroom' => $user->classroom ? ['id' => $user->classroom->id, 'name' => $user->classroom->name] : null,
                    'classroom_id' => $user->classroom_id,
                    'exam_room_id' => $user->exam_room_id
                ];
            });

        return Inertia::render('Proktor/Rooms/GlobalAssignment', [
            'students' => $students,
            'rooms' => ExamRoom::all(),
            'classrooms' => Classroom::orderBy('name')->get(['id', 'name'])
        ]);
    }

    /**
     * Assign students to rooms globally (Permanent)
     */
    public function assignStudentsGlobal(Request $request)
    {
        $request->validate([
            'assignments' => 'required|array',
            'assignments.*.room_id' => 'required|exists:exam_rooms,id',
            'assignments.*.student_ids' => 'nullable|array',
        ]);

        DB::transaction(function() use ($request) {
            // First, clear all room assignments for the students mentioned in THIS request 
            // OR just clear everything? User wants "set precisely".
            // Let's clear for the students being re-assigned.
            
            $allMentionedStudentIds = [];
            foreach ($request->assignments as $assignment) {
                if (!empty($assignment['student_ids'])) {
                    $allMentionedStudentIds = array_merge($allMentionedStudentIds, $assignment['student_ids']);
                }
            }

            if (!empty($allMentionedStudentIds)) {
                User::whereIn('id', $allMentionedStudentIds)->update(['exam_room_id' => null]);
            }

            foreach ($request->assignments as $assignment) {
                if (!empty($assignment['student_ids'])) {
                    User::whereIn('id', $assignment['student_ids'])
                        ->update(['exam_room_id' => $assignment['room_id']]);
                }
            }
        });

        return redirect()->back()->with('success', 'Pengaturan ruang permanen berhasil disimpan.');
    }

    /**
     * Sync session room assignments from global students default rooms
     */
    public function syncFromDefault(ExamSession $session)
    {
        $sessionUsers = ExamSessionUser::where('exam_session_id', $session->id)
            ->with('user')
            ->get();
            
        foreach ($sessionUsers as $su) {
            if ($su->user && $su->user->exam_room_id) {
                DB::table('exam_session_users')
                    ->where('id', $su->id)
                    ->update(['exam_room_id' => $su->user->exam_room_id]);
            }
        }
        
        return redirect()->back()->with('success', 'Ruang disinkronkan dari pengaturan permanen.');
    }

    /**
     * View for room seating plan (Permanent)
     */
    public function roomSeatingPlan(ExamRoom $room)
    {
        $students = User::where('exam_room_id', $room->id)
            ->with(['classroom'])
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'classroom' => $user->classroom ? ['name' => $user->classroom->name] : null,
                ];
            });

        return Inertia::render('Proktor/Rooms/RoomSeatingPlan', [
            'room' => $room,
            'students' => $students,
        ]);
    }

    /**
     * Update room seating plan (Permanent)
     */
    public function updateRoomSeating(Request $request, ExamRoom $room)
    {
        $request->validate([
            'seating_plan' => 'required|array',
            'seating_grid' => 'required|array',
            'seating_grid.rows' => 'required|integer|min:1',
            'seating_grid.cols' => 'required|integer|min:1',
        ]);

        $room->update([
            'seating_plan' => $request->seating_plan,
            'seating_grid' => $request->seating_grid,
        ]);

        return redirect()->back()->with('success', 'Tata letak kursi ruang ' . $room->name . ' berhasil disimpan.');
    }

    /**
     * Export room seating plan to PDF
     */
    public function exportSeatingPdf(ExamRoom $room)
    {
        $students = User::where('exam_room_id', $room->id)
            ->with(['classroom'])
            ->get()
            ->keyBy('id');

        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.seating', [
            'room' => $room,
            'students' => $students,
            'settings' => $settings,
        ])->setPaper('a4', 'landscape');

        return $pdf->stream("denah_ruang_{$room->name}.pdf");
    }
}
