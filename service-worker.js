// Cache version — increment this whenever you deploy new changes
// so mobile devices discard the old cache immediately.
const CACHE_NAME = 'pegs-solitaire-v3';

const ASSETS = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './manifest.json',
    './service-worker.js'
];

// Install: cache all assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).catch(error => {
            console.error('Caching failed:', error);
        })
    );
    // Force the waiting service worker to become active right away
    self.skipWaiting();
});

// Activate: delete old caches so stale files are removed on mobile
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    // Take control of all open pages immediately
    self.clients.claim();
});

// Fetch: network-first strategy so updates are always picked up,
// falling back to cache when offline.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Update the cache with the fresh response
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return networkResponse;
            })
            .catch(() => {
                // Network failed — serve from cache
                return caches.match(event.request).then(cached => {
                    if (cached) return cached;
                    console.error('No cache entry for:', event.request.url);
                });
            })
    );
});
