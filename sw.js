const CACHE_NAME = 'belrose-keys-v1';

// Install event - skip waiting to activate immediately
self.addEventListener('install', event => {
    self.skipWaiting();
});

// Activate event - claim clients to control the pages immediately
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// Fetch event - Pass-through fetch for Firebase real-time data to work properly
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});