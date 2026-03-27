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
            'name' => 'required|string|max:255|unique:exam_rooms,name',
            'capacity' => 'required|integer|min:1',
        ]);

        ExamRoom::create($request->only(['name', 'capacity']));

        return redirect()->back()->with('success', 'Ruang berhasil dibuat.');
    }

    public function update(Request $request, ExamRoom $room)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:exam_rooms,name,' . $room->id,
            'capacity' => 'required|integer|min:1',
        ]);

        $room->update($request->only(['name', 'capacity']));

        return redirect()->back()->with('success', 'Ruang berhasil diperbarui.');
    }

    public function destroy(ExamRoom $room)
    {
        // Cegah hapus ruang jika masih ada siswa yang terdaftar di sesi apapun
        $hasActiveParticipants = ExamSessionUser::where('exam_room_id', $room->id)->exists();
        if ($hasActiveParticipants) {
            return redirect()->back()->withErrors([
                'room' => "Ruang {$room->name} tidak dapat dihapus karena masih digunakan oleh peserta sesi ujian."
            ]);
        }

        $room->delete();
        return redirect()->back()->with('success', 'Ruang berhasil dihapus.');
    }

    /**
     * Assign students to rooms for a specific session
     */
    public function assignStudents(Request $request, ExamSession $session)
    {
        // Guard: tidak boleh mengubah pembagian ruang saat sesi sedang aktif
        if ($session->is_active) {
            return back()->withErrors([
                'session' => 'Tidak dapat mengubah pembagian ruang saat sesi ujian sedang aktif.'
            ]);
        }

        $request->validate([
            'assignments' => 'required|array',
            'assignments.*.room_id' => 'required|exists:exam_rooms,id',
            'assignments.*.student_ids' => 'nullable|array',
        ]);

        // Validasi kapasitas sebelum menyimpan
        foreach ($request->assignments as $assignment) {
            if (!empty($assignment['student_ids'])) {
                $room = ExamRoom::find($assignment['room_id']);
                if ($room && count($assignment['student_ids']) > $room->capacity) {
                    return back()->withErrors([
                        'assignments' => "Ruang {$room->name} melebihi kapasitas ({$room->capacity} kursi)."
                    ]);
                }
            }
        }

        DB::transaction(function() use ($request, $session) {
            // Clear semua assignment ruang untuk sesi ini
            ExamSessionUser::where('exam_session_id', $session->id)
                ->update(['exam_room_id' => null]);

            foreach ($request->assignments as $assignment) {
                if (!empty($assignment['student_ids'])) {
                    ExamSessionUser::where('exam_session_id', $session->id)
                        ->whereIn('user_id', $assignment['student_ids'])
                        ->update(['exam_room_id' => $assignment['room_id']]);
                }
            }
        });

        return redirect()->back()->with('success', 'Sesi ' . $session->name . ': Siswa berhasil dibagikan ke ruang.');
    }

    /**
     * Assign proctors to room-session
     */
    public function assignProctors(Request $request, ExamSession $session)
    {
        // Guard: tidak boleh mengubah pengawas saat sesi sedang aktif
        if ($session->is_active) {
            return back()->withErrors([
                'session' => 'Tidak dapat mengubah pengawas saat sesi ujian sedang aktif.'
            ]);
        }

        $request->validate([
            'room_id' => 'required|exists:exam_rooms,id',
            'proctor_ids' => 'required|array|max:2',
            'proctor_ids.*' => 'exists:proctors,id'
        ]);

        // Validasi: pengawas tidak boleh bertugas di ruang lain dalam sesi yang sama
        foreach ($request->proctor_ids as $pId) {
            $conflict = ExamSessionProctor::where('exam_session_id', $session->id)
                ->where('proctor_id', $pId)
                ->where('exam_room_id', '!=', $request->room_id)
                ->first();

            if ($conflict) {
                $proctor = Proctor::find($pId);
                $conflictRoom = ExamRoom::find($conflict->exam_room_id);
                return back()->withErrors([
                    'proctor_ids' => "Pengawas {$proctor->name} sudah bertugas di ruang {$conflictRoom->name} untuk sesi ini."
                ]);
            }
        }

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
            // Ambil semua ID ruang yang terlibat dalam request
            $roomIds = collect($request->assignments)->pluck('room_id')->filter()->unique()->values();

            // Clear semua siswa yang saat ini terdaftar di ruang-ruang tersebut
            // Ini memastikan siswa yang di-unassign di frontend juga ter-clear di database
            User::where('role', 'siswa')
                ->whereIn('exam_room_id', $roomIds)
                ->update(['exam_room_id' => null]);

            // Set ulang assignment sesuai payload
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
        // Guard: tidak boleh menyinkronkan saat sesi sedang aktif
        if ($session->is_active) {
            return back()->withErrors([
                'session' => 'Tidak dapat menyinkronkan ruang saat sesi ujian sedang aktif.'
            ]);
        }

        DB::transaction(function() use ($session) {
            // Clear semua assignment ruang di sesi ini terlebih dahulu
            ExamSessionUser::where('exam_session_id', $session->id)
                ->update(['exam_room_id' => null]);

            // Kemudian sync dari ruang default masing-masing siswa
            $sessionUsers = ExamSessionUser::where('exam_session_id', $session->id)
                ->with('user')
                ->get();

            foreach ($sessionUsers as $su) {
                if ($su->user && $su->user->exam_room_id) {
                    ExamSessionUser::where('id', $su->id)
                        ->update(['exam_room_id' => $su->user->exam_room_id]);
                }
            }
        });
        
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
