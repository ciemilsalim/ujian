<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $studentsAtExams = \App\Models\ExamSessionUser::where('status', 'working')->count();
        $examFinishes = \App\Models\ExamSessionUser::where('status', 'finished')->count();
        $runningExams = \App\Models\ExamSession::where('is_active', true)->count();
        $totalParticipants = \App\Models\ExamSessionUser::count();
        $completedRate = $totalParticipants > 0 ? round(($examFinishes / $totalParticipants) * 100) : 0;

        $recentSessions = \App\Models\ExamSession::with(['exam'])
            ->withCount('examUsers as participants_count')
            ->withCount([
                'examUsers as submitted_count' => function ($q) {
                    $q->where('status', 'finished');
                }
            ])
            ->latest()
            ->take(5)
            ->get();

        // Participation Trend (Last 7 Days)
        $participationChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $count = \App\Models\ExamSessionUser::whereDate('created_at', $date)->count();
            $participationChart[] = [
                'name' => now()->subDays($i)->format('d M'),
                'students' => $count,
            ];
        }

        // Status Distribution
        $statusDistribution = [
            ['name' => 'Waiting', 'value' => \App\Models\ExamSessionUser::where('status', 'waiting')->count()],
            ['name' => 'Working', 'value' => \App\Models\ExamSessionUser::where('status', 'working')->count()],
            ['name' => 'Finished', 'value' => \App\Models\ExamSessionUser::where('status', 'finished')->count()],
        ];

        // Score Distribution (Fake/Mock logic since we might not have many scores yet)
        $scoreDistribution = [
            ['range' => '0-20', 'count' => \App\Models\ExamSessionUser::whereBetween('score', [0, 20])->count()],
            ['range' => '21-40', 'count' => \App\Models\ExamSessionUser::whereBetween('score', [21, 40])->count()],
            ['range' => '41-60', 'count' => \App\Models\ExamSessionUser::whereBetween('score', [41, 60])->count()],
            ['range' => '61-80', 'count' => \App\Models\ExamSessionUser::whereBetween('score', [61, 80])->count()],
            ['range' => '81-100', 'count' => \App\Models\ExamSessionUser::whereBetween('score', [81, 100])->count()],
        ];

        $activeSessions = \App\Models\ExamSession::with(['exam'])
            ->where('is_active', true)
            ->get();

        $activityFeed = \App\Models\ExamSessionUser::with(['user', 'examSession.exam'])
            ->latest('updated_at')
            ->take(10)
            ->get();

        return \Inertia\Inertia::render('Proktor/Dashboard', [
            'metrics' => [
                'studentsAtExams' => $studentsAtExams,
                'examFinishes' => $examFinishes,
                'runningExams' => $runningExams,
                'completedRate' => $completedRate,
            ],
            'recentSessions' => $recentSessions,
            'activeSessions' => $activeSessions,
            'activityFeed' => $activityFeed,
            'charts' => [
                'participation' => $participationChart,
                'status' => $statusDistribution,
                'scores' => $scoreDistribution,
            ],
        ]);
    }

    public function health()
    {
        $dbStatus = true;
        try {
            \DB::connection()->getPdo();
        } catch (\Exception $e) {
            $dbStatus = false;
        }

        // Memory usage estimation (PHP process)
        $memoryUsage = memory_get_usage(true);
        $memoryLimit = ini_get('memory_limit');

        // Convert human-readable limit to bytes
        $limitMultiplier = ['K' => 1024, 'M' => 1024 ** 2, 'G' => 1024 ** 3];
        $limitUnit = strtoupper(substr($memoryLimit, -1));
        $limitVal = (int) $memoryLimit;
        $maxMemory = isset($limitMultiplier[$limitUnit]) ? $limitVal * $limitMultiplier[$limitUnit] : -1;

        // CPU estimation (simplistic for Windows/Cross-platform)
        $cpuLoad = -1;
        if (stristr(PHP_OS, 'win')) {
            $cmd = "wmic cpu get loadpercentage";
            @exec($cmd, $output);
            if (isset($output[1]))
                $cpuLoad = (int) $output[1];
        } else {
            if (is_readable('/proc/loadavg')) {
                $load = explode(' ', @file_get_contents('/proc/loadavg'));
                if (isset($load[0]))
                    $cpuLoad = (float) $load[0] * 100 / 8; // Assuming 8 cores for % calculation
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'cpu' => $cpuLoad,
                'memory' => [
                    'used' => $memoryUsage,
                    'max' => $maxMemory,
                    'percentage' => $maxMemory > 0 ? round(($memoryUsage / $maxMemory) * 100, 2) : 0
                ],
                'database' => $dbStatus,
                'websocket' => true, // Placeholder handled by frontend Echo
                'uptime' => 'Online'
            ]
        ]);
    }
}
