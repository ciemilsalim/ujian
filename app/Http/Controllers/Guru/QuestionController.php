<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'question_bank_id' => 'required|exists:question_banks,id',
            'type' => 'required|in:pilihan_ganda,essay',
            'question_text' => 'required|string',
            'options' => 'required_if:type,pilihan_ganda|nullable|array',
            'answer_key' => 'required|string',
            'score_default' => 'required|integer|min:0',
        ]);

        $q = \App\Models\Question::create($request->all());

        \App\Models\AuditLog::log('created', 'Question', $q->id, null, "Menambahkan soal di bank: {$q->question_bank_id}");

        return redirect()->back()->with('success', 'Soal berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $question = \App\Models\Question::with('questionBank')->findOrFail($id);

        // Validasi kepemilikan: hanya guru pemilik bank soal yang bisa edit
        if ($question->questionBank->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'type' => 'required|in:pilihan_ganda,essay',
            'question_text' => 'required|string',
            'options' => 'required_if:type,pilihan_ganda|nullable|array',
            'answer_key' => 'required|string',
            'score_default' => 'required|integer|min:0',
        ]);

        $question->update($request->only('type', 'question_text', 'options', 'answer_key', 'score_default'));

        \App\Models\AuditLog::log('updated', 'Question', $question->id, null, "Mengubah soal #{$question->id}");

        return redirect()->back()->with('success', 'Soal berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $question = \App\Models\Question::with('questionBank')->findOrFail($id);

        if ($question->questionBank->user_id !== auth()->id()) {
            abort(403);
        }

        \App\Models\AuditLog::log('deleted', 'Question', $question->id, null, "Menghapus soal #{$question->id}");
        $question->delete();

        return redirect()->back()->with('success', 'Soal berhasil dihapus.');
    }
}
