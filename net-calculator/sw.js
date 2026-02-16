/**
 * Service Worker for Net Hesaplama PWA
 * Enables offline functionality by caching all assets
 */

const CACHE_NAME = 'net-hesaplama-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './logo.png',
    './manifest.json',
    './libs/xlsx.full.min.js',
    './libs/phosphor-icons.css',
    './libs/Phosphor.woff2'
];

// Install event - cache all assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Önbellek açıldı');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('Tüm kaynaklar önbelleğe alındı');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eski önbellek siliniyor:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }

                return fetch(event.request).then((networkResponse) => {
                    // Don't cache non-successful responses or external requests
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    // Clone the response for caching
                    const responseToCache = networkResponse.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                }).catch(() => {
                    // If both cache and network fail, return a fallback
                    console.log('Hem önbellek hem de ağ başarısız oldu:', event.request.url);
                });
            })
    );
});
