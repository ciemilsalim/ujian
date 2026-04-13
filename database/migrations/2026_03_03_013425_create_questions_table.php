<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_bank_id');
            $table->enum('type', ['pilihan_ganda', 'essay']);
            $table->text('question_text');
            $table->string('question_image')->nullable();
            $table->json('options')->nullable(); // For multiple choice
            $table->text('answer_key')->nullable();
            $table->integer('score_default')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
