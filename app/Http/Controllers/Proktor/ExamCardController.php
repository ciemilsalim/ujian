<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Classroom;
use App\Models\Setting;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ExamCardController extends Controller
{
    public function index()
    {
        $classrooms = Classroom::all();
        return \Inertia\Inertia::render('Proktor/ExamCards/Index', [
            'classrooms' => $classrooms
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
        ]);

        $classroom = Classroom::findOrFail($request->classroom_id);
        $students = User::where('role', 'siswa')
            ->where('classroom_id', $classroom->id)
            ->get();

        $settings = Setting::pluck('value', 'key')->toArray();
        $schoolName = $settings['school_name'] ?? 'Nama Sekolah Belum Diatur';
        $schoolAddress = $settings['school_address'] ?? 'Alamat Sekolah Belum Diatur';

        $pdf = Pdf::loadView('pdf.exam-cards', compact('students', 'classroom', 'schoolName', 'schoolAddress'))->setPaper('legal', 'portrait');

        return $pdf->stream('Kartu_Ujian_' . str_replace(' ', '_', $classroom->name) . '.pdf');
    }
}
