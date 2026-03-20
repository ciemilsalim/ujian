<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSessionProctor extends Model
{
    use HasFactory;

    protected $fillable = ['exam_session_id', 'exam_room_id', 'proctor_id'];

    public function session()
    {
        return $this->belongsTo(ExamSession::class, 'exam_session_id');
    }

    public function room()
    {
        return $this->belongsTo(ExamRoom::class, 'exam_room_id');
    }

    public function proctor()
    {
        return $this->belongsTo(Proctor::class);
    }
}
