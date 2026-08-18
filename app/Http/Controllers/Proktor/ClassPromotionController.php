<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClassPromotionController extends Controller
{
    public function index(Request $request)
    {
        $classrooms = Classroom::withCount(['users as students_count' => function ($q) {
            $q->where('role', 'siswa');
        }])->orderBy('name')->get();

        $selectedClassroomId = $request->input('classroom_id');
        $students = [];

        if ($selectedClassroomId) {
            if ($selectedClassroomId === 'unassigned') {
                $students = User::where('role', 'siswa')
                    ->whereNull('classroom_id')
                    ->orderBy('name')
                    ->get();
            } else {
                $students = User::where('role', 'siswa')
                    ->where('classroom_id', $selectedClassroomId)
                    ->orderBy('name')
                    ->get();
            }
        }

        $unassignedStudentsCount = User::where('role', 'siswa')
            ->whereNull('classroom_id')
            ->count();

        return \Inertia\Inertia::render('Proktor/ClassPromotions/Index', [
            'classrooms' => $classrooms,
            'students' => $students,
            'selectedClassroomId' => $selectedClassroomId ? (string) $selectedClassroomId : null,
            'unassignedStudentsCount' => $unassignedStudentsCount,
        ]);
    }

    public function promoteClass(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:users,id',
            'target_classroom_id' => 'required|string',
        ]);

        $studentIds = $request->student_ids;
        $targetClassroomId = $request->target_classroom_id;

        if ($targetClassroomId === 'graduated' || $targetClassroomId === 'unassigned') {
            User::whereIn('id', $studentIds)
                ->where('role', 'siswa')
                ->update(['classroom_id' => null]);

            $message = count($studentIds) . ' siswa berhasil dipindahkan statusnya menjadi Lulus / Tanpa Kelas.';
        } else {
            $classroom = Classroom::findOrFail($targetClassroomId);
            User::whereIn('id', $studentIds)
                ->where('role', 'siswa')
                ->update(['classroom_id' => $classroom->id]);

            $message = count($studentIds) . " siswa berhasil dinaikkan / dipindahkan ke {$classroom->name}.";
        }

        return redirect()->back()->with('success', $message);
    }

    public function promoteBulk(Request $request)
    {
        $request->validate([
            'mappings' => 'required|array',
            'mappings.*.source_classroom_id' => 'required',
            'mappings.*.target_classroom_id' => 'required|string',
        ]);

        $mappings = $request->mappings;
        $totalMoved = 0;

        DB::transaction(function () use ($mappings, &$totalMoved) {
            // First collect student IDs per source to avoid cascading collisions
            $operations = [];
            foreach ($mappings as $mapping) {
                $sourceId = $mapping['source_classroom_id'];
                $targetId = $mapping['target_classroom_id'];

                if (!$sourceId || !$targetId || $targetId === 'none') {
                    continue;
                }

                $studentIds = User::where('role', 'siswa')
                    ->where('classroom_id', $sourceId)
                    ->pluck('id')
                    ->toArray();

                if (!empty($studentIds)) {
                    $operations[] = [
                        'student_ids' => $studentIds,
                        'target_id' => $targetId,
                    ];
                }
            }

            // Execute collected operations
            foreach ($operations as $op) {
                if ($op['target_id'] === 'graduated' || $op['target_id'] === 'unassigned') {
                    User::whereIn('id', $op['student_ids'])->update(['classroom_id' => null]);
                } else {
                    User::whereIn('id', $op['student_ids'])->update(['classroom_id' => $op['target_id']]);
                }
                $totalMoved += count($op['student_ids']);
            }
        });

        return redirect()->back()->with('success', "Proses kenaikan kelas massal berhasil dijalankan! Total {$totalMoved} siswa berhasil dipindahkan.");
    }
}
