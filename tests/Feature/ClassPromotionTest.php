<?php

use App\Models\Classroom;
use App\Models\User;

test('proktor can view class promotion page', function () {
    $proktor = User::factory()->create(['role' => 'proktor']);
    $classA = Classroom::create(['name' => 'Kelas 7A']);

    $response = $this
        ->actingAs($proktor)
        ->get(route('proktor.class-promotions.index'));

    $response->assertOk();
});

test('proktor can promote selective students to a new class', function () {
    $proktor = User::factory()->create(['role' => 'proktor']);
    $classA = Classroom::create(['name' => 'Kelas 7A']);
    $classB = Classroom::create(['name' => 'Kelas 8A']);

    $student1 = User::factory()->create(['role' => 'siswa', 'classroom_id' => $classA->id]);
    $student2 = User::factory()->create(['role' => 'siswa', 'classroom_id' => $classA->id]);

    $response = $this
        ->actingAs($proktor)
        ->post(route('proktor.class-promotions.promote'), [
            'student_ids' => [$student1->id],
            'target_classroom_id' => (string) $classB->id,
        ]);

    $response->assertSessionHasNoErrors();
    expect($student1->fresh()->classroom_id)->toBe($classB->id);
    expect($student2->fresh()->classroom_id)->toBe($classA->id); // stayed in 7A
});

test('proktor can graduate students to null classroom', function () {
    $proktor = User::factory()->create(['role' => 'proktor']);
    $class9A = Classroom::create(['name' => 'Kelas 9A']);

    $student = User::factory()->create(['role' => 'siswa', 'classroom_id' => $class9A->id]);

    $response = $this
        ->actingAs($proktor)
        ->post(route('proktor.class-promotions.promote'), [
            'student_ids' => [$student->id],
            'target_classroom_id' => 'graduated',
        ]);

    $response->assertSessionHasNoErrors();
    expect($student->fresh()->classroom_id)->toBeNull();
});

test('proktor can run bulk class promotion', function () {
    $proktor = User::factory()->create(['role' => 'proktor']);
    $class7A = Classroom::create(['name' => 'Kelas 7A']);
    $class8A = Classroom::create(['name' => 'Kelas 8A']);
    $class9A = Classroom::create(['name' => 'Kelas 9A']);

    $s1 = User::factory()->create(['role' => 'siswa', 'classroom_id' => $class7A->id]);
    $s2 = User::factory()->create(['role' => 'siswa', 'classroom_id' => $class8A->id]);

    $response = $this
        ->actingAs($proktor)
        ->post(route('proktor.class-promotions.bulk'), [
            'mappings' => [
                [
                    'source_classroom_id' => $class7A->id,
                    'target_classroom_id' => (string) $class8A->id,
                ],
                [
                    'source_classroom_id' => $class8A->id,
                    'target_classroom_id' => (string) $class9A->id,
                ],
            ],
        ]);

    $response->assertSessionHasNoErrors();
    expect($s1->fresh()->classroom_id)->toBe($class8A->id);
    expect($s2->fresh()->classroom_id)->toBe($class9A->id);
});
