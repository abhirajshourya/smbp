/*
 * Offline support for Split My Bill Plz.
 *
 * This app is a good offline candidate almost by accident: there's no backend,
 * every bill lives in localStorage, and nothing on /split touches the network
 * once the bundle has loaded. So the only thing standing between it and
 * working on restaurant wifi is caching the app shell.
 *
 * Deliberately runtime caching rather than a precached build manifest. A
 * precache needs the list of Next's hashed output files, which means a build
 * plugin (Serwist and friends) — real complexity and a dependency to maintain.
 * Runtime caching gets the same result for this app: everything under
 * /_next/static is content-hashed and therefore immutable, so it's safe to
 * cache forever and a changed file simply arrives under a new name. Nothing
 * here needs to know what the build produced.
 *
 * Strategies:
 *   /_next/static/*  cache-first        (immutable, hashed filenames)
 *   navigations      network-first      (fresh HTML online, cache when not)
 *   other same-origin stale-while-revalidate
 */

// Bump to invalidate everything. Old caches are dropped on activate.
const VERSION = 'v1';
const CACHE = `smbp-${VERSION}`;

// The two routes worth having before the user has visited them, so a cold
// start offline still renders something.
const SHELL = ['/', '/split'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // addAll() rejects the whole batch if any single request fails, which
      // would abort the install; these are a nicety, not a requirement.
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isCacheable(response) {
  // `basic` excludes opaque cross-origin responses, which have status 0 and
  // would poison the cache with unreadable entries.
  return response && response.status === 200 && response.type === 'basic';
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (isCacheable(response)) {
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline: this exact page if we've seen it, otherwise the splitter, which
    // is the one screen that's genuinely useful with no connection.
    const cached = (await caches.match(request)) || (await caches.match('/split'));
    if (cached) return cached;
    throw new Error('Offline and no cached response available');
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (isCacheable(response)) cache.put(request, response.clone());
      return response;
    })
    // Swallow: with a cached copy in hand this is a background refresh, and
    // without one the caller already gets the rejection below.
    .catch(() => undefined);

  if (cached) return cached;

  const response = await network;
  if (response) return response;
  throw new Error('Offline and no cached response available');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache the worker itself (it must always be revalidated), and leave
  // analytics beacons alone — replaying a stale one would report a visit that
  // didn't happen.
  if (url.pathname === '/sw.js' || url.pathname.startsWith('/_vercel/')) return;

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
