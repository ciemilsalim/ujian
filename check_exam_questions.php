<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Exam;

$exam = Exam::with(['questionBank.questions'])->first();
echo "Exam: " . $exam->title . PHP_EOL;
echo "Total Questions: " . $exam->questionBank->questions->count() . PHP_EOL;
foreach ($exam->questionBank->questions as $i => $q) {
    echo "Q" . ($i+1) . " [type=" . $q->type . "]: " . substr(strip_tags($q->question_text), 0, 60) . "..." . PHP_EOL;
}
