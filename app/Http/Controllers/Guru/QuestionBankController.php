<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class QuestionBankController
{
    public function index()
    {
        $questionBanks = \App\Models\QuestionBank::with(['subject', 'user'])
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(10);
        $subjects = \App\Models\Subject::all();
        return \Inertia\Inertia::render('Guru/QuestionBanks/Index', [
            'questionBanks' => $questionBanks,
            'subjects' => $subjects
        ]);
    }

    public function show($id)
    {
        $questionBank = \App\Models\QuestionBank::with(['subject', 'questions'])->findOrFail($id);

        if ($questionBank->user_id !== auth()->id()) {
            abort(403);
        }

        return \Inertia\Inertia::render('Guru/QuestionBanks/Show', [
            'questionBank' => $questionBank
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        \App\Models\QuestionBank::create([
            'subject_id' => $request->subject_id,
            'user_id' => auth()->id(),
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Question Bank created successfully.');
    }
}
