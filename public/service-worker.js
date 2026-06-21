/**
 * Vownest Service Worker — Network-First strategy
 *
 * Strategy per resource type:
 *   HTML pages (navigation)  → Network-first, fall back to cache offline
 *   Next.js static assets    → Cache-first (they are content-hash named, safe to cache forever)
 *   API requests             → Network-only (never cached)
 *   Images / fonts           → Stale-while-revalidate
 *
 * On new SW activation:
 *   1. Old caches with different names are deleted.
 *   2. All open tabs receive a RELOAD_PAGE message so users see the latest version immediately.
 *
 * Cache versioning:
 *   Bump CACHE_VERSION on every deploy that changes static assets.
 *   Next.js already content-hashes its JS/CSS chunks so the version mainly
 *   controls when the cache is wiped on SW activation.
 */

const CACHE_VERSION = 'v3';
const STATIC_CACHE  = `vownest-static-${CACHE_VERSION}`;
const IMAGE_CACHE   = `vownest-images-${CACHE_VERSION}`;
const ALL_CACHES    = [STATIC_CACHE, IMAGE_CACHE];

// ── Install: pre-cache only the offline shell (bare minimum) ─────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(['/icon-192.png', '/icon-512.png', '/favicon.ico'])
    )
  );
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

// ── Activate: delete old caches, then claim all clients ──────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => !ALL_CACHES.includes(name))
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      )
    ).then(() => {
      // Take control of all open pages immediately
      self.clients.claim();
      // Tell every open tab to reload so they get the latest version
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'RELOAD_PAGE' });
        });
      });
    })
  );
});

// ── Fetch: different strategy per resource type ───────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET and non-http(s)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // 2. API calls — always network, never cache
  if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) {
    return; // let the browser handle it normally
  }

  // 3. Next.js static chunks (_next/static) — cache-first
  //    These are content-hash named so it's safe to serve forever from cache.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 4. Images — stale-while-revalidate
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
          // Return cached immediately, update in background
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // 5. HTML navigation — NETWORK FIRST, fall back to cache only when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Store a copy of the fresh page for offline fallback
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          // Offline: serve cached version or the root shell
          caches.match(request).then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // 6. Everything else — network first, silent fallback to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
