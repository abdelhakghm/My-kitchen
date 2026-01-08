const CACHE_NAME = 'my-kitchen-v6';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/apple-touch-icon.png'
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

  // Stale-while-revalidate strategy for static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networked = fetch(request).then((response) => {
          const cacheCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
          return response;
        });
        return cached || networked;
      })
    );
    return;
  }

  // Network-first strategy for dynamic data (Supabase API, etc)
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});