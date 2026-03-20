<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    public function index()
    {
        $classrooms = \App\Models\Classroom::latest()->paginate(10);
        return \Inertia\Inertia::render('Proktor/Classrooms/Index', [
            'classrooms' => $classrooms
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:classrooms,name',
            'description' => 'nullable|string|max:255',
        ]);

        \App\Models\Classroom::create($request->all());

        return redirect()->back()->with('success', 'Classroom created successfully.');
    }

    public function update(Request $request, $id)
    {
        $classroom = \App\Models\Classroom::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:255|unique:classrooms,name,' . $classroom->id,
            'description' => 'nullable|string|max:255',
        ]);

        $classroom->update($request->all());

        return redirect()->back()->with('success', 'Classroom updated successfully.');
    }

    public function show($id)
    {
        $classroom = \App\Models\Classroom::with('users')->findOrFail($id);
        return \Inertia\Inertia::render('Proktor/Classrooms/SeatingPlan', [
            'classroom' => $classroom,
            'students' => $classroom->users()->where('role', 'siswa')->get()
        ]);
    }

    public function manageStudents($id)
    {
        $classroom = \App\Models\Classroom::findOrFail($id);
        $currentStudents = \App\Models\User::where('classroom_id', $id)
            ->where('role', 'siswa')
            ->get();
        
        $availableStudents = \App\Models\User::whereNull('classroom_id')
            ->where('role', 'siswa')
            ->get();

        return \Inertia\Inertia::render('Proktor/Classrooms/ManageStudents', [
            'classroom' => $classroom,
            'currentStudents' => $currentStudents,
            'availableStudents' => $availableStudents
        ]);
    }

    public function addStudents(Request $request, $id)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id'
        ]);

        \App\Models\User::whereIn('id', $request->student_ids)
            ->where('role', 'siswa')
            ->update(['classroom_id' => $id]);

        return redirect()->back()->with('success', count($request->student_ids) . ' siswa berhasil ditambahkan ke kelas.');
    }

    public function removeStudent($id, $studentId)
    {
        $student = \App\Models\User::where('id', $studentId)
            ->where('classroom_id', $id)
            ->firstOrFail();
        
        $student->update(['classroom_id' => null]);

        return redirect()->back()->with('success', "{$student->name} berhasil dikeluarkan dari kelas.");
    }

    public function updateSeating(Request $request, $id)
    {
        $classroom = \App\Models\Classroom::findOrFail($id);
        $request->validate([
            'seating_plan' => 'nullable|array',
            'seating_grid' => 'nullable|array',
        ]);

        $classroom->update([
            'seating_plan' => $request->seating_plan,
            'seating_grid' => $request->seating_grid,
        ]);

        return redirect()->back()->with('success', 'Seating plan updated successfully.');
    }

    public function destroy($id)
    {
        $classroom = \App\Models\Classroom::findOrFail($id);
        if ($classroom->users()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete classroom with registered students.');
        }
        $classroom->delete();

        return redirect()->back()->with('success', 'Classroom deleted successfully.');
    }
}
