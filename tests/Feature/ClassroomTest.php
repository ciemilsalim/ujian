<?php

use App\Models\Classroom;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('proktor can view classroom index with stats and pagination', function () {
    $proktor = User::factory()->create(['role' => 'proktor']);
    $class1 = Classroom::create(['name' => 'X-IPA-1', 'description' => 'Kelas Sepuluh IPA 1']);
    $student = User::factory()->create(['role' => 'siswa', 'classroom_id' => $class1->id]);

    $response = $this
        ->actingAs($proktor)
        ->get(route('proktor.classrooms.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Proktor/Classrooms/Index')
        ->has('classrooms.data')
        ->has('stats')
        ->where('stats.totalClasses', fn ($val) => $val >= 1)
        ->where('stats.totalStudentsInClass', fn ($val) => $val >= 1)
    );
});

test('proktor can search classrooms by name or description', function () {
    $proktor = User::factory()->create(['role' => 'proktor']);
    Classroom::create(['name' => 'XI-IPA-BINTANG', 'description' => 'Kelas Khusus']);
    Classroom::create(['name' => 'XII-IPS-SUPER', 'description' => 'Reguler']);

    $response = $this
        ->actingAs($proktor)
        ->get(route('proktor.classrooms.index', ['search' => 'BINTANG']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Proktor/Classrooms/Index')
        ->where('classrooms.data.0.name', 'XI-IPA-BINTANG')
        ->has('classrooms.data', 1)
    );
});

test('proktor can create a new classroom', function () {
    $proktor = User::factory()->create(['role' => 'proktor']);

    $response = $this
        ->actingAs($proktor)
        ->post(route('proktor.classrooms.store'), [
            'name' => 'X-MIPA-TEST-1',
            'description' => 'Kelas baru untuk testing',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('success', 'Kelas berhasil ditambahkan.');
    expect(Classroom::where('name', 'X-MIPA-TEST-1')->exists())->toBeTrue();
});

test('validation prevents duplicate classroom names', function () {
    $proktor = User::factory()->create(['role' => 'proktor']);
    Classroom::create(['name' => 'KELAS-DUPLIKAT', 'description' => 'Asli']);

    $response = $this
        ->actingAs($proktor)
        ->post(route('proktor.classrooms.store'), [
            'name' => 'KELAS-DUPLIKAT',
            'description' => 'Duplikat',
        ]);

    $response->assertSessionHasErrors('name');
});

test('proktor can update an existing classroom', function () {
    $proktor = User::factory()->create(['role' => 'proktor']);
    $classroom = Classroom::create(['name' => 'X-MIPA-LAMA', 'description' => 'Lama']);

    $response = $this
        ->actingAs($proktor)
        ->put(route('proktor.classrooms.update', $classroom->id), [
            'name' => 'X-MIPA-BARU',
            'description' => 'Deskripsi Baru',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('success', 'Data kelas berhasil diperbarui.');
    expect($classroom->fresh()->name)->toBe('X-MIPA-BARU');
    expect($classroom->fresh()->description)->toBe('Deskripsi Baru');
});

test('classroom with registered students cannot be deleted', function () {
    $proktor = User::factory()->create(['role' => 'proktor']);
    $classroom = Classroom::create(['name' => 'KELAS-ADA-SISWA']);
    User::factory()->create(['role' => 'siswa', 'classroom_id' => $classroom->id]);

    $response = $this
        ->actingAs($proktor)
        ->delete(route('proktor.classrooms.destroy', $classroom->id));

    $response->assertSessionHas('error', 'Kelas tidak dapat dihapus karena masih memiliki siswa terdaftar.');
    expect(Classroom::where('id', $classroom->id)->exists())->toBeTrue();
});

test('empty classroom can be deleted successfully', function () {
    $proktor = User::factory()->create(['role' => 'proktor']);
    $classroom = Classroom::create(['name' => 'KELAS-KOSONG-HAPUS']);

    $response = $this
        ->actingAs($proktor)
        ->delete(route('proktor.classrooms.destroy', $classroom->id));

    $response->assertSessionHas('success', 'Kelas berhasil dihapus.');
    expect(Classroom::where('id', $classroom->id)->exists())->toBeFalse();
});

test('non-proktor users cannot access classroom management', function () {
    $siswa = User::factory()->create(['role' => 'siswa']);

    $response = $this
        ->actingAs($siswa)
        ->get(route('proktor.classrooms.index'));

    $response->assertForbidden();
});

