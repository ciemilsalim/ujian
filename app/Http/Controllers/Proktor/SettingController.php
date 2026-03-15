<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();
        return \Inertia\Inertia::render('Proktor/Settings/Index', [
            'settings' => $settings
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_name' => 'required|string|max:255',
            'school_address' => 'required|string',
            'passing_grade' => 'required|integer|min:0|max:100',
            'max_cheat_warnings' => 'required|integer|min:1|max:50',
        ]);

        \App\Models\Setting::updateOrCreate(
            ['key' => 'school_name'],
            ['value' => $request->school_name]
        );

        \App\Models\Setting::updateOrCreate(
            ['key' => 'school_address'],
            ['value' => $request->school_address]
        );

        \App\Models\Setting::updateOrCreate(
            ['key' => 'passing_grade'],
            ['value' => $request->passing_grade]
        );

        \App\Models\Setting::updateOrCreate(
            ['key' => 'max_cheat_warnings'],
            ['value' => $request->max_cheat_warnings]
        );

        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
