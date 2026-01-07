const CACHE_NAME = 'my-kitchen-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Basic cache setup, focusing on PWA installability
      return cache.addAll(['/']);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy for dynamic content like chat/meals
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});