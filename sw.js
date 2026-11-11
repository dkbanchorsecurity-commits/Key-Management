const CACHE_NAME = 'belrose-keys-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// Install event - cache initial assets and skip waiting to activate immediately
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate event - clear out old caches when a new version is deployed
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - Network First strategy for app files, ensuring Vercel updates apply instantly
self.addEventListener('fetch', event => {
    // For local files (like index.html), try the network first to get updates from Vercel
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            fetch(event.request).then(response => {
                // If network fetch succeeds, update the cache with the new version
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            }).catch(() => {
                // If offline, fallback to the cached version
                return caches.match(event.request);
            })
        );
    } else {
        // For external requests (Firebase, CDNs), pass through normally, fallback to cache if offline
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
    }
});