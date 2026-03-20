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
use App\Models\StudentAnswer;
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
                    'classroom' => $su->user->classroom ? ['name' => $su->user->classroom->name] : null,
                    'exam_room_id' => $su->exam_room_id
                ];
            });

        $proctors = Proctor::orderBy('name')->get(['id', 'name']);
        
        $currentProctors = ExamSessionProctor::where('exam_session_id', $session->id)->get();

        return Inertia::render('Proktor/Sessions/RoomAssignment', [
            'session' => $session,
            'students' => $students,
            'rooms' => ExamRoom::all(),
            'proctors' => $proctors,
            'currentProctors' => $currentProctors
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
            'assignments.*.student_ids' => 'required|array',
        ]);

        foreach ($request->assignments as $assignment) {
            ExamSessionUser::where('exam_session_id', $session->id)
                ->whereIn('user_id', $assignment['student_ids'])
                ->update(['exam_room_id' => $assignment['room_id']]);
        }

        return redirect()->back()->with('success', 'Siswa berhasil dibagikan ke ruang.');
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
}
