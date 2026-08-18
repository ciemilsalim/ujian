<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('question_banks', function (Blueprint $table) {
            $table->foreignId('academic_year_id')->nullable()->after('id')->constrained('academic_years')->nullOnDelete();
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->foreignId('academic_year_id')->nullable()->after('id')->constrained('academic_years')->nullOnDelete();
        });

        // Seed default active academic year if not present
        $defaultYearId = DB::table('academic_years')->where('is_active', true)->value('id');

        if (!$defaultYearId) {
            $defaultYearId = DB::table('academic_years')->insertGetId([
                'name' => '2025/2026',
                'semester' => 'Genap',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Attach existing question_banks and exams to default academic year
        DB::table('question_banks')->whereNull('academic_year_id')->update(['academic_year_id' => $defaultYearId]);
        DB::table('exams')->whereNull('academic_year_id')->update(['academic_year_id' => $defaultYearId]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropForeign(['academic_year_id']);
            $table->dropColumn('academic_year_id');
        });

        Schema::table('question_banks', function (Blueprint $table) {
            $table->dropForeign(['academic_year_id']);
            $table->dropColumn('academic_year_id');
        });
    }
};
