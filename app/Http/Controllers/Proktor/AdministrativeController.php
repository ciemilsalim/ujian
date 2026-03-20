<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\ExamSession;
use App\Models\ExamRoom;
use Inertia\Inertia;

class AdministrativeController extends Controller
{
    public function index()
    {
        $sessions = ExamSession::with(['exam', 'classroom'])->latest()->get();
        $classrooms = Classroom::withCount('users')->orderBy('name')->get();

        return Inertia::render('Proktor/Administration/Index', [
            'sessions' => $sessions,
            'classrooms' => $classrooms,
            'rooms' => ExamRoom::all(),
        ]);
    }
}
