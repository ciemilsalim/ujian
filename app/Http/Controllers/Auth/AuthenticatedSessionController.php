<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the staff/proctor login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Display the student login view.
     */
    public function createStudent(): Response
    {
        return Inertia::render('Auth/LoginSiswa', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = auth()->user();

        // Redirect siswa kembali ke portal siswa jika login dari sana
        if ($user->role === 'siswa' && $request->headers->get('referer') && str_contains($request->headers->get('referer'), 'login/siswa')) {
            return redirect()->intended(route('siswa.dashboard'));
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $role = $request->user()?->role;

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        if ($role === 'siswa') {
            return redirect()->route('login.siswa');
        }

        return redirect('/');
    }
}
