<?php

use App\Models\User;
use App\Models\Subject;
use App\Models\QuestionBank;
use App\Models\Question;
use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\ExamSessionUser;
use App\Models\Classroom;
use App\Models\StudentAnswer;

beforeEach(function () {
    $this->classroom = Classroom::create(['name' => 'Kelas Test BS', 'description' => 'Test']);
    $this->guru = User::create([
        'username' => 'gurubs',
        'name' => 'Guru BS',
        'email' => 'gurubs@test.com',
        'password' => bcrypt('password'),
        'role' => 'guru',
    ]);
    $this->siswa = User::create([
        'username' => 'siswabs',
        'name' => 'Siswa BS',
        'email' => 'siswabs@test.com',
        'password' => bcrypt('password'),
        'role' => 'siswa',
        'classroom_id' => $this->classroom->id,
    ]);

    $subject = Subject::create(['name' => 'IPA', 'description' => 'Sains']);
    $this->qb = QuestionBank::create([
        'subject_id' => $subject->id,
        'user_id' => $this->guru->id,
        'name' => 'Bank Soal Benar Salah',
    ]);
});

it('can create a benar salah question with statements and answer key', function () {
    $answerKey = json_encode(['a' => 'benar', 'b' => 'salah', 'c' => 'benar']);

    $response = $this->actingAs($this->guru)->post(route('guru.questions.store'), [
        'question_bank_id' => $this->qb->id,
        'type' => 'benar_salah',
        'question_text' => 'Tentukan kebenaran dari pernyataan sains berikut:',
        'options' => [
            'a' => 'Matahari adalah bintang',
            'b' => 'Bulan menghasilkan cahaya sendiri',
            'c' => 'Bumi mengelilingi matahari',
        ],
        'answer_key' => $answerKey,
        'score_default' => 30,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('questions', [
        'question_bank_id' => $this->qb->id,
        'type' => 'benar_salah',
        'score_default' => 30,
    ]);

    $created = Question::where('question_bank_id', $this->qb->id)->first();
    expect($created->type)->toBe('benar_salah');
    expect($created->options['a'])->toBe('Matahari adalah bintang');
    expect($created->options['b'])->toBe('Bulan menghasilkan cahaya sendiri');
});

it('can update a benar salah question', function () {
    $question = Question::create([
        'question_bank_id' => $this->qb->id,
        'type' => 'benar_salah',
        'question_text' => 'Pernyataan awal',
        'options' => ['a' => 'Pernyataan 1', 'b' => 'Pernyataan 2'],
        'answer_key' => json_encode(['a' => 'benar', 'b' => 'salah']),
        'score_default' => 20,
    ]);

    $response = $this->actingAs($this->guru)->put(route('guru.questions.update', $question->id), [
        'type' => 'benar_salah',
        'question_text' => 'Pernyataan diperbarui',
        'options' => ['a' => 'Pernyataan 1 Baru', 'b' => 'Pernyataan 2 Baru', 'c' => 'Pernyataan 3 Baru'],
        'answer_key' => json_encode(['a' => 'salah', 'b' => 'benar', 'c' => 'benar']),
        'score_default' => 25,
    ]);

    $response->assertRedirect();
    $question->refresh();
    expect($question->question_text)->toBe('Pernyataan diperbarui');
    expect($question->score_default)->toBe(25);
    expect($question->options['c'])->toBe('Pernyataan 3 Baru');
});

it('scores 100% when student answers all statements of benar salah correctly', function () {
    $question = Question::create([
        'question_bank_id' => $this->qb->id,
        'type' => 'benar_salah',
        'question_text' => 'Periksa pernyataan berikut:',
        'options' => [
            'a' => 'Air membeku pada 0 derajat Celsius',
            'b' => 'Minyak larut sempurna dalam air',
        ],
        'answer_key' => json_encode(['a' => 'benar', 'b' => 'salah']),
        'score_default' => 50,
    ]);

    $exam = Exam::create([
        'question_bank_id' => $this->qb->id,
        'title' => 'Ujian BS',
        'duration' => 60,
    ]);

    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'classroom_id' => $this->classroom->id,
        'name' => 'Sesi BS',
        'start_time' => now()->subHour(),
        'end_time' => now()->addHour(),
        'token' => 'BSTOKEN',
        'is_active' => true,
    ]);

    $examUser = ExamSessionUser::create([
        'exam_session_id' => $session->id,
        'user_id' => $this->siswa->id,
        'status' => 'working',
        'started_at' => now(),
    ]);

    // Student submits the correct answers
    $studentAnswers = json_encode(['a' => 'benar', 'b' => 'salah']);

    $response = $this->actingAs($this->siswa)->post(route('siswa.exams.submit'), [
        'exam_session_id' => $session->id,
        'answers' => [$question->id => $studentAnswers],
        'finish' => true,
    ]);

    $examUser->refresh();
    expect($examUser->score)->toBe(100);
    expect($examUser->status)->toBe('finished');

    $savedAnswer = StudentAnswer::where('exam_session_user_id', $examUser->id)
        ->where('question_id', $question->id)
        ->first();

    expect($savedAnswer->is_correct)->toBeTrue();
    expect($savedAnswer->score)->toBe(50);
});

