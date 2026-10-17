const CACHE_NAME = 'portfolio-v38';
const ASSETS = ['./index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Network-first (so new deployments / maintenance UI always load fresh), cache fallback when offline
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
    e.respondWith(
        fetch(e.request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy)).catch(() => {});
            return res;
        }).catch(() => caches.match(e.request))
    );
});
