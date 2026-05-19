// Service Worker — FITAURA storefront
// Every bump deletes prior caches on activate, evicting:
//   - the previous owner's product photography at /hero-*.jpg paths
//   - pre-debrand HTML with blue-* Tailwind classes
//   - pre-link-fix Footer hrefs (/about#sustainability etc.)
//   - v3.4: previous favicon.ico (old "F[I]T" wordmark) + all icon-*.png
//   - v3.5: real FITAURA monogram logo now drives every icon / OG image
const CACHE_VERSION = 'fitaura-v3.5';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Core app shell files to pre-cache
const STATIC_ASSETS = [
  '/',
  '/shop',
  '/cart',
  '/wishlist',
  '/account',
  '/categories',
  '/offline',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon-96x96.png',
];

// Cache size limits
const DYNAMIC_CACHE_LIMIT = 50;
const IMAGE_CACHE_LIMIT = 100;
const API_CACHE_LIMIT = 30;

// Trim cache to limit
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return trimCache(cacheName, maxItems);
  }
}

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('[SW] Some assets failed to cache:', err);
          // Don't fail install if some assets fail
          return Promise.resolve();
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches AND notify clients so they can hard-reload once
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating ${CACHE_VERSION}...`);
  const KEEP = new Set([STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE]);
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !KEEP.has(key))
            .map((key) => {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            }),
        ),
      )
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ includeUncontrolled: true }))
      .then((clients) => {
        // Tell any open tabs that a new SW activated so they can refresh once.
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
        });
      }),
  );
});

// Fetch: smart caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension, ws, and other non-http
  if (!url.protocol.startsWith('http')) return;

  // Skip API routes that modify data
  if (url.pathname.startsWith('/api/payment')) return;
  if (url.pathname.startsWith('/api/notifications')) return;

  // Admin: Network only; on failure show "Admin requires internet" (never generic /offline)
  if (url.pathname.startsWith('/admin') && (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => {
          const html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin – Connection required</title><style>body{font-family:system-ui,sans-serif;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#FBF7F1;}.box{text-align:center;max-width:24rem;padding:2rem;}h1{font-size:1.5rem;color:#26261F;margin-bottom:0.5rem;}p{color:#494945;margin-bottom:1.5rem;}a{display:inline-block;background:#D14F2B;color:#FBF7F1;padding:0.75rem 1.5rem;border-radius:0.25rem;text-decoration:none;font-weight:600;letter-spacing:0.05em;}a:hover{background:#B83F1E;}</style></head><body><div class="box"><h1>Connection required</h1><p>Admin needs an internet connection. Check your network and try again.</p><a href="/admin">Try again</a></div></body></html>';
          return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        })
    );
    return;
  }
  if (url.pathname.startsWith('/admin')) return;

  // Strategy: Images - Cache First, but bypass HTTP cache on first miss so the
  // browser's HTTP cache (which may hold prior owners' photography under the
  // same paths) cannot serve stale content into the SW cache.
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/) ||
    url.hostname.includes('supabase.co') && url.pathname.includes('/storage/')
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) return cached;
          // `cache: 'reload'` forces the network and bypasses the browser
          // HTTP cache for this single fetch — critical for evicting any
          // immutable-cached photography from previous deploys.
          return fetch(request.url, { cache: 'reload', credentials: 'same-origin' }).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
              trimCache(IMAGE_CACHE, IMAGE_CACHE_LIMIT);
            }
            return response;
          }).catch(() => {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#f3f4f6" width="200" height="200"/><text fill="#9ca3af" font-family="sans-serif" font-size="14" text-anchor="middle" x="100" y="105">Image unavailable</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          });
        });
      })
    );
    return;
  }

  // Strategy: Storefront API - Network First with cache fallback (short TTL)
  if (url.pathname.startsWith('/api/storefront')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
              trimCache(API_CACHE, API_CACHE_LIMIT);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response(JSON.stringify({ error: 'Offline' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Strategy: Static assets (JS, CSS, fonts) - Cache First
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/) ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    url.hostname === 'cdn.jsdelivr.net'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Strategy: Pages - Network First with cache fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
              trimCache(DYNAMIC_CACHE, DYNAMIC_CACHE_LIMIT);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/offline');
          });
        })
    );
    return;
  }

  // Default: Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New update',
    icon: '/icon-192.png',
    badge: '/favicon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Notification',
      options
    )
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});

// Periodic background sync (for updates)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch(() => { });
      })
    );
  }
});
