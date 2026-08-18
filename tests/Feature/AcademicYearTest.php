<?php

use App\Models\AcademicYear;
use App\Models\Exam;
use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\User;

test('proktor can create and activate academic years', function () {
    $proktor = User::factory()->create(['role' => 'proktor']);

    $response = $this
        ->actingAs($proktor)
        ->post(route('proktor.academic-years.store'), [
            'name' => '2026/2027',
            'semester' => 'Genap',
            'is_active' => true,
        ]);

    $response->assertSessionHasNoErrors();
    $year = AcademicYear::where('name', '2026/2027')->first();
    expect($year)->not->toBeNull();
    expect($year->is_active)->toBeTrue();
});

test('setting active academic year resets previous active year', function () {
    $proktor = User::factory()->create(['role' => 'proktor']);
    $year1 = AcademicYear::create(['name' => '2025/2026', 'semester' => 'Ganjil', 'is_active' => true]);
    $year2 = AcademicYear::create(['name' => '2025/2026', 'semester' => 'Genap', 'is_active' => false]);

    $response = $this
        ->actingAs($proktor)
        ->patch(route('proktor.academic-years.set-active', $year2->id));

    $response->assertSessionHasNoErrors();
    expect($year1->fresh()->is_active)->toBeFalse();
    expect($year2->fresh()->is_active)->toBeTrue();
});

test('new question bank and exam automatically associate with active academic year', function () {
    $activeYear = AcademicYear::where('is_active', true)->first();
    if (!$activeYear) {
        $activeYear = AcademicYear::create(['name' => '2025/2026', 'semester' => 'Ganjil', 'is_active' => true]);
    }

    $guru = User::factory()->create(['role' => 'guru']);
    $subject = Subject::create(['name' => 'Matematika', 'code' => 'MTK']);

    $this->actingAs($guru)->post(route('guru.question-banks.store'), [
        'subject_id' => $subject->id,
        'name' => 'Bank Soal MTK 1',
    ]);

    $bank = QuestionBank::where('name', 'Bank Soal MTK 1')->first();
    expect($bank->academic_year_id)->toBe($activeYear->id);

    $proktor = User::factory()->create(['role' => 'proktor']);
    $this->actingAs($proktor)->post(route('proktor.exams.store'), [
        'title' => 'UTS Matematika',
        'question_bank_id' => $bank->id,
        'duration' => 60,
    ]);

    $exam = Exam::where('title', 'UTS Matematika')->first();
    expect($exam->academic_year_id)->toBe($activeYear->id);
});
