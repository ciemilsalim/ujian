<?php

namespace App\Console\Commands;

use App\Models\ExamSession;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class RotateExamTokens extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exam:rotate-tokens';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rotate tokens for all active exam sessions every 15 minutes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $activeSessions = ExamSession::where('is_active', true)
            ->where('end_time', '>', now())
            ->get();

        foreach ($activeSessions as $session) {
            $newToken = strtoupper(Str::random(6));
            $session->update(['token' => $newToken]);

            // Broadcast the new token to Monitor (optional, for proctor visibility)
            // Or just log it
            $this->info("Token for session '{$session->name}' rotated to: {$newToken}");
        }

        $this->info('Tokens rotated successfully.');
    }
}
