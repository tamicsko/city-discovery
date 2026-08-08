/* Service worker: az app váza offline is elérhető, a térképcsempéket
   korlátozott mérettel, futás közben cache-eljük. */

const SHELL = 'cd-shell-v1';
const TILES = 'cd-tiles-v1';
const TILE_LIMIT = 600;

const ASSETS = [
  './',
  'index.html',
  'css/styles.css',
  'js/app.js',
  'js/pois.js',
  'vendor/leaflet.css',
  'vendor/leaflet.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== SHELL && k !== TILES).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map(k => cache.delete(k)));
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Térképcsempék: cache-first, majd háttérben frissítés
  if (url.hostname.endsWith('basemaps.cartocdn.com')) {
    event.respondWith((async () => {
      const cache = await caches.open(TILES);
      const hit = await cache.match(request);
      if (hit) return hit;
      try {
        const res = await fetch(request);
        if (res.ok || res.type === 'opaque') {
          cache.put(request, res.clone());
          trimCache(TILES, TILE_LIMIT);
        }
        return res;
      } catch {
        return new Response('', { status: 504, statusText: 'Offline' });
      }
    })());
    return;
  }

  // Csak a saját eredetünket szolgáljuk ki cache-ből
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) {
      // Háttérben frissítjük, hogy a következő indítás már az új verziót kapja
      fetch(request)
        .then(res => res.ok && caches.open(SHELL).then(c => c.put(request, res)))
        .catch(() => {});
      return cached;
    }
    try {
      return await fetch(request);
    } catch {
      return (await caches.match('index.html')) ||
             new Response('Offline', { status: 504 });
    }
  })());
});
