<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('exam.session.{sessionId}', function ($user, $sessionId) {
    // Both proktor and the participant themselves can listen, though currently we only strictly need proktor for the monitoring dashboard
    return $user !== null;
});

Broadcast::channel('proktor.notifications', function ($user) {
    return $user->isProktor();
});

Broadcast::channel('proktor.broadcast.global', function ($user) {
    return $user->isProktor() || $user->isSiswa(); // Students must be able to listen to global broadcasts
});
