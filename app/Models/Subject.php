<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = ['name', 'code'];

    public function questionBanks()
    {
        return $this->hasMany(QuestionBank::class);
    }
}
