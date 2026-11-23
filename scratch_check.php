<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\User;
use App\Models\Student;

$u = User::where('username', 'siswa')->first();
echo 'Student User ID: ' . ($u ? $u->id : 'none') . PHP_EOL;
$s = Student::where('user_id', $u?->id)->first();
echo 'Student Record ID: ' . ($s ? $s->id . ', Class: ' . $s->classroom_id : 'none') . PHP_EOL;

$sessions = ExamSession::with('exam')->get();
echo 'Total Exam Sessions: ' . $sessions->count() . PHP_EOL;
foreach ($sessions as $es) {
    echo 'Session ID: ' . $es->id . ', Exam: ' . ($es->exam?->title ?? 'none') . ', Start: ' . $es->start_time . ', End: ' . $es->end_time . ', Status: ' . $es->status . ', Token: ' . $es->token . PHP_EOL;
}
