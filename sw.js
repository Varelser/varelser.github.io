// Noise PWA service worker: cache-first for the app shell, stale-while-revalidate.
// Hosts: varelser.github.io (app at /noise.html; the origin root is a different
// page, so only /noise.html is treated as the app document there) and
// Cloudflare Pages (app also served at /, /index.html and /noise due to
// pretty-URL canonicalisation).
const CACHE = 'noise-pwa-v4';
const ON_PAGES = self.location.hostname.endsWith('.pages.dev');
const DOC_PATHS = ON_PAGES ? ['/', '/index.html', '/noise', '/noise.html'] : ['/noise.html'];
const CORE = [
  '/noise.html',
  '/manifest.webmanifest',
  '/icon.svg',
  'https://noise-assets.pages.dev/icon-192.png',
  'https://noise-assets.pages.dev/icon-512.png',
  'https://noise-assets.pages.dev/icon-maskable-512.png',
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isDoc = req.mode === 'navigate' && DOC_PATHS.includes(url.pathname) && url.origin === self.location.origin;
  const isCore = isDoc || CORE.includes(url.pathname) || CORE.includes(req.url);
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!isCore && !isFont) return; // everything else: default network handling
  const key = isDoc ? '/noise.html' : req;
  if (isDoc) {
    // Documents: network-first so app updates apply immediately when online;
    // the cache only takes over offline.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await fetch(req);
        if (res && res.status === 200) cache.put(key, res.clone());
        return res;
      } catch (err) {
        const cached = await cache.match(key, { ignoreSearch: true });
        return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(key, { ignoreSearch: true });
    const network = fetch(req).then((res) => {
      if (res && (res.status === 200 || res.type === 'opaque')) cache.put(key, res.clone());
      return res;
    });
    if (cached) {
      network.catch(() => {});
      return cached;
    }
    try {
      return await network;
    } catch (err) {
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});
