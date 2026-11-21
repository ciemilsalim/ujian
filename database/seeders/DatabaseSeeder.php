<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Proktor
        \App\Models\User::firstOrCreate(
            ['username' => 'proktor'],
            [
                'name' => 'Administrator Proktor',
                'email' => 'proktor@example.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'role' => 'proktor',
            ]
        );

        // Create Guru
        \App\Models\User::firstOrCreate(
            ['username' => 'guru'],
            [
                'name' => 'Guru Pengampu',
                'email' => 'guru@example.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'role' => 'guru',
            ]
        );

        // Create example Classroom
        $classroom = \App\Models\Classroom::firstOrCreate(
            ['name' => 'VII'],
            [
                'description' => 'Kelas Tujuh',
            ]
        );

        // Create Siswa
        \App\Models\User::firstOrCreate(
            ['username' => 'siswa'],
            [
                'name' => 'Siswa Percobaan',
                'email' => 'siswa@example.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'role' => 'siswa',
                'classroom_id' => $classroom->id,
            ]
        );

        // Create Subject
        $subject = \App\Models\Subject::firstOrCreate(
            ['code' => 'INF-01'],
            ['name' => 'Informatika']
        );

        $guru = \App\Models\User::where('username', 'guru')->first();
        $academicYear = \App\Models\AcademicYear::where('is_active', true)->first();

        // Create Question Bank
        \App\Models\QuestionBank::firstOrCreate(
            ['name' => 'Bank Soal Informatika Kelas VII'],
            [
                'subject_id' => $subject->id,
                'user_id' => $guru->id,
                'academic_year_id' => $academicYear ? $academicYear->id : 1,
                'description' => 'Kumpulan bank soal asesmen sumatif informatika kelas tujuh.',
            ]
        );
    }
}
