<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = \App\Models\Subject::latest()->paginate(10);
        return \Inertia\Inertia::render('Proktor/Subjects/Index', [
            'subjects' => $subjects
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:subjects,code',
        ]);

        \App\Models\Subject::create($request->all());

        return redirect()->back()->with('success', 'Subject created successfully.');
    }

    public function update(Request $request, $id)
    {
        $subject = \App\Models\Subject::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:subjects,code,' . $subject->id,
        ]);

        $subject->update($request->all());

        return redirect()->back()->with('success', 'Subject updated successfully.');
    }

    public function destroy($id)
    {
        $subject = \App\Models\Subject::findOrFail($id);
        if ($subject->questionBanks()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete subject with existing question banks.');
        }
        $subject->delete();

        return redirect()->back()->with('success', 'Subject deleted successfully.');
    }
}
