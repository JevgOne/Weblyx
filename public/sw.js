// Weblyx PWA Service Worker
//
// Bump CACHE_VERSION on any change to caching behaviour. Both cache names carry
// it, so `activate` drops every older cache — previously RUNTIME_CACHE was
// unversioned and therefore never purged, which let a stale HTML document
// survive indefinitely and serve markup whose CSS/JS chunks no longer existed.
const CACHE_VERSION = 'v2';
const CACHE_NAME = `weblyx-precache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `weblyx-runtime-${CACHE_VERSION}`;

// Assets to cache on install
const PRECACHE_URLS = [
  '/admin',
  '/admin/leads',
  '/admin/dashboard',
  '/admin/projects',
  '/offline',
];

/**
 * Dev kill-switch.
 *
 * `isImmutableAsset()` below serves everything under /_next/static/ cache-first
 * and never revalidates it. That is only safe when filenames carry a content
 * hash — true for a production build, false for `next dev`, whose chunk URLs
 * stay identical across rebuilds. A worker left registered from an earlier
 * session therefore keeps replaying stale CSS/JS on localhost and the page
 * renders unstyled.
 *
 * So on localhost the worker unregisters itself, drops every cache and reloads
 * the open pages instead of installing. Production is unaffected.
 */
const IS_LOCAL_DEV =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1';

if (IS_LOCAL_DEV) {
  self.addEventListener('install', () => self.skipWaiting());

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      (async () => {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: 'window' });
        for (const client of clients) client.navigate(client.url);
      })()
    );
  });
} else {

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * Only build-hashed assets may be served cache-first. Their URL changes whenever
 * the content does, so a cached copy can never go stale. Everything else —
 * above all the HTML document — must hit the network first, otherwise a deploy
 * never reaches visitors who already have the old page cached.
 */
function isImmutableAsset(url) {
  return url.pathname.startsWith('/_next/static/');
}

function isCacheableResponse(response) {
  // `basic` only: opaque cross-origin and error responses must not be stored.
  return response && response.status === 200 && response.type === 'basic';
}

function putInRuntimeCache(request, response) {
  const copy = response.clone();
  caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Never cache API traffic — it is per-user and often per-session.
  if (url.pathname.startsWith('/api')) {
    return;
  }

  if (isImmutableAsset(url)) {
    // Cache-first: hashed filename guarantees the cached copy is correct.
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (isCacheableResponse(response)) putInRuntimeCache(request, response);
          return response;
        });
      })
    );
    return;
  }

  // Everything else (documents, data, unhashed assets): network-first, with the
  // cache kept only as an offline fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (isCacheableResponse(response)) putInRuntimeCache(request, response);
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return new Response('Offline - no cached data available', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        })
      )
  );
});

} // end production-only caching

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let notification = {
    title: 'Weblyx Admin',
    body: 'Nová notifikace',
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    tag: 'default',
    requireInteraction: false,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notification = {
        ...notification,
        ...data,
      };
    } catch (e) {
      notification.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      tag: notification.tag,
      requireInteraction: notification.requireInteraction,
      data: notification.data || {},
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/admin/leads';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-leads') {
    event.waitUntil(
      // Sync logic here
      Promise.resolve()
    );
  }
});
