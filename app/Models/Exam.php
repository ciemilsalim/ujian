<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $guarded = ['id'];

    public function questionBank()
    {
        return $this->belongsTo(QuestionBank::class);
    }
}
