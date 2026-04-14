import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

// Determine broadcasting driver based on environment
const broadcastDriver = import.meta.env.VITE_BROADCAST_DRIVER || 'reverb';
const usePolling = import.meta.env.VITE_USE_POLLING === 'true';

if (usePolling) {
    // Use polling for environments without WebSocket support (works offline and online)
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY || 'local-key',
        wsHost: window.location.hostname,
        wsPort: 6001,
        wssPort: 6001,
        forceTLS: window.location.protocol === 'https:',
        enabledTransports: ['polling'],
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
    });
} else if (broadcastDriver === 'pusher') {
    // Use Pusher for production (cPanel)
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        wsHost: import.meta.env.VITE_PUSHER_HOST || 'ws.pusherapp.com',
        wsPort: import.meta.env.VITE_PUSHER_PORT || 80,
        wssPort: import.meta.env.VITE_PUSHER_PORT || 443,
        forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss', 'polling'],
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
    });
} else {
    // Use Reverb for local development (offline)
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
