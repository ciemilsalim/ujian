<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Exam;
use App\Models\QuestionBank;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $activeYear = \App\Models\AcademicYear::getActive();
        $academicYearId = $request->input('academic_year_id', $activeYear ? $activeYear->id : null);

        $query = Exam::with(['questionBank.subject', 'academicYear'])->latest();

        if ($academicYearId && $academicYearId !== 'all') {
            $query->where('academic_year_id', $academicYearId);
        }

        $exams = $query->paginate(10)->withQueryString();
        $questionBanks = QuestionBank::with('subject')->latest()->get();
        $academicYears = \App\Models\AcademicYear::orderBy('id', 'desc')->get();

        return \Inertia\Inertia::render('Proktor/Exams/Index', [
            'exams' => $exams,
            'questionBanks' => $questionBanks,
            'academicYears' => $academicYears,
            'selectedAcademicYearId' => $academicYearId ? (string)$academicYearId : 'all',
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'question_bank_id' => 'required|exists:question_banks,id',
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'duration' => 'required|integer|min:1',
            'random_question' => 'boolean',
            'random_option' => 'boolean',
            'show_result' => 'boolean',
            'is_practice' => 'boolean',
        ]);

        $activeYear = \App\Models\AcademicYear::getActive();
        $academicYearId = $request->academic_year_id ?? ($activeYear ? $activeYear->id : null);

        $exam = Exam::create([
            'title' => $request->title,
            'question_bank_id' => $request->question_bank_id,
            'academic_year_id' => $academicYearId,
            'duration' => $request->duration,
            'random_question' => $request->random_question ?? false,
            'random_option' => $request->random_option ?? false,
            'show_result' => $request->show_result ?? false,
            'is_practice' => $request->is_practice ?? false,
        ]);

        \App\Models\AuditLog::log('created', 'Exam', $exam->id, null, "Membuat ujian: {$exam->title}");

        return redirect()->back()->with('success', 'Ujian berhasil ditambahkan.');
    }

    public function update(Request $request, Exam $exam)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'question_bank_id' => 'required|exists:question_banks,id',
            'duration' => 'required|integer|min:1',
            'random_question' => 'boolean',
            'random_option' => 'boolean',
            'show_result' => 'boolean',
            'is_practice' => 'boolean',
        ]);

        $exam->update([
            'title' => $request->title,
            'question_bank_id' => $request->question_bank_id,
            'duration' => $request->duration,
            'random_question' => $request->random_question ?? false,
            'random_option' => $request->random_option ?? false,
            'show_result' => $request->show_result ?? false,
            'is_practice' => $request->is_practice ?? false,
        ]);

        \App\Models\AuditLog::log('updated', 'Exam', $exam->id, null, "Mengubah ujian: {$exam->title}");

        return redirect()->back()->with('success', 'Ujian berhasil diperbarui.');
    }

    public function destroy(Exam $exam)
    {
        \App\Models\AuditLog::log('deleted', 'Exam', $exam->id, null, "Menghapus ujian: {$exam->title}");
        $exam->delete();
        return redirect()->back()->with('success', 'Ujian berhasil dihapus.');
    }
}
