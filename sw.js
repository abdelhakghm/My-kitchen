const CACHE_NAME = 'my-kitchen-shell-v5';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/apple-touch-icon.png?v=2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy: Cache First for local static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // Strategy: Network First (with fallback to cache) for everything else
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Optionally cache dynamic responses if needed
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});