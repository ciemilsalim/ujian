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
        $activeSessions = ExamSession::where('is_active', true)->get();
        $activeSessionIds = $activeSessions->pluck('id');
        $examSessionUsers = ExamSessionUser::whereIn('exam_session_id', $activeSessionIds)->get();
        $examIds = $activeSessions->pluck('exam_id')->unique();
        $exams = \App\Models\Exam::whereIn('id', $examIds)->get();
        $questionBankIds = $exams->pluck('question_bank_id')->unique();
        $questionBanks = QuestionBank::whereIn('id', $questionBankIds)->get();
        $questions = Question::whereIn('question_bank_id', $questionBankIds)->get();
        $subjects = Subject::whereIn('id', $questionBanks->pluck('subject_id')->filter()->unique())->get();
        
        $studentIds = $examSessionUsers->pluck('user_id')->unique();
        $students = User::whereIn('id', $studentIds)->where('role', 'siswa')->get()->makeHidden(['password', 'password_plain']);
        
        $guruIds = $questionBanks->pluck('user_id')->filter()->unique();
        $gurus = User::whereIn('id', $guruIds)->where('role', 'guru')->get()->makeHidden(['password', 'password_plain']);
        
        $classroomIds = $activeSessions->pluck('classroom_id')->merge($students->pluck('classroom_id'))->filter()->unique();
        $classrooms = Classroom::whereIn('id', $classroomIds)->get();

        $data = [
            'version' => '1.0',
            'type' => 'exam_package',
            'exported_at' => now()->toDateTimeString(),
            'settings' => Setting::all(),
            'subjects' => $subjects,
            'classrooms' => $classrooms,
            'users' => $gurus,
            'question_banks' => $questionBanks,
            'questions' => $questions,
            'exams' => $exams,
            'exam_sessions' => $activeSessions,
            'exam_session_users' => $examSessionUsers,
            'students' => $students,
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

        try {
            DB::transaction(function () use ($content) {
                // Disable foreign key checks for clean wipe/import
                DB::statement('SET FOREIGN_KEY_CHECKS=0;');

                // Import users (careful with passwords/IDs)
                if (isset($content['users'])) {
                    foreach ($content['users'] as $u) {
                        User::updateOrCreate(['id' => $u['id']], $u);
                    }
                }
                if (isset($content['students'])) {
                    foreach ($content['students'] as $s) {
                        User::updateOrCreate(['id' => $s['id']], $s);
                    }
                }

                // Other models
                $models = [
                    'settings' => Setting::class,
                    'subjects' => Subject::class,
                    'classrooms' => Classroom::class,
                    'question_banks' => QuestionBank::class,
                    'questions' => Question::class,
                    'exams' => \App\Models\Exam::class,
                    'exam_sessions' => ExamSession::class,
                    'exam_session_users' => ExamSessionUser::class,
                ];

                foreach ($models as $key => $modelClass) {
                    if (isset($content[$key])) {
                        foreach ($content[$key] as $item) {
                            $modelClass::updateOrCreate(['id' => $item['id']], $item);
                        }
                    }
                }

                DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            });

            return redirect()->back()->with('success', 'Paket ujian berhasil diimpor.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mengimpor file: ' . $e->getMessage());
        }
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

        try {
            DB::transaction(function () use ($content) {
                if (isset($content['answers'])) {
                    foreach ($content['answers'] as $a) {
                        StudentAnswer::updateOrCreate(['id' => $a['id']], $a);
                    }
                }
                // Update session statuses if needed
            });

            return redirect()->back()->with('success', 'Hasil ujian berhasil diimpor.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mengimpor hasil: ' . $e->getMessage());
        }
    }
}
