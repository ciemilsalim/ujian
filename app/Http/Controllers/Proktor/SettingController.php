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
            'principal_name' => 'nullable|string|max:255',
            'principal_nip' => 'nullable|string|max:255',
            'passing_grade' => 'required|integer|min:0|max:100',
            'max_cheat_warnings' => 'required|integer|min:1|max:50',
            'enable_anti_cheat' => 'required|boolean',
            'block_context_menu' => 'required|boolean',
            'block_copy_paste' => 'required|boolean',
            'detect_tab_switch' => 'required|boolean',
            'force_fullscreen' => 'required|boolean',
            'app_mode' => 'required|string|in:online,offline',
        ]);

        $settings = [
            'school_name' => $request->school_name,
            'school_address' => $request->school_address,
            'principal_name' => $request->principal_name,
            'principal_nip' => $request->principal_nip,
            'passing_grade' => $request->passing_grade,
            'max_cheat_warnings' => $request->max_cheat_warnings,
            'enable_anti_cheat' => $request->enable_anti_cheat,
            'block_context_menu' => $request->block_context_menu,
            'block_copy_paste' => $request->block_copy_paste,
            'detect_tab_switch' => $request->detect_tab_switch,
            'force_fullscreen' => $request->force_fullscreen,
            'app_mode' => $request->app_mode,
        ];

        foreach ($settings as $key => $value) {
            \App\Models\Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }

    public function clearData(Request $request)
    {
        if (!$request->confirm_wipe) {
            return redirect()->back()->with('error', 'Konfirmasi pembersihan data diperlukan.');
        }

        \Illuminate\Support\Facades\DB::transaction(function () {
            // Delete answers first (foreign key constraint)
            \App\Models\StudentAnswer::query()->delete();
            
            // Delete exam session users
            \App\Models\ExamSessionUser::query()->delete();
            
            // Delete exam sessions
            \App\Models\ExamSession::query()->delete();
        });

        return redirect()->back()->with('success', 'Seluruh data ujian, jawaban, dan sesi telah berhasil dibersihkan.');
    }
}
