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
        Route::get('/users/template-excel', [\App\Http\Controllers\Proktor\UserController::class, 'downloadTemplateExcel'])->name('users.template-excel');
        Route::get('/users/template-word', [\App\Http\Controllers\Proktor\UserController::class, 'downloadTemplateWord'])->name('users.template-word');
        Route::post('/users/import', [\App\Http\Controllers\Proktor\UserController::class, 'importStudents'])->name('users.import');
        Route::delete('/users/bulk-destroy', [\App\Http\Controllers\Proktor\UserController::class, 'bulkDestroy'])->name('users.bulk-destroy');
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
        Route::post('/sessions/user/{id}/reset-exam', [\App\Http\Controllers\Proktor\SessionController::class, 'resetExam'])->name('sessions.reset-exam');
        Route::post('/sessions/user/{id}/force-logout', [\App\Http\Controllers\Proktor\SessionController::class, 'forceLogoutParticipant'])->name('sessions.force-logout-user');
        Route::post('/sessions/{id}/toggle-status', [\App\Http\Controllers\Proktor\SessionController::class, 'toggleActive'])->name('sessions.toggle-status');
        Route::post('/sessions/{session}/sync', [\App\Http\Controllers\Proktor\SessionController::class, 'syncParticipants'])->name('sessions.sync');
        Route::get('/sessions/{session}/participants', [\App\Http\Controllers\Proktor\SessionController::class, 'manageParticipants'])->name('sessions.participants');
        Route::post('/sessions/{session}/participants', [\App\Http\Controllers\Proktor\SessionController::class, 'addParticipants'])->name('sessions.add-participants');
        Route::delete('/sessions/{session}/participants/{user}', [\App\Http\Controllers\Proktor\SessionController::class, 'removeParticipant'])->name('sessions.remove-participant');
        Route::resource('sessions', \App\Http\Controllers\Proktor\SessionController::class);
        
        Route::get('/classrooms/{classroom}/manage-students', [\App\Http\Controllers\Proktor\ClassroomController::class, 'manageStudents'])->name('classrooms.manage-students');
        Route::post('/classrooms/{classroom}/add-students', [\App\Http\Controllers\Proktor\ClassroomController::class, 'addStudents'])->name('classrooms.add-students');
        Route::delete('/classrooms/{classroom}/students/{student}', [\App\Http\Controllers\Proktor\ClassroomController::class, 'removeStudent'])->name('classrooms.remove-student');
        Route::resource('classrooms', \App\Http\Controllers\Proktor\ClassroomController::class)->except(['show']);
        
        Route::resource('subjects', \App\Http\Controllers\Proktor\SubjectController::class);
        Route::post('/academic-years/switch', [\App\Http\Controllers\Proktor\AcademicYearController::class, 'switchYear'])->name('academic-years.switch');
        Route::patch('/academic-years/{academicYear}/set-active', [\App\Http\Controllers\Proktor\AcademicYearController::class, 'setActive'])->name('academic-years.set-active');
        Route::resource('academic-years', \App\Http\Controllers\Proktor\AcademicYearController::class);
        Route::get('/results', [\App\Http\Controllers\Proktor\ResultController::class, 'index'])->name('results.index');
        Route::get('/results/{id}', [\App\Http\Controllers\Proktor\ResultController::class, 'show'])->name('results.show');
        Route::get('/results/{id}/export-pdf', [\App\Http\Controllers\Proktor\ResultController::class, 'exportPdf'])->name('results.export-pdf');
        Route::get('/results/{id}/export-excel', [\App\Http\Controllers\Proktor\ResultController::class, 'exportExcel'])->name('results.export-excel');
        Route::get('/results/{id}/export-word', [\App\Http\Controllers\Proktor\ResultController::class, 'exportWord'])->name('results.export-word');
        Route::post('/results/user/{id}/reset', [\App\Http\Controllers\Proktor\ResultController::class, 'resetResult'])->name('results.reset-user');
        Route::delete('/results/user/{id}/delete', [\App\Http\Controllers\Proktor\ResultController::class, 'deleteResult'])->name('results.delete-user');
        Route::get('/attendance/{id}', [\App\Http\Controllers\Proktor\AttendanceController::class, 'generate'])->name('attendance.generate');
        Route::get('/proctor-attendance/{id}', [\App\Http\Controllers\Proktor\AttendanceController::class, 'generateProctorAttendance'])->name('attendance.proctor');
        Route::get('/results/{id}/item-analysis', [\App\Http\Controllers\Guru\QuestionAnalysisController::class, 'show'])->name('results.item-analysis');
        Route::get('/results/{id}/item-analysis-export', [\App\Http\Controllers\Guru\QuestionAnalysisController::class, 'exportWord'])->name('results.item-analysis-export');

        Route::get('/settings', [\App\Http\Controllers\Proktor\SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [\App\Http\Controllers\Proktor\SettingController::class, 'store'])->name('settings.store');
        Route::post('/settings/clear-data', [\App\Http\Controllers\Proktor\SettingController::class, 'clearData'])->name('settings.clear-data');

        // Synchronization Routes
        Route::get('/sync', [\App\Http\Controllers\Proktor\SyncController::class, 'index'])->name('sync.index');
        Route::get('/sync/export-exam', [\App\Http\Controllers\Proktor\SyncController::class, 'exportExam'])->name('sync.export-exam');
        Route::post('/sync/import-exam', [\App\Http\Controllers\Proktor\SyncController::class, 'importExam'])->name('sync.import-exam');
        Route::get('/sync/export-results', [\App\Http\Controllers\Proktor\SyncController::class, 'exportResults'])->name('sync.export-results');
        Route::post('/sync/import-results', [\App\Http\Controllers\Proktor\SyncController::class, 'importResults'])->name('sync.import-results');
        Route::get('/exam-cards', [\App\Http\Controllers\Proktor\ExamCardController::class, 'index'])->name('exam-cards.index');
        Route::match(['get', 'post'], '/exam-cards/generate', [\App\Http\Controllers\Proktor\ExamCardController::class, 'generate'])->name('exam-cards.generate');

        // Administration Routes
        Route::get('/administration', [\App\Http\Controllers\Proktor\AdministrativeController::class, 'index'])->name('administration.index');
        Route::get('/administration/official-report/{id}', [\App\Http\Controllers\Proktor\OfficialReportController::class, 'generate'])->name('administration.official-report');
        Route::get('/administration/exam-rules', [\App\Http\Controllers\Proktor\RulesController::class, 'examRules'])->name('administration.exam-rules');
        Route::get('/administration/proctor-rules', [\App\Http\Controllers\Proktor\RulesController::class, 'proctorRules'])->name('administration.proctor-rules');

        // Rooms
        Route::resource('rooms', \App\Http\Controllers\Proktor\RoomController::class);
        Route::get('/rooms-assignment/global', [\App\Http\Controllers\Proktor\RoomController::class, 'globalStudentAssignment'])->name('rooms.global-assignment');
        Route::post('/rooms-assignment/global', [\App\Http\Controllers\Proktor\RoomController::class, 'assignStudentsGlobal'])->name('rooms.global-assignment.save');
        Route::get('/rooms/{room}/seating', [\App\Http\Controllers\Proktor\RoomController::class, 'roomSeatingPlan'])->name('rooms.seating');
        Route::post('/rooms/{room}/seating', [\App\Http\Controllers\Proktor\RoomController::class, 'updateRoomSeating'])->name('rooms.update-seating');
        Route::get('/rooms/{room}/pdf', [\App\Http\Controllers\Proktor\RoomController::class, 'exportSeatingPdf'])->name('rooms.pdf');
        Route::resource('proctors', \App\Http\Controllers\Proktor\ProctorController::class);
        Route::get('/sessions/{session}/assign-rooms', [\App\Http\Controllers\Proktor\RoomController::class, 'roomAssignment'])->name('sessions.room-assignment');
        Route::post('/sessions/{session}/assign-rooms', [\App\Http\Controllers\Proktor\RoomController::class, 'assignStudents'])->name('sessions.assign-rooms');
        Route::post('/sessions/{session}/assign-proctors', [\App\Http\Controllers\Proktor\RoomController::class, 'assignProctors'])->name('sessions.assign-proctors');
        Route::post('/sessions/{session}/sync-rooms', [\App\Http\Controllers\Proktor\RoomController::class, 'syncFromDefault'])->name('sessions.sync-rooms');
    });

    // Guru Routes
    Route::middleware(['role:guru'])->prefix('guru')->name('guru.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Guru\DashboardController::class, 'index'])->name('dashboard');
        Route::get('/question-banks/template-excel', [\App\Http\Controllers\Guru\QuestionBankController::class, 'downloadTemplateExcel'])->name('question-banks.template-excel');
        Route::get('/question-banks/template-word', [\App\Http\Controllers\Guru\QuestionBankController::class, 'downloadTemplateWord'])->name('question-banks.template-word');
        Route::resource('question-banks', \App\Http\Controllers\Guru\QuestionBankController::class);
        Route::post('/question-banks/{id}/import-excel', [\App\Http\Controllers\Guru\QuestionBankController::class, 'importExcel'])->name('question-banks.import-excel');
        Route::post('/question-banks/{id}/import-word', [\App\Http\Controllers\Guru\QuestionBankController::class, 'importWord'])->name('question-banks.import-word');
        Route::resource('questions', \App\Http\Controllers\Guru\QuestionController::class);
        Route::post('/results/grade-essay', [\App\Http\Controllers\Guru\ExamResultController::class, 'gradeEssay'])->name('results.grade-essay');
        Route::get('/results', [\App\Http\Controllers\Guru\ExamResultController::class, 'index'])->name('results.index');
        Route::get('/results/{id}', [\App\Http\Controllers\Guru\ExamResultController::class, 'show'])->name('results.show');
        Route::get('/results/{id}/export-pdf', [\App\Http\Controllers\Guru\ExamResultController::class, 'exportPdf'])->name('results.export-pdf');
        Route::get('/results/{id}/export-word', [\App\Http\Controllers\Guru\ExamResultController::class, 'exportWord'])->name('results.export-word');
        Route::get('/results/detail/{id}', [\App\Http\Controllers\Guru\ExamResultController::class, 'detail'])->name('results.detail');
        Route::get('/question-analysis/{id}', [\App\Http\Controllers\Guru\QuestionAnalysisController::class, 'show'])->name('question-analysis.show');
        Route::get('/question-analysis/{id}/export', [\App\Http\Controllers\Guru\QuestionAnalysisController::class, 'exportWord'])->name('question-analysis.export');
    });

    // Siswa Routes
    Route::middleware(['role:siswa'])->prefix('siswa')->name('siswa.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Siswa\ExamController::class, 'index'])->name('dashboard');
        Route::get('/history', [\App\Http\Controllers\Siswa\ExamController::class, 'history'])->name('history');
        Route::get('/exams/{id}', [\App\Http\Controllers\Siswa\ExamController::class, 'show'])->name('exams.show');
        Route::post('/exams/verify-token', [\App\Http\Controllers\Siswa\ExamController::class, 'verifyToken'])->name('exams.verify-token');
        Route::post('/exams/submit', [\App\Http\Controllers\Siswa\ExamController::class, 'submitAnswer'])->name('exams.submit');
        Route::post('/exams/report-cheat', [\App\Http\Controllers\Siswa\ExamController::class, 'reportCheat'])->name('exams.report-cheat');
    });

    Route::get('/help', [\App\Http\Controllers\HelpController::class, 'index'])->name('help.index');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
