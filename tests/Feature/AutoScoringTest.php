<?php

use App\Models\User;
use App\Models\Subject;
use App\Models\QuestionBank;
use App\Models\Question;
use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\ExamSessionUser;
use App\Models\Classroom;

beforeEach(function () {
    $this->classroom = Classroom::create(['name' => 'Test Class', 'description' => 'Test']);
    $this->guru = User::create([
        'username' => 'testguru',
        'name' => 'Test Guru',
        'email' => 'guru@test.com',
        'password' => bcrypt('password'),
        'role' => 'guru',
    ]);
    $this->siswa = User::create([
        'username' => 'testsiswa',
        'name' => 'Test Siswa',
        'email' => 'siswa@test.com',
        'password' => bcrypt('password'),
        'role' => 'siswa',
        'classroom_id' => $this->classroom->id,
    ]);

    $subject = Subject::create(['name' => 'Matematika', 'description' => 'Math']);
    $this->qb = QuestionBank::create([
        'subject_id' => $subject->id,
        'user_id' => $this->guru->id,
        'name' => 'Bank Soal Test',
    ]);

    // Create 4 multiple choice questions
    $this->questions = [];
    foreach (['A', 'B', 'C', 'D'] as $i => $key) {
        $this->questions[] = Question::create([
            'question_bank_id' => $this->qb->id,
            'type' => 'pilihan_ganda',
            'question_text' => "Soal " . ($i + 1),
            'options' => ['A' => 'Opsi A', 'B' => 'Opsi B', 'C' => 'Opsi C', 'D' => 'Opsi D'],
            'answer_key' => $key,
            'score_default' => 25,
        ]);
    }

    $this->exam = Exam::create([
        'question_bank_id' => $this->qb->id,
        'title' => 'Ujian Test',
        'duration' => 60,
    ]);

    $this->session = ExamSession::create([
        'exam_id' => $this->exam->id,
        'classroom_id' => $this->classroom->id,
        'name' => 'Sesi Test',
        'start_time' => now()->subHour(),
        'end_time' => now()->addHour(),
        'token' => 'ABCDEF',
        'is_active' => true,
    ]);

    $this->examUser = ExamSessionUser::create([
        'exam_session_id' => $this->session->id,
        'user_id' => $this->siswa->id,
        'status' => 'working',
    ]);
});

it('scores 100% when all multiple choice answers are correct', function () {
    $answers = [];
    foreach ($this->questions as $i => $q) {
        $answers[$q->id] = ['A', 'B', 'C', 'D'][$i];
    }

    $response = $this->actingAs($this->siswa)->post(route('siswa.exams.submit'), [
        'exam_session_id' => $this->session->id,
        'answers' => $answers,
        'finish' => true,
    ]);

    $this->examUser->refresh();
    expect($this->examUser->score)->toBe(100);
    expect($this->examUser->status)->toBe('finished');
});

it('scores 0% when all multiple choice answers are wrong', function () {
    $answers = [];
    // All wrong: answer D for every question (only Q4 has D as correct)
    // Actually let's make them clearly wrong
    $wrongAnswers = ['D', 'A', 'A', 'A']; // Q1=A→D(wrong), Q2=B→A(wrong), Q3=C→A(wrong), Q4=D→A(wrong)
    foreach ($this->questions as $i => $q) {
        $answers[$q->id] = $wrongAnswers[$i];
    }

    $response = $this->actingAs($this->siswa)->post(route('siswa.exams.submit'), [
        'exam_session_id' => $this->session->id,
        'answers' => $answers,
        'finish' => true,
    ]);

    $this->examUser->refresh();
    expect($this->examUser->score)->toBe(0);
});

it('scores 50% when half of answers are correct', function () {
    // Q1 correct (A), Q2 correct (B), Q3 wrong, Q4 wrong
    $answers = [
        $this->questions[0]->id => 'A', // correct
        $this->questions[1]->id => 'B', // correct
        $this->questions[2]->id => 'A', // wrong (should be C)
        $this->questions[3]->id => 'A', // wrong (should be D)
    ];

    $response = $this->actingAs($this->siswa)->post(route('siswa.exams.submit'), [
        'exam_session_id' => $this->session->id,
        'answers' => $answers,
        'finish' => true,
    ]);

    $this->examUser->refresh();
    expect($this->examUser->score)->toBe(50);
});

it('marks individual answers as correct or incorrect', function () {
    $answers = [
        $this->questions[0]->id => 'A', // correct
        $this->questions[1]->id => 'A', // wrong (should be B)
    ];

    $this->actingAs($this->siswa)->post(route('siswa.exams.submit'), [
        'exam_session_id' => $this->session->id,
        'answers' => $answers,
        'finish' => true,
    ]);

    $studentAnswers = \App\Models\StudentAnswer::where('exam_session_user_id', $this->examUser->id)->get();
    $correct = $studentAnswers->where('question_id', $this->questions[0]->id)->first();
    $wrong = $studentAnswers->where('question_id', $this->questions[1]->id)->first();

    expect($correct->is_correct)->toBeTrue();
    expect($correct->score)->toBe(25);
    expect($wrong->is_correct)->toBeFalse();
    expect($wrong->score)->toBe(0);
});

it('does not score when not finishing (auto-save)', function () {
    $answers = [
        $this->questions[0]->id => 'A',
    ];

    $this->actingAs($this->siswa)->post(route('siswa.exams.submit'), [
        'exam_session_id' => $this->session->id,
        'answers' => $answers,
        'finish' => false,
    ]);

    $this->examUser->refresh();
    expect($this->examUser->score)->toBeNull();
    expect($this->examUser->status)->toBe('working');
});

it('handles essay questions without auto-scoring', function () {
    // Add an essay question
    $essayQ = Question::create([
        'question_bank_id' => $this->qb->id,
        'type' => 'essay',
        'question_text' => 'Jelaskan teori relativitas.',
        'answer_key' => 'Teori relativitas menjelaskan...',
        'score_default' => 50,
    ]);

    $answers = [
        $this->questions[0]->id => 'A', // PG correct
        $essayQ->id => 'Jawaban essay siswa', // Essay - not auto-scored
    ];

    $this->actingAs($this->siswa)->post(route('siswa.exams.submit'), [
        'exam_session_id' => $this->session->id,
        'answers' => $answers,
        'finish' => true,
    ]);

    $essayAnswer = \App\Models\StudentAnswer::where('exam_session_user_id', $this->examUser->id)
        ->where('question_id', $essayQ->id)
        ->first();

    // Essay should not be auto-scored
    expect($essayAnswer->is_correct)->toBeNull();
});
