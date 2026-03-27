<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HelpController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        return Inertia::render('Help/Index', [
            'userRole' => $user->role,
        ]);
    }
}
