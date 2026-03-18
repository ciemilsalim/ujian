<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Classroom;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StudentsImport implements ToModel, WithHeadingRow
{
    protected $classroomId;
    protected $classrooms;

    public function __construct($classroomId = null)
    {
        $this->classroomId = $classroomId;
        $this->classrooms = \App\Models\Classroom::all()->pluck('id', 'name')->mapWithKeys(function ($id, $name) {
            return [strtolower(trim($name)) => $id];
        });
    }

    public function model(array $row)
    {
        $name = $row['nama'] ?? ($row['name'] ?? null);
        $username = $row['nis'] ?? ($row['username'] ?? null);
        $className = strtolower(trim($row['kelas'] ?? ($row['classroom'] ?? '')));
        
        $finalClassroomId = $this->classroomId ?: ($this->classrooms[$className] ?? null);

        if (!$name || !$username) return null;

        // Cek jika user sudah ada (berdasarkan username/NIS)
        $existing = User::where('username', $username)->first();
        if ($existing) return null;

        $password = $row['password'] ?? User::generatePassword();

        return new User([
            'username' => $username,
            'name' => $name,
            'email' => $row['email'] ?? null,
            'password' => Hash::make($password),
            'password_plain' => $password,
            'role' => 'siswa',
            'classroom_id' => $finalClassroomId,
        ]);
    }
}
