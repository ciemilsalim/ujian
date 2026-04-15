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
        Schema::table('proctors', function (Blueprint $table) {
            $table->string('pin', 6)->nullable()->unique()->after('nip');
        });

        // Initialize pins for existing records if any
        $proctors = \App\Models\Proctor::all();
        foreach ($proctors as $proctor) {
            $pin = str_pad((string)mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
            // Verify uniqueness
            while (\App\Models\Proctor::where('pin', $pin)->where('id', '!=', $proctor->id)->exists()) {
                $pin = str_pad((string)mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
            }
            $proctor->pin = $pin;
            $proctor->save();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proctors', function (Blueprint $table) {
            $table->dropColumn('pin');
        });
    }
};