it('scores 0% when student answers a statement incorrectly in benar salah', function () {
    $question = Question::create([
        'question_bank_id' => $this->qb->id,
        'type' => 'benar_salah',
        'question_text' => 'Periksa pernyataan berikut:',
        'options' => [
            'a' => 'Pernyataan 1',
            'b' => 'Pernyataan 2',
        ],
        'answer_key' => json_encode(['a' => 'benar', 'b' => 'salah']),
        'score_default' => 50,
    ]);

    $exam = Exam::create([
        'question_bank_id' => $this->qb->id,
        'title' => 'Ujian BS',
        'duration' => 60,
    ]);

    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'classroom_id' => $this->classroom->id,
        'name' => 'Sesi BS Salah',
        'start_time' => now()->subHour(),
        'end_time' => now()->addHour(),
        'token' => 'BSTOKEN',
        'is_active' => true,
    ]);

    $examUser = ExamSessionUser::create([
        'exam_session_id' => $session->id,
        'user_id' => $this->siswa->id,
        'status' => 'working',
        'started_at' => now(),
    ]);

    // Student submits incorrect answers (a is salah instead of benar)
    $studentAnswers = json_encode(['a' => 'salah', 'b' => 'salah']);

    $response = $this->actingAs($this->siswa)->post(route('siswa.exams.submit'), [
        'exam_session_id' => $session->id,
        'answers' => [$question->id => $studentAnswers],
        'finish' => true,
    ]);

    $examUser->refresh();
    expect($examUser->score)->toBe(0);

    $savedAnswer = StudentAnswer::where('exam_session_user_id', $examUser->id)
        ->where('question_id', $question->id)
        ->first();

    expect($savedAnswer->is_correct)->toBeFalse();
    expect($savedAnswer->score)->toBe(0);
});

it('evaluates single-statement benar salah question accurately', function () {
    $question = Question::create([
        'question_bank_id' => $this->qb->id,
        'type' => 'benar_salah',
        'question_text' => 'Bumi berbentuk bulat pepat.',
        'options' => null,
        'answer_key' => 'benar',
        'score_default' => 10,
    ]);

    $exam = Exam::create([
        'question_bank_id' => $this->qb->id,
        'title' => 'Ujian Single BS',
        'duration' => 60,
    ]);

    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'classroom_id' => $this->classroom->id,
        'name' => 'Sesi Single BS',
        'start_time' => now()->subHour(),
        'end_time' => now()->addHour(),
        'token' => 'BSTOKEN',
        'is_active' => true,
    ]);

    $examUser = ExamSessionUser::create([
        'exam_session_id' => $session->id,
        'user_id' => $this->siswa->id,
        'status' => 'working',
        'started_at' => now(),
    ]);

    $this->actingAs($this->siswa)->post(route('siswa.exams.submit'), [
        'exam_session_id' => $session->id,
        'answers' => [$question->id => 'benar'],
        'finish' => true,
    ]);

    $examUser->refresh();
    expect($examUser->score)->toBe(100);

    $savedAnswer = StudentAnswer::where('exam_session_user_id', $examUser->id)
        ->where('question_id', $question->id)
        ->first();

    expect($savedAnswer->is_correct)->toBeTrue();
});
