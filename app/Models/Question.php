<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $guarded = ['id'];
    protected $casts = ['options' => 'array'];

    public function questionBank()
    {
        return $this->belongsTo(QuestionBank::class);
    }

    protected function setAnswerKeyAttribute($value)
    {
        $this->attributes['answer_key'] = str_replace(' ', '', strtolower(trim($value)));
    }
}
