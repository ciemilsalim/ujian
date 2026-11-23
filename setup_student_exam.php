<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\ExamSessionUser;
use App\Models\QuestionBank;
use App\Models\Question;
use App\Models\StudentAnswer;

$student = User::where('username', 'siswa')->first();
if (!$student) {
    echo "Student 'siswa' not found!\n";
    exit(1);
}

// Find or create an exam with True/False questions
$bank = QuestionBank::first();
if (!$bank) {
    echo "No QuestionBank found!\n";
    exit(1);
}

$exam = Exam::first();
if (!$exam) {
    echo "No Exam found!\n";
    exit(1);
}

// Ensure session exists
$session = ExamSession::where('token', 'ZX2026')->first();
if (!$session) {
    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'name' => 'Sesi 1 - Ujian CBT Utama',
        'start_time' => now()->subHours(1),
        'end_time' => now()->addHours(8),
        'token' => 'ZX2026',
        'is_active' => true,
        'classroom_id' => null, // Available for all classrooms
    ]);
} else {
    $session->update([
        'start_time' => now()->subHours(1),
        'end_time' => now()->addHours(8),
        'is_active' => true,
        'classroom_id' => null,
    ]);
}

// Reset any previous exam_session_user for student
ExamSessionUser::where('user_id', $student->id)
    ->where('exam_session_id', $session->id)
    ->delete();

echo "Session configured: ID={$session->id}, Token={$session->token}, Exam={$exam->title}\n";
