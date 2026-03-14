<?php

use App\Models\User;
use App\Models\Subject;
use App\Models\QuestionBank;
use App\Models\Question;

beforeEach(function () {
    $this->guru = User::create([
        'username' => 'testguru',
        'name' => 'Test Guru',
        'email' => 'guru@test.com',
        'password' => bcrypt('password'),
        'role' => 'guru',
    ]);

    $this->otherGuru = User::create([
        'username' => 'otherguru',
        'name' => 'Other Guru',
        'email' => 'other@test.com',
        'password' => bcrypt('password'),
        'role' => 'guru',
    ]);

    $subject = Subject::create(['name' => 'Matematika', 'description' => 'Math']);

    $this->qb = QuestionBank::create([
        'subject_id' => $subject->id,
        'user_id' => $this->guru->id,
        'name' => 'Bank Soal Test',
    ]);

    $this->otherQb = QuestionBank::create([
        'subject_id' => $subject->id,
        'user_id' => $this->otherGuru->id,
        'name' => 'Bank Soal Lain',
    ]);
});

it('can create a pilihan ganda question', function () {
    $response = $this->actingAs($this->guru)->post(route('guru.questions.store'), [
        'question_bank_id' => $this->qb->id,
        'type' => 'pilihan_ganda',
        'question_text' => 'Berapa 1+1?',
        'options' => ['a' => '1', 'b' => '2', 'c' => '3', 'd' => '4', 'e' => '5'],
        'answer_key' => 'b',
        'score_default' => 10,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('questions', [
        'question_bank_id' => $this->qb->id,
        'type' => 'pilihan_ganda',
        'answer_key' => 'b',
    ]);
});

it('can create an essay question', function () {
    $response = $this->actingAs($this->guru)->post(route('guru.questions.store'), [
        'question_bank_id' => $this->qb->id,
        'type' => 'essay',
        'question_text' => 'Jelaskan teori evolusi.',
        'options' => null,
        'answer_key' => 'Teori evolusi menjelaskan perubahan makhluk hidup...',
        'score_default' => 20,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('questions', [
        'question_bank_id' => $this->qb->id,
        'type' => 'essay',
    ]);
});

it('can update own question', function () {
    $question = Question::create([
        'question_bank_id' => $this->qb->id,
        'type' => 'pilihan_ganda',
        'question_text' => 'Soal Lama',
        'options' => ['a' => 'A', 'b' => 'B', 'c' => 'C', 'd' => 'D', 'e' => 'E'],
        'answer_key' => 'a',
        'score_default' => 10,
    ]);

    $response = $this->actingAs($this->guru)->put(route('guru.questions.update', $question->id), [
        'type' => 'pilihan_ganda',
        'question_text' => 'Soal Baru',
        'options' => ['a' => 'X', 'b' => 'Y', 'c' => 'Z', 'd' => 'W', 'e' => 'V'],
        'answer_key' => 'c',
        'score_default' => 15,
    ]);

    $response->assertRedirect();
    $question->refresh();
    expect($question->question_text)->toBe('Soal Baru');
    expect($question->answer_key)->toBe('c');
    expect($question->score_default)->toBe(15);
});

it('cannot update question from another guru bank', function () {
    $question = Question::create([
        'question_bank_id' => $this->otherQb->id,
        'type' => 'pilihan_ganda',
        'question_text' => 'Soal Orang Lain',
        'options' => ['a' => 'A', 'b' => 'B', 'c' => 'C', 'd' => 'D', 'e' => 'E'],
        'answer_key' => 'a',
        'score_default' => 5,
    ]);

    $response = $this->actingAs($this->guru)->put(route('guru.questions.update', $question->id), [
        'type' => 'pilihan_ganda',
        'question_text' => 'Coba edit',
        'options' => ['a' => 'A', 'b' => 'B', 'c' => 'C', 'd' => 'D', 'e' => 'E'],
        'answer_key' => 'b',
        'score_default' => 10,
    ]);

    $response->assertStatus(403);
});

it('can delete own question', function () {
    $question = Question::create([
        'question_bank_id' => $this->qb->id,
        'type' => 'essay',
        'question_text' => 'Hapus soal ini',
        'answer_key' => '-',
        'score_default' => 5,
    ]);

    $response = $this->actingAs($this->guru)->delete(route('guru.questions.destroy', $question->id));

    $response->assertRedirect();
    $this->assertDatabaseMissing('questions', ['id' => $question->id]);
});

it('cannot delete question from another guru bank', function () {
    $question = Question::create([
        'question_bank_id' => $this->otherQb->id,
        'type' => 'essay',
        'question_text' => 'Soal orang lain',
        'answer_key' => '-',
        'score_default' => 5,
    ]);

    $response = $this->actingAs($this->guru)->delete(route('guru.questions.destroy', $question->id));

    $response->assertStatus(403);
});
