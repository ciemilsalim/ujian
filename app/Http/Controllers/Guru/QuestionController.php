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

        \App\Models\Question::create($request->all());

        return redirect()->back()->with('success', 'Question added successfully.');
    }
}
