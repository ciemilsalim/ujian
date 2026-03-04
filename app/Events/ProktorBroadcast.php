<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProktorBroadcast implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $sessionId;
    public $message;
    public $senderName;

    /**
     * Create a new event instance.
     */
    public function __construct($sessionId, $message, $senderName)
    {
        $this->sessionId = $sessionId;
        $this->message = $message;
        $this->senderName = $senderName;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Broadcast to a specific session OR a global channel if sessionId is null
        if ($this->sessionId) {
            return [new PrivateChannel('exam.session.' . $this->sessionId)];
        }

        return [new PrivateChannel('proktor.broadcast.global')];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'proktor.announcement';
    }
}
