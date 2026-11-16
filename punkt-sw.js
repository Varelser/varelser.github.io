// Punkt PWA service worker (2026-11-17): scoped to /punkt.html only.
// The origin root scope belongs to Noise's sw.js; this worker registers with
// scope '/punkt.html' so it never controls or evicts anything else.
// Strategy: network-first for the Punkt document (updates apply immediately
// when online), cache fallback when offline. It only ever deletes its own
// 'punkt-pwa-' caches.
const CACHE = 'punkt-pwa-v1';
const DOC = '/punkt.html';
const EXTRA = ['/punkt.webmanifest', '/apple-touch-icon.png', '/favicon.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll([DOC].concat(EXTRA)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('punkt-pwa-') && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const isDoc = req.mode === 'navigate' && url.pathname === DOC;
  const isExtra = EXTRA.includes(url.pathname);
  if (!isDoc && !isExtra) return; // everything else: default network handling
  if (isDoc) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await fetch(req);
        if (res && res.status === 200) cache.put(DOC, res.clone());
        return res;
      } catch (err) {
        const cached = await cache.match(DOC, { ignoreSearch: true });
        return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) return cached;
    const res = await fetch(req);
    if (res && res.status === 200) cache.put(req, res.clone());
    return res;
  })());
});
