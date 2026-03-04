<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Exam;
use App\Models\QuestionBank;

class ExamController extends Controller
{
    public function index()
    {
        $exams = Exam::with('questionBank.subject')->latest()->paginate(10);
        $questionBanks = QuestionBank::with('subject')->latest()->get();

        return \Inertia\Inertia::render('Proktor/Exams/Index', [
            'exams' => $exams,
            'questionBanks' => $questionBanks
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'question_bank_id' => 'required|exists:question_banks,id',
            'duration' => 'required|integer|min:1',
            'random_question' => 'boolean',
            'random_option' => 'boolean',
            'show_result' => 'boolean',
        ]);

        Exam::create([
            'title' => $request->title,
            'question_bank_id' => $request->question_bank_id,
            'duration' => $request->duration,
            'random_question' => $request->random_question ?? false,
            'random_option' => $request->random_option ?? false,
            'show_result' => $request->show_result ?? false,
        ]);

        return redirect()->back()->with('success', 'Ujian berhasil ditambahkan.');
    }

    public function destroy(Exam $exam)
    {
        $exam->delete();
        return redirect()->back()->with('success', 'Ujian berhasil dihapus.');
    }
}
