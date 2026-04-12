// Minimal service worker for App Shell caching
// - Install: cache a few core resources
// - Activate: clean up old caches
// - Fetch: navigation -> network-first, static assets -> cache-first

const CACHE_NAME = 'su-pwa-v4';
const RUNTIME_CACHE = 'su-pwa-runtime-v4';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/index.css'
];

self.addEventListener('install', event => {
  // In production builds only; registration is gated by client-side code.
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS).catch(err => {
        // ignore individual failures
        console.warn('[sw] core cache addAll failed:', err);
      });
    })
  );
  // activate as soon as installed (optional)
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // remove old caches not matching current names
      const keys = await caches.keys();
      await Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME && k !== RUNTIME_CACHE) return caches.delete(k);
        })
      );
      // take control of uncontrolled clients
      try { await self.clients.claim(); } catch (e) {}
    })()
  );
});

// Helper: is this a navigation request?
function isNavigationRequest(evt) {
  return evt.request.mode === 'navigate' || (evt.request.method === 'GET' && evt.request.headers.get('accept')?.includes('text/html'));
}

self.addEventListener('fetch', event => {
  const { request } = event;

  // Network-first for navigation (SPA & index.html)
  if (isNavigationRequest(event)) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          // update runtime cache with the fresh HTML
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, networkResponse.clone()).catch(() => {});
          return networkResponse;
        } catch (err) {
          const cached = await caches.match(request);
          if (cached) return cached;
          // fallback to cached index.html
          const fallback = await caches.match('/index.html');
          return fallback || new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      })()
    );
    return;
  }

  // For code assets (js/css), use network-first so mobile gets latest build quickly.
  // For other static assets (images/fonts), keep cache-first.
  const url = new URL(request.url);
    const codeExts = ['.js', '.css'];
    const staticExts = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.woff2', '.woff', '.ttf'];
    const isCodeAsset = codeExts.some(ext => url.pathname.endsWith(ext)) || /\/assets\/.*\.(js|css)$/.test(url.pathname);
    const isStatic = staticExts.some(ext => url.pathname.endsWith(ext));

    if (isCodeAsset) {
      event.respondWith(
        (async () => {
          try {
            const networkResponse = await fetch(request);
            const cache = await caches.open(RUNTIME_CACHE);
            try { cache.put(request, networkResponse.clone()); } catch (e) {}
            return networkResponse;
          } catch (err) {
            const cached = await caches.match(request);
            if (cached) return cached;
            return new Response(null, { status: 503, statusText: 'Offline' });
          }
        })()
      );
      return;
    }

  if (isStatic) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(networkResponse => {
          // put a copy in runtime cache
          return caches.open(RUNTIME_CACHE).then(cache => {
            try { cache.put(request, networkResponse.clone()); } catch (e) {}
            return networkResponse;
          });
        }).catch(err => {
          // nothing available
          return new Response(null, { status: 404 });
        });
      })
    );
  }

  // otherwise, default to network
});
