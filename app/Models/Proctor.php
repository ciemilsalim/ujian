<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proctor extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'nip'];

    public function sessionAssignments()
    {
        return $this->hasMany(ExamSessionProctor::class);
    }
}
