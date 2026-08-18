<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicYearController extends Controller
{
    public function index()
    {
        $academicYears = AcademicYear::withCount(['questionBanks', 'exams'])
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Proktor/AcademicYears/Index', [
            'academicYears' => $academicYears,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'semester' => 'required|in:Ganjil,Genap',
            'is_active' => 'nullable|boolean',
        ]);

        $shouldBeActive = $request->boolean('is_active') || AcademicYear::count() === 0;

        if ($shouldBeActive) {
            AcademicYear::query()->update(['is_active' => false]);
        }

        AcademicYear::create([
            'name' => trim($request->name),
            'semester' => $request->semester,
            'is_active' => $shouldBeActive,
        ]);

        return redirect()->back()->with('success', 'Tahun Ajaran berhasil ditambahkan.');
    }

    public function update(Request $request, AcademicYear $academicYear)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'semester' => 'required|in:Ganjil,Genap',
        ]);

        $academicYear->update([
            'name' => trim($request->name),
            'semester' => $request->semester,
        ]);

        return redirect()->back()->with('success', 'Tahun Ajaran berhasil diperbarui.');
    }

    public function setActive(AcademicYear $academicYear)
    {
        AcademicYear::query()->update(['is_active' => false]);
        $academicYear->update(['is_active' => true]);

        return redirect()->back()->with('success', 'Tahun Ajaran "' . $academicYear->name . ' - ' . $academicYear->semester . '" berhasil diaktifkan.');
    }

    public function destroy(AcademicYear $academicYear)
    {
        if ($academicYear->is_active) {
            return redirect()->back()->with('error', 'Tahun Ajaran aktif tidak dapat dihapus.');
        }

        if ($academicYear->questionBanks()->count() > 0 || $academicYear->exams()->count() > 0) {
            return redirect()->back()->with('error', 'Tahun Ajaran yang memiliki Bank Soal atau Ujian tidak dapat dihapus.');
        }

        $academicYear->delete();

        return redirect()->back()->with('success', 'Tahun Ajaran berhasil dihapus.');
    }
}
