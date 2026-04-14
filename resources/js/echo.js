import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

// Determine broadcasting driver based on environment
const broadcastDriver = import.meta.env.VITE_BROADCAST_DRIVER || 'reverb';

if (broadcastDriver === 'pusher') {
    // Use official Pusher service (works on cPanel & local)
    // Do NOT set wsHost/wsPort/wssPort — let Pusher auto-resolve from cluster
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1',
        forceTLS: true,
        encrypted: true,
    });
} else {
    // Use Reverb for local development (self-hosted WebSocket)
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
}
