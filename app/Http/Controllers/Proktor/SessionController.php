<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SessionController
{
    public function index()
    {
        $sessions = \App\Models\ExamSession::with(['exam', 'classroom'])->latest()->paginate(10);
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
            'classroom_id' => 'nullable|exists:classrooms,id',
            'name' => 'required|string|max:255',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        \App\Models\ExamSession::create([
            'exam_id' => $request->exam_id,
            'classroom_id' => $request->classroom_id,
            'name' => $request->name,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'token' => strtoupper(\Illuminate\Support\Str::random(6)),
        ]);

        return redirect()->back()->with('success', 'Sesi ujian berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $session = \App\Models\ExamSession::findOrFail($id);
        $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'classroom_id' => 'nullable|exists:classrooms,id',
            'name' => 'required|string|max:255',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        $session->update([
            'exam_id' => $request->exam_id,
            'classroom_id' => $request->classroom_id,
            'name' => $request->name,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
        ]);

        return redirect()->back()->with('success', 'Sesi ujian berhasil diperbarui.');
    }

    public function toggleActive($id)
    {
        $session = \App\Models\ExamSession::findOrFail($id);
        $session->update([
            'is_active' => !$session->is_active
        ]);

        $status = $session->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Session berhasil $status.");
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

        \App\Events\ProktorBroadcast::dispatch(
            $id,
            $request->message,
            auth()->user()->name
        );

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
        \App\Events\ProktorBroadcast::dispatch(
            $id,
            'force_logout',
            auth()->user()->name
        );

        return redirect()->back()->with('success', 'Perintah Logout paksa telah dikirim ke seluruh siswa di sesi ini.');
    }

    public function forceLogoutParticipant($id)
    {
        $eu = \App\Models\ExamSessionUser::findOrFail($id);

        // Broadcast force logout to specific participant
        \App\Events\ProktorBroadcast::dispatch(
            $eu->exam_session_id,
            'force_logout_user:' . $eu->user_id,
            auth()->user()->name
        );

        return redirect()->back()->with('success', "Perintah Logout paksa dikirim ke {$eu->user->name}.");
    }

    public function extendTime(Request $request, $id)
    {
        $request->validate(['minutes' => 'required|integer|min:1']);
        $session = \App\Models\ExamSession::findOrFail($id);

        $newEndTime = \Carbon\Carbon::parse($session->end_time)->addMinutes($request->minutes);
        $session->update(['end_time' => $newEndTime]);

        // Broadcast time update to students
        \App\Events\ProktorBroadcast::dispatch(
            $id,
            'extend_time|' . $request->minutes,
            auth()->user()->name
        );

        return redirect()->back()->with('success', "Waktu ujian berhasil ditambah {$request->minutes} menit.");
    }
}
