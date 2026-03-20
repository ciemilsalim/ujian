<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamSessionUser extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function examSession()
    {
        return $this->belongsTo(ExamSession::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function room()
    {
        return $this->belongsTo(ExamRoom::class, 'exam_room_id');
    }

    public function answers()
    {
        return $this->hasMany(StudentAnswer::class);
    }
}
