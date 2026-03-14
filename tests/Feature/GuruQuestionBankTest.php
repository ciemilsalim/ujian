<?php

use App\Models\User;
use App\Models\Subject;
use App\Models\QuestionBank;

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

    $this->subject = Subject::create(['name' => 'Matematika', 'description' => 'Math']);
});

it('can create a question bank', function () {
    $response = $this->actingAs($this->guru)->post(route('guru.question-banks.store'), [
        'subject_id' => $this->subject->id,
        'name' => 'Bank Soal Baru',
        'description' => 'Deskripsi bank soal',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('question_banks', [
        'name' => 'Bank Soal Baru',
        'user_id' => $this->guru->id,
    ]);
});

it('can update own question bank', function () {
    $qb = QuestionBank::create([
        'subject_id' => $this->subject->id,
        'user_id' => $this->guru->id,
        'name' => 'Bank Soal Lama',
    ]);

    $response = $this->actingAs($this->guru)->put(route('guru.question-banks.update', $qb->id), [
        'subject_id' => $this->subject->id,
        'name' => 'Bank Soal Baru',
        'description' => 'Updated',
    ]);

    $response->assertRedirect();
    $qb->refresh();
    expect($qb->name)->toBe('Bank Soal Baru');
    expect($qb->description)->toBe('Updated');
});

it('cannot update another guru question bank', function () {
    $qb = QuestionBank::create([
        'subject_id' => $this->subject->id,
        'user_id' => $this->otherGuru->id,
        'name' => 'Bank Soal Orang Lain',
    ]);

    $response = $this->actingAs($this->guru)->put(route('guru.question-banks.update', $qb->id), [
        'subject_id' => $this->subject->id,
        'name' => 'Coba Edit',
    ]);

    $response->assertStatus(403);
});

it('can delete own question bank', function () {
    $qb = QuestionBank::create([
        'subject_id' => $this->subject->id,
        'user_id' => $this->guru->id,
        'name' => 'Bank Soal Hapus',
    ]);

    $response = $this->actingAs($this->guru)->delete(route('guru.question-banks.destroy', $qb->id));

    $response->assertRedirect();
    $this->assertDatabaseMissing('question_banks', ['id' => $qb->id]);
});

it('cannot delete another guru question bank', function () {
    $qb = QuestionBank::create([
        'subject_id' => $this->subject->id,
        'user_id' => $this->otherGuru->id,
        'name' => 'Bank Soal Orang Lain',
    ]);

    $response = $this->actingAs($this->guru)->delete(route('guru.question-banks.destroy', $qb->id));

    $response->assertStatus(403);
});

it('validates required fields on create', function () {
    $response = $this->actingAs($this->guru)->post(route('guru.question-banks.store'), [
        'name' => '',
    ]);

    $response->assertSessionHasErrors(['subject_id', 'name']);
});
