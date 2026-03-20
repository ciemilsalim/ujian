<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Setting;
use App\Models\Subject;
use App\Models\Classroom;
use App\Models\User;
use App\Models\QuestionBank;
use App\Models\Question;
use App\Models\StudentAnswer;
use App\Models\ExamSession;
use App\Models\ExamSessionUser;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SyncController extends Controller
{
    public function index()
    {
        $appMode = Setting::where('key', 'app_mode')->first()?->value ?? 'online';
        
        return Inertia::render('Proktor/Sync/Index', [
            'appMode' => $appMode,
            'stats' => [
                'subjects' => Subject::count(),
                'classrooms' => Classroom::count(),
                'question_banks' => QuestionBank::count(),
                'exam_sessions' => ExamSession::count(),
                'answers' => StudentAnswer::count(),
            ]
        ]);
    }

    public function exportExam()
    {
        $data = [
            'version' => '1.0',
            'type' => 'exam_package',
            'exported_at' => now()->toDateTimeString(),
            'settings' => Setting::all(),
            'subjects' => Subject::all(),
            'classrooms' => Classroom::all(),
            'users' => User::where('role', 'guru')->get(),
            'question_banks' => QuestionBank::all(),
            'questions' => Question::all(),
            'exam_sessions' => ExamSession::all(),
            'exam_session_users' => ExamSessionUser::all(),
            // Students are needed too
            'students' => User::where('role', 'siswa')->get(),
        ];

        $filename = 'EXAM_PACKAGE_' . date('Ymd_His') . '.json';
        
        return response()->streamDownload(function () use ($data) {
            echo json_encode($data, JSON_PRETTY_PRINT);
        }, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }

    public function importExam(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json',
        ]);

        $content = json_decode(file_get_contents($request->file('file')->getRealPath()), true);

        if (!$content || !isset($content['type']) || $content['type'] !== 'exam_package') {
            return redirect()->back()->with('error', 'Format file tidak valid atau bukan paket ujian.');
        }

        DB::transaction(function () use ($content) {
            // We usually want to clear existing data before import in Offline mode
            // or merge carefully. Given CBT context, full overwrite is common for fresh sync.
            
            // Disable foreign key checks for clean wipe/import
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            // Import users (careful with passwords/IDs)
            foreach ($content['users'] as $u) {
                User::updateOrCreate(['id' => $u['id']], $u);
            }
            foreach ($content['students'] as $s) {
                User::updateOrCreate(['id' => $s['id']], $s);
            }

            // Other models
            $models = [
                'settings' => Setting::class,
                'subjects' => Subject::class,
                'classrooms' => Classroom::class,
                'question_banks' => QuestionBank::class,
                'questions' => Question::class,
                'exam_sessions' => ExamSession::class,
                'exam_session_users' => ExamSessionUser::class,
            ];

            foreach ($models as $key => $modelClass) {
                foreach ($content[$key] as $item) {
                    $modelClass::updateOrCreate(['id' => $item['id']], $item);
                }
            }

            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        });

        return redirect()->back()->with('success', 'Paket ujian berhasil diimpor.');
    }

    public function exportResults()
    {
        $data = [
            'version' => '1.0',
            'type' => 'results_package',
            'exported_at' => now()->toDateTimeString(),
            'answers' => StudentAnswer::all(),
            'sessions' => ExamSession::with('users')->get(),
        ];

        $filename = 'RESULTS_PACKAGE_' . date('Ymd_His') . '.json';
        
        return response()->streamDownload(function () use ($data) {
            echo json_encode($data, JSON_PRETTY_PRINT);
        }, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }

    public function importResults(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json',
        ]);

        $content = json_decode(file_get_contents($request->file('file')->getRealPath()), true);

        if (!$content || !isset($content['type']) || $content['type'] !== 'results_package') {
            return redirect()->back()->with('error', 'Format file tidak valid atau bukan paket hasil.');
        }

        DB::transaction(function () use ($content) {
            foreach ($content['answers'] as $a) {
                StudentAnswer::updateOrCreate(['id' => $a['id']], $a);
            }
            // Update session statuses if needed
        });

        return redirect()->back()->with('success', 'Hasil ujian berhasil diimpor.');
    }
}
