<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();
        if ($user->isProktor())
            return redirect()->route('proktor.dashboard');
        if ($user->isGuru())
            return redirect()->route('guru.dashboard');
        return redirect()->route('siswa.dashboard');
    })->name('dashboard');

    // Proktor Routes
    Route::middleware(['role:proktor'])->prefix('proktor')->name('proktor.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Proktor\DashboardController::class, 'index'])->name('dashboard');
        Route::get('/dashboard/health', [\App\Http\Controllers\Proktor\DashboardController::class, 'health'])->name('dashboard.health');
        Route::post('/users/import', [\App\Http\Controllers\Proktor\UserController::class, 'importStudents'])->name('users.import');
        Route::resource('users', \App\Http\Controllers\Proktor\UserController::class);
        Route::resource('exams', \App\Http\Controllers\Proktor\ExamController::class);
        Route::patch('/sessions/{session}/toggle-active', [\App\Http\Controllers\Proktor\SessionController::class, 'toggleActive'])->name('sessions.toggle-active');
        Route::post('/sessions/{session}/refresh-token', [\App\Http\Controllers\Proktor\SessionController::class, 'refreshToken'])->name('sessions.refresh-token');
        Route::post('/sessions/{session}/broadcast', [\App\Http\Controllers\Proktor\SessionController::class, 'broadcast'])->name('sessions.broadcast');
        Route::post('/sessions/broadcast-global', [\App\Http\Controllers\Proktor\SessionController::class, 'broadcast'])->name('sessions.broadcast-global');
        Route::get('/sessions/{session}/monitor', [\App\Http\Controllers\Proktor\SessionController::class, 'monitor'])->name('sessions.monitor');
        Route::post('/sessions/{session}/force-logout', [\App\Http\Controllers\Proktor\SessionController::class, 'forceLogout'])->name('sessions.force-logout');
        Route::post('/sessions/{session}/extend-time', [\App\Http\Controllers\Proktor\SessionController::class, 'extendTime'])->name('sessions.extend-time');
        Route::post('/sessions/user/{id}/reset-login', [\App\Http\Controllers\Proktor\SessionController::class, 'resetLogin'])->name('sessions.reset-login');
        Route::post('/sessions/user/{id}/force-logout', [\App\Http\Controllers\Proktor\SessionController::class, 'forceLogoutParticipant'])->name('sessions.force-logout-user');
        Route::resource('sessions', \App\Http\Controllers\Proktor\SessionController::class);
        Route::post('/classrooms/{classroom}/seating', [\App\Http\Controllers\Proktor\ClassroomController::class, 'updateSeating'])->name('classrooms.update-seating');
        Route::resource('classrooms', \App\Http\Controllers\Proktor\ClassroomController::class);
        Route::resource('subjects', \App\Http\Controllers\Proktor\SubjectController::class);
        Route::get('/results', [\App\Http\Controllers\Proktor\ResultController::class, 'index'])->name('results.index');
        Route::get('/results/{id}', [\App\Http\Controllers\Proktor\ResultController::class, 'show'])->name('results.show');
        Route::get('/results/{id}/export-pdf', [\App\Http\Controllers\Proktor\ResultController::class, 'exportPdf'])->name('results.export-pdf');
        Route::get('/results/{id}/export-excel', [\App\Http\Controllers\Proktor\ResultController::class, 'exportExcel'])->name('results.export-excel');
        Route::post('/results/user/{id}/reset', [\App\Http\Controllers\Proktor\ResultController::class, 'resetResult'])->name('results.reset-user');
        Route::delete('/results/user/{id}/delete', [\App\Http\Controllers\Proktor\ResultController::class, 'deleteResult'])->name('results.delete-user');
        Route::get('/attendance/{id}', [\App\Http\Controllers\Proktor\AttendanceController::class, 'generate'])->name('attendance.generate');

        Route::get('/settings', [\App\Http\Controllers\Proktor\SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [\App\Http\Controllers\Proktor\SettingController::class, 'store'])->name('settings.store');
        Route::get('/exam-cards', [\App\Http\Controllers\Proktor\ExamCardController::class, 'index'])->name('exam-cards.index');
        Route::post('/exam-cards/generate', [\App\Http\Controllers\Proktor\ExamCardController::class, 'generate'])->name('exam-cards.generate');
    });

    // Guru Routes
    Route::middleware(['role:guru'])->prefix('guru')->name('guru.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Guru\DashboardController::class, 'index'])->name('dashboard');
        Route::resource('question-banks', \App\Http\Controllers\Guru\QuestionBankController::class);
        Route::resource('questions', \App\Http\Controllers\Guru\QuestionController::class);
        Route::get('/results', [\App\Http\Controllers\Guru\ExamResultController::class, 'index'])->name('results.index');
        Route::get('/results/{id}', [\App\Http\Controllers\Guru\ExamResultController::class, 'show'])->name('results.show');
        Route::get('/question-analysis/{id}', [\App\Http\Controllers\Guru\QuestionAnalysisController::class, 'show'])->name('question-analysis.show');
    });

    // Siswa Routes
    Route::middleware(['role:siswa'])->prefix('siswa')->name('siswa.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Siswa\ExamController::class, 'index'])->name('dashboard');
        Route::get('/history', [\App\Http\Controllers\Siswa\ExamController::class, 'history'])->name('history');
        Route::get('/exams/{id}', [\App\Http\Controllers\Siswa\ExamController::class, 'show'])->name('exams.show');
        Route::post('/exams/submit', [\App\Http\Controllers\Siswa\ExamController::class, 'submitAnswer'])->name('exams.submit');
        Route::post('/exams/report-cheat', [\App\Http\Controllers\Siswa\ExamController::class, 'reportCheat'])->name('exams.report-cheat');
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
