<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamSessionUser extends Model
{
    protected $guarded = ['id'];

    public function examSession()
    {
        return $this->belongsTo(ExamSession::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function answers()
    {
        return $this->hasMany(StudentAnswer::class);
    }
}
