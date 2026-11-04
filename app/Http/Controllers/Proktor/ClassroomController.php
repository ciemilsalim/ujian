<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassroomController extends Controller
{
    public function index(Request $request)
    {
        $query = Classroom::query()
            ->withCount(['users as students_count' => function ($q) {
                $q->where('role', 'siswa');
            }]);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $classrooms = $query->orderBy('name')->paginate(10)->withQueryString();

        $totalClasses = Classroom::count();
        $totalStudentsInClass = User::where('role', 'siswa')->whereNotNull('classroom_id')->count();
        $emptyClasses = Classroom::whereDoesntHave('users', function ($q) {
            $q->where('role', 'siswa');
        })->count();

        return Inertia::render('Proktor/Classrooms/Index', [
            'classrooms' => $classrooms,
            'filters' => [
                'search' => $search ?? '',
            ],
            'stats' => [
                'totalClasses' => $totalClasses,
                'totalStudentsInClass' => $totalStudentsInClass,
                'emptyClasses' => $emptyClasses,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:classrooms,name',
            'description' => 'nullable|string|max:500',
        ]);

        Classroom::create($validated);

        return redirect()->back()->with('success', 'Kelas berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $classroom = Classroom::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:classrooms,name,' . $classroom->id,
            'description' => 'nullable|string|max:500',
        ]);

        $classroom->update($validated);

        return redirect()->back()->with('success', 'Data kelas berhasil diperbarui.');
    }

    public function manageStudents($id)
    {
        $classroom = Classroom::findOrFail($id);
        $currentStudents = User::where('classroom_id', $id)
            ->where('role', 'siswa')
            ->orderBy('name')
            ->get();
        
        $availableStudents = User::whereNull('classroom_id')
            ->where('role', 'siswa')
            ->orderBy('name')
            ->get();

        return Inertia::render('Proktor/Classrooms/ManageStudents', [
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

        User::whereIn('id', $request->student_ids)
            ->where('role', 'siswa')
            ->update(['classroom_id' => $id]);

        return redirect()->back()->with('success', count($request->student_ids) . ' siswa berhasil ditambahkan ke kelas.');
    }

    public function removeStudent($id, $studentId)
    {
        $student = User::where('id', $studentId)
            ->where('classroom_id', $id)
            ->firstOrFail();
        
        $student->update(['classroom_id' => null]);

        return redirect()->back()->with('success', "{$student->name} berhasil dikeluarkan dari kelas.");
    }

    public function destroy($id)
    {
        $classroom = Classroom::findOrFail($id);
        
        if ($classroom->users()->where('role', 'siswa')->exists()) {
            return redirect()->back()->with('error', 'Kelas tidak dapat dihapus karena masih memiliki siswa terdaftar.');
        }

        if ($classroom->examSessions()->exists()) {
            return redirect()->back()->with('error', 'Kelas tidak dapat dihapus karena masih terhubung ke sesi ujian.');
        }

        $classroom->delete();

        return redirect()->back()->with('success', 'Kelas berhasil dihapus.');
    }
}
