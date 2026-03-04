<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    protected $fillable = ['name', 'description', 'seating_plan', 'seating_grid'];

    protected $casts = [
        'seating_plan' => 'array',
        'seating_grid' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
