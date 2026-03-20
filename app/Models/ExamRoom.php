<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamRoom extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'capacity'];

    public function sessionParticipants()
    {
        return $this->hasMany(ExamSessionUser::class);
    }

    public function sessionProctors()
    {
        return $this->hasMany(ExamSessionProctor::class);
    }
}
