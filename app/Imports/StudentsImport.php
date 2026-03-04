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

    public function __construct($classroomId)
    {
        $this->classroomId = $classroomId;
    }

    public function model(array $row)
    {
        return new User([
            'username' => $row['username'],
            'name' => $row['nama'],
            'email' => $row['email'] ?? null,
            'password' => Hash::make($row['password'] ?? 'password123'),
            'role' => 'siswa',
            'classroom_id' => $this->classroomId,
        ]);
    }
}
