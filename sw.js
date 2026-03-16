const CACHE_NAME = 'for-nada-v1';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/countdown.html',
    '/manifest.json'
];

// --- Install & Cache Static Assets ---
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// --- Activate & Cleanup Old Caches ---
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// --- Fetch Interceptor (Offline Support) ---
self.addEventListener('fetch', (event) => {
    // Only cache GET requests for static app shell
    if (event.request.method !== 'GET' || event.request.url.includes('/api/')) return;

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached version if found, else fetch from network
            return response || fetch(event.request).then((fetchRes) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, fetchRes.clone());
                    return fetchRes;
                });
            });
        }).catch(() => {
            // Fallback for offline if not cached
            if (event.request.destination === 'document') {
                return caches.match('/index.html');
            }
        })
    );
});

// --- Web Push Notifications Handler ---
self.addEventListener('push', (event) => {
    let data = {};
    if (event.data) {
        data = event.data.json();
    }

    const title = data.title || 'رسالة جديدة 💌';
    const options = {
        body: data.body || 'يوجد تحديث أو رسالة جديدة في الموقع.',
        icon: data.icon || '/images/icon-192.png',
        badge: '/images/icon-192.png',
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        data: {
            url: (data.data && data.data.url) ? data.data.url : '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// --- Notification Click Handler ---
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    // Attempt to open the target URL, or focus if already open
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
            
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
