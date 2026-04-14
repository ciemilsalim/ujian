<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SessionController
{
    public function index()
    {
        $sessions = \App\Models\ExamSession::with(['exam', 'classroom'])
            ->withCount('examUsers as participants_count')
            ->latest()
            ->paginate(10);
        $exams = \App\Models\Exam::all();
        $classrooms = \App\Models\Classroom::all();
        return \Inertia\Inertia::render('Proktor/Sessions/Index', [
            'sessions' => $sessions,
            'exams' => $exams,
            'classrooms' => $classrooms
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'name' => 'required|string|max:255',
            'classroom_ids' => 'nullable|array',
            'classroom_ids.*' => 'exists:classrooms,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        $session = \App\Models\ExamSession::create([
            'exam_id' => $request->exam_id,
            'name' => $request->name,
            'classroom_id' => count($request->classroom_ids ?? []) === 1 ? $request->classroom_ids[0] : null,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'token' => strtoupper(\Illuminate\Support\Str::random(6)),
        ]);

        $classroomIds = $request->classroom_ids ?? [];
        if (empty($classroomIds)) {
            $students = \App\Models\User::where('role', 'siswa')->get();
        } else {
            $students = \App\Models\User::whereIn('classroom_id', $classroomIds)
                ->where('role', 'siswa')
                ->get();
        }
            
        foreach ($students as $student) {
            \App\Models\ExamSessionUser::create([
                'exam_session_id' => $session->id,
                'user_id' => $student->id,
                'exam_room_id' => $student->exam_room_id,
                'status' => 'waiting'
            ]);
        }

        return redirect()->back()->with('success', 'Sesi ujian berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $session = \App\Models\ExamSession::findOrFail($id);
        $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'name' => 'required|string|max:255',
            'classroom_ids' => 'nullable|array',
            'classroom_ids.*' => 'exists:classrooms,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        $session->update([
            'exam_id' => $request->exam_id,
            'name' => $request->name,
            'classroom_id' => count($request->classroom_ids ?? []) === 1 ? $request->classroom_ids[0] : null,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
        ]);

        $classroomIds = $request->classroom_ids ?? [];

        if (empty($classroomIds)) {
            $validStudentIds = \App\Models\User::where('role', 'siswa')->pluck('id');
        } else {
            $validStudentIds = \App\Models\User::whereIn('classroom_id', $classroomIds)
                ->where('role', 'siswa')
                ->pluck('id');
        }

            // Hapus peserta (yang masih 'waiting') dari kelas yang sudah dihapus dari sesi
            \App\Models\ExamSessionUser::where('exam_session_id', $session->id)
                ->whereNotIn('user_id', $validStudentIds)
                ->where('status', 'waiting')
                ->delete();

            // Tambahkan peserta baru dari kelas yang baru ditambahkan
            $existingUsers = \App\Models\ExamSessionUser::where('exam_session_id', $session->id)
                ->pluck('user_id')
                ->toArray();

            foreach ($validStudentIds as $studentId) {
                if (!in_array($studentId, $existingUsers)) {
                    $student = \App\Models\User::find($studentId);
                    \App\Models\ExamSessionUser::create([
                        'exam_session_id' => $session->id,
                        'user_id' => $studentId,
                        'exam_room_id' => $student?->exam_room_id,
                        'status' => 'waiting'
                    ]);
                }
            }

        return redirect()->back()->with('success', 'Sesi ujian berhasil diperbarui.');
    }

    public function toggleActive($id)
    {
        $session = \App\Models\ExamSession::findOrFail($id);
        $session->update([
            'is_active' => !$session->is_active
        ]);

        $status = $session->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Sesi berhasil $status.");
    }

    public function refreshToken($id)
    {
        $session = \App\Models\ExamSession::findOrFail($id);
        $session->update([
            'token' => strtoupper(\Illuminate\Support\Str::random(6)),
        ]);

        return redirect()->back()->with('success', 'Token berhasil diperbarui.');
    }

    public function broadcast(Request $request, $id = null)
    {
        $request->validate([
            'message' => 'required|string|max:500',
        ]);

        try {
            \App\Events\ProktorBroadcast::dispatch(
                $id,
                $request->message,
                auth()->user()->name
            );
        } catch (\Exception $e) {
            // Broadcast failed, but continue with broadcast
            \Log::warning('Broadcast failed: ' . $e->getMessage());
        }

        return response()->json(['status' => 'success']);
    }

    public function monitor($id)
    {
        $session = \App\Models\ExamSession::with(['examUsers.user', 'classroom'])->findOrFail($id);

        return \Inertia\Inertia::render('Proktor/Sessions/Monitor', [
            'session' => $session
        ]);
    }

    public function resetLogin($id)
    {
        $eu = \App\Models\ExamSessionUser::findOrFail($id);
        $eu->update(['session_id' => null]);

        return redirect()->back()->with('success', 'Siswa berhasil di-reset. Mereka dapat login kembali sekarang.');
    }

    public function forceLogout($id)
    {
        $session = \App\Models\ExamSession::findOrFail($id);

        // Broadcast force logout to all participants in this session
        try {
            \App\Events\ProktorBroadcast::dispatch(
                $id,
                'force_logout',
                auth()->user()->name
            );
        } catch (\Exception $e) {
            // Broadcast failed, but continue with force logout
            \Log::warning('Broadcast failed: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Perintah Logout paksa telah dikirim ke seluruh siswa di sesi ini.');
    }

    public function forceLogoutParticipant($id)
    {
        $eu = \App\Models\ExamSessionUser::findOrFail($id);

        // Broadcast force logout to specific participant
        try {
            \App\Events\ProktorBroadcast::dispatch(
                $eu->exam_session_id,
                'force_logout_user:' . $eu->user_id,
                auth()->user()->name
            );
        } catch (\Exception $e) {
            // Broadcast failed, but continue with force logout
            \Log::warning('Broadcast failed: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', "Perintah Logout paksa dikirim ke {$eu->user->name}.");
    }

    public function extendTime(Request $request, $id)
    {
        $request->validate(['minutes' => 'required|integer|min:1']);
        $session = \App\Models\ExamSession::findOrFail($id);

        $newEndTime = \Carbon\Carbon::parse($session->end_time)->addMinutes($request->minutes);
        $session->update(['end_time' => $newEndTime]);

        // Broadcast time update to students
        try {
            \App\Events\ProktorBroadcast::dispatch(
                $id,
                'extend_time|' . $request->minutes,
                auth()->user()->name
            );
        } catch (\Exception $e) {
            // Broadcast failed, but continue with time extension
            \Log::warning('Broadcast failed: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', "Waktu ujian berhasil ditambah {$request->minutes} menit.");
    }

    public function resetExam($id)
    {
        $eu = \App\Models\ExamSessionUser::findOrFail($id);

        // Delete all student answers
        \App\Models\StudentAnswer::where('exam_session_user_id', $eu->id)->delete();

        // Reset status, score, times, warnings, and session_id
        $eu->update([
            'status' => 'waiting',
            'score' => null,
            'started_at' => null,
            'finished_at' => null,
            'cheat_warnings' => 0,
            'session_id' => null, // Clear session to ensure they have to re-login to exam
        ]);

        // Broadcast status update to Monitor
        try {
            \App\Events\StudentExamUpdated::dispatch(
                $eu->exam_session_id,
                $eu->user_id,
                $eu->user->name,
                'waiting'
            );
        } catch (\Exception $e) {
            // Broadcast failed, but continue with exam reset
            \Log::warning('Broadcast failed: ' . $e->getMessage());
        }

        // Also broadcast force logout specifically for this user
        try {
            \App\Events\ProktorBroadcast::dispatch(
                $eu->exam_session_id,
                'force_logout_user:' . $eu->user_id,
                auth()->user()->name
            );
        } catch (\Exception $e) {
            // Broadcast failed, but continue with exam reset
            \Log::warning('Broadcast failed: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Ujian siswa berhasil di-reset. Siswa dapat memulai dari awal.');
    }

    public function syncParticipants($id)
    {
        $session = \App\Models\ExamSession::findOrFail($id);
        if ($session->classroom_id) {
            $classroomStudents = \App\Models\User::where('classroom_id', $session->classroom_id)
                ->where('role', 'siswa')
                ->pluck('id');
        } else {
            // Assume it's a global active session (Semua Kelas)
            $classroomStudents = \App\Models\User::where('role', 'siswa')->pluck('id');
        }

        $existingUsers = \App\Models\ExamSessionUser::where('exam_session_id', $session->id)
            ->pluck('user_id')
            ->toArray();

        $newCount = 0;
        foreach ($classroomStudents as $studentId) {
            if (!in_array($studentId, $existingUsers)) {
                $student = \App\Models\User::find($studentId);
                \App\Models\ExamSessionUser::create([
                    'exam_session_id' => $session->id,
                    'user_id' => $studentId,
                    'exam_room_id' => $student?->exam_room_id,
                    'status' => 'waiting'
                ]);
                $newCount++;
            }
        }

        return redirect()->back()->with('success', "Sinkronisasi berhasil. {$newCount} peserta baru ditambahkan.");
    }

    public function manageParticipants($id)
    {
        $session = \App\Models\ExamSession::with(['exam', 'classroom'])->findOrFail($id);
        $participants = \App\Models\ExamSessionUser::with('user.classroom')
            ->where('exam_session_id', $id)
            ->get();
        
        $classrooms = \App\Models\Classroom::with(['users' => function($q) {
            $q->where('role', 'siswa');
        }])->get();

        return \Inertia\Inertia::render('Proktor/Sessions/ManageParticipants', [
            'session' => $session,
            'participants' => $participants,
            'classrooms' => $classrooms
        ]);
    }

    public function addParticipants(Request $request, $id)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        $existingUsers = \App\Models\ExamSessionUser::where('exam_session_id', $id)
            ->pluck('user_id')
            ->toArray();

        $addedCount = 0;
        foreach ($request->user_ids as $userId) {
            if (!in_array($userId, $existingUsers)) {
                $student = \App\Models\User::find($userId);
                \App\Models\ExamSessionUser::create([
                    'exam_session_id' => $id,
                    'user_id' => $userId,
                    'exam_room_id' => $student?->exam_room_id,
                    'status' => 'waiting'
                ]);
                $addedCount++;
            }
        }

        return redirect()->back()->with('success', "{$addedCount} peserta berhasil ditambahkan ke sesi.");
    }

    public function removeParticipant($id, $userId)
    {
        \App\Models\ExamSessionUser::where('exam_session_id', $id)
            ->where('user_id', $userId)
            ->delete();

        return redirect()->back()->with('success', 'Peserta berhasil dihapus dari sesi.');
    }

    public function destroy($id)
    {
        $session = \App\Models\ExamSession::findOrFail($id);
        $session->delete();

        return redirect()->back()->with('success', 'Sesi ujian berhasil dihapus.');
    }
}
