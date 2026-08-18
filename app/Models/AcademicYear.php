<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'semester',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function questionBanks()
    {
        return $this->hasMany(QuestionBank::class);
    }

    public function exams()
    {
        return $this->hasMany(Exam::class);
    }

    public static function getActive()
    {
        return static::where('is_active', true)->first();
    }
}
