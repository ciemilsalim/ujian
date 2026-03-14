<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentAnswer extends Model
{
    protected $guarded = ['id'];
    protected $casts = ['is_correct' => 'boolean'];

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function examSessionUser()
    {
        return $this->belongsTo(ExamSessionUser::class);
    }
}
