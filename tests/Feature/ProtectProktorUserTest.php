<?php

use App\Models\User;

test('default proktor account cannot be deleted via single destroy', function () {
    $proktor = User::factory()->create([
        'username' => 'proktor',
        'role' => 'proktor',
    ]);

    $admin = User::factory()->create(['role' => 'proktor']);

    $response = $this
        ->actingAs($admin)
        ->delete(route('proktor.users.destroy', $proktor->id));

    $response->assertSessionHas('error');
    $this->assertNotNull(User::find($proktor->id));
});

test('default proktor account is ignored in bulk destroy', function () {
    $proktor = User::factory()->create([
        'username' => 'proktor',
        'role' => 'proktor',
    ]);

    $otherUser = User::factory()->create([
        'username' => 'regular_user',
        'role' => 'siswa',
    ]);

    $admin = User::factory()->create(['role' => 'proktor']);

    $response = $this
        ->actingAs($admin)
        ->delete(route('proktor.users.bulk-destroy'), [
            'ids' => [$proktor->id, $otherUser->id],
        ]);

    $this->assertNotNull(User::find($proktor->id));
    $this->assertNull(User::find($otherUser->id));
});

test('default proktor account cannot be deleted via profile destroy', function () {
    $proktor = User::factory()->create([
        'username' => 'Proktor',
        'role' => 'proktor',
    ]);

    $response = $this
        ->actingAs($proktor)
        ->delete('/profile', [
            'password' => 'password',
        ]);

    $response->assertSessionHas('error');
    $this->assertNotNull(User::find($proktor->id));
});

test('eloquent model deleting event prevents deleting default proktor account', function () {
    $proktor = User::factory()->create([
        'username' => 'proktor',
        'role' => 'proktor',
    ]);

    $result = $proktor->delete();

    $this->assertFalse($result);
    $this->assertNotNull(User::find($proktor->id));
});
