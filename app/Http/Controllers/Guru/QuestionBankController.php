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

        $qb = \App\Models\QuestionBank::create([
            'subject_id' => $request->subject_id,
            'user_id' => auth()->id(),
            'name' => $request->name,
            'description' => $request->description,
        ]);

        \App\Models\AuditLog::log('created', 'QuestionBank', $qb->id, null, "Membuat bank soal: {$qb->name}");

        return redirect()->back()->with('success', 'Bank soal berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $questionBank = \App\Models\QuestionBank::findOrFail($id);

        if ($questionBank->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $old = $questionBank->toArray();
        $questionBank->update([
            'subject_id' => $request->subject_id,
            'name' => $request->name,
            'description' => $request->description,
        ]);

        \App\Models\AuditLog::log('updated', 'QuestionBank', $questionBank->id, ['old' => $old, 'new' => $questionBank->fresh()->toArray()], "Mengubah bank soal: {$questionBank->name}");

        return redirect()->back()->with('success', 'Bank soal berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $questionBank = \App\Models\QuestionBank::findOrFail($id);

        if ($questionBank->user_id !== auth()->id()) {
            abort(403);
        }

        \App\Models\AuditLog::log('deleted', 'QuestionBank', $questionBank->id, null, "Menghapus bank soal: {$questionBank->name}");
        $questionBank->delete();

        return redirect()->back()->with('success', 'Bank soal berhasil dihapus.');
    }
}
