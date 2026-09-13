// Minimal service worker for the Adorna Style PWA.
// Strategy: cache the app shell (CSS/JS/logo) so the site opens instantly
// and works offline for browsing; API calls (products/orders) always go to
// the network since that data must stay fresh and orders must never be
// silently served from a stale cache.

const CACHE_NAME = 'adorna-style-v1';
const APP_SHELL = [
  '/',
  '/css/style.css',
  '/js/cart.js',
  '/js/api.js',
  '/js/render.js',
  '/images/brand/logo.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache API calls — orders/products/admin data must always be fresh.
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Only handle GET requests from our own origin.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
