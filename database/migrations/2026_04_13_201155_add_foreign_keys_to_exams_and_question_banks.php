<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Users table foreign keys
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('classroom_id')->references('id')->on('classrooms')->onDelete('set null');
            $table->foreign('exam_room_id')->references('id')->on('exam_rooms')->onDelete('set null');
        });

        // Question banks foreign keys
        Schema::table('question_banks', function (Blueprint $table) {
            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Exams foreign keys
        Schema::table('exams', function (Blueprint $table) {
            $table->foreign('question_bank_id')->references('id')->on('question_banks')->onDelete('cascade');
        });

        // Exam sessions foreign keys
        Schema::table('exam_sessions', function (Blueprint $table) {
            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
            $table->foreign('classroom_id')->references('id')->on('classrooms')->onDelete('set null');
        });

        // Exam session users foreign keys
        Schema::table('exam_session_users', function (Blueprint $table) {
            $table->foreign('exam_session_id')->references('id')->on('exam_sessions')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('exam_room_id')->references('id')->on('exam_rooms')->onDelete('set null');
        });

        // Questions foreign keys
        Schema::table('questions', function (Blueprint $table) {
            $table->foreign('question_bank_id')->references('id')->on('question_banks')->onDelete('cascade');
        });

        // Student answers foreign keys
        Schema::table('student_answers', function (Blueprint $table) {
            $table->foreign('exam_session_user_id')->references('id')->on('exam_session_users')->onDelete('cascade');
            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');
        });

        // Audit logs foreign keys
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        // Exam session proctors foreign keys
        Schema::table('exam_session_proctors', function (Blueprint $table) {
            $table->foreign('exam_session_id')->references('id')->on('exam_sessions')->onDelete('cascade');
            $table->foreign('exam_room_id')->references('id')->on('exam_rooms')->onDelete('cascade');
            $table->foreign('proctor_id')->references('id')->on('proctors')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_session_proctors', function (Blueprint $table) {
            $table->dropForeign(['exam_session_id']);
            $table->dropForeign(['exam_room_id']);
            $table->dropForeign(['proctor_id']);
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('student_answers', function (Blueprint $table) {
            $table->dropForeign(['exam_session_user_id']);
            $table->dropForeign(['question_id']);
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeign(['question_bank_id']);
        });

        Schema::table('exam_session_users', function (Blueprint $table) {
            $table->dropForeign(['exam_session_id']);
            $table->dropForeign(['user_id']);
            $table->dropForeign(['exam_room_id']);
        });

        Schema::table('exam_sessions', function (Blueprint $table) {
            $table->dropForeign(['exam_id']);
            $table->dropForeign(['classroom_id']);
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->dropForeign(['question_bank_id']);
        });

        Schema::table('question_banks', function (Blueprint $table) {
            $table->dropForeign(['subject_id']);
            $table->dropForeign(['user_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['classroom_id']);
            $table->dropForeign(['exam_room_id']);
        });
    }
};
