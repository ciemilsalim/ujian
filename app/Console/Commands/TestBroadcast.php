<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Events\ProktorBroadcast;

class TestBroadcast extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:broadcast {message=Test Realtime Berhasil!} {--session=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test broadcast message via Pusher';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $message = $this->argument('message');
        $sessionId = $this->option('session');

        $this->info("Mengirim pesan: \"{$message}\"...");

        try {
            ProktorBroadcast::dispatch($sessionId, $message, 'Sistem Test');
            $this->success("Pesan berhasil dikirim ke Pusher!");
            $this->info("Silakan cek Dashboard Pusher (Debug Console) atau browser yang sedang membuka Monitor.");
        } catch (\Exception $e) {
            $this->error("Gagal mengirim broadcast: " . $e->getMessage());
        }
    }

    /**
     * Helper for success message
     */
    private function success($message)
    {
        $this->line("<info>SUCCESS:</info> {$message}");
    }
}
