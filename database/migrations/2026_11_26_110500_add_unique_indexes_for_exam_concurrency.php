<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Deduplicate student_answers before adding composite unique index (keep the latest updated/highest id row)
        $duplicateAnswers = DB::table('student_answers')
            ->select('exam_session_user_id', 'question_id', DB::raw('MAX(id) as keep_id'), DB::raw('COUNT(*) as cnt'))
            ->groupBy('exam_session_user_id', 'question_id')
            ->having('cnt', '>', 1)
            ->get();

        foreach ($duplicateAnswers as $dup) {
            DB::table('student_answers')
                ->where('exam_session_user_id', $dup->exam_session_user_id)
                ->where('question_id', $dup->question_id)
                ->where('id', '!=', $dup->keep_id)
                ->delete();
        }

        // Deduplicate exam_session_users before adding composite unique index (keep the most progressed / highest id row)
        $duplicateSessionUsers = DB::table('exam_session_users')
            ->select('exam_session_id', 'user_id', DB::raw('MAX(id) as keep_id'), DB::raw('COUNT(*) as cnt'))
            ->groupBy('exam_session_id', 'user_id')
            ->having('cnt', '>', 1)
            ->get();

        foreach ($duplicateSessionUsers as $dup) {
            DB::table('exam_session_users')
                ->where('exam_session_id', $dup->exam_session_id)
                ->where('user_id', $dup->user_id)
                ->where('id', '!=', $dup->keep_id)
                ->delete();
        }

        $studentAnswerIndexes = collect(Schema::getIndexes('student_answers'))->pluck('name')->all();
        if (!in_array('student_answers_session_user_question_unique', $studentAnswerIndexes, true)) {
            Schema::table('student_answers', function (Blueprint $table) {
                $table->unique(['exam_session_user_id', 'question_id'], 'student_answers_session_user_question_unique');
            });
        }

        $examSessionUserIndexes = collect(Schema::getIndexes('exam_session_users'))->pluck('name')->all();
        if (!in_array('exam_session_users_session_user_unique', $examSessionUserIndexes, true)) {
            Schema::table('exam_session_users', function (Blueprint $table) {
                $table->unique(['exam_session_id', 'user_id'], 'exam_session_users_session_user_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $studentAnswerIndexes = collect(Schema::getIndexes('student_answers'))->pluck('name')->all();
        if (in_array('student_answers_session_user_question_unique', $studentAnswerIndexes, true)) {
            Schema::table('student_answers', function (Blueprint $table) {
                $table->dropUnique('student_answers_session_user_question_unique');
            });
        }

        $examSessionUserIndexes = collect(Schema::getIndexes('exam_session_users'))->pluck('name')->all();
        if (in_array('exam_session_users_session_user_unique', $examSessionUserIndexes, true)) {
            Schema::table('exam_session_users', function (Blueprint $table) {
                $table->dropUnique('exam_session_users_session_user_unique');
            });
        }
    }
};
