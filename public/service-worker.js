/**
 * THE DROP - SERVICE WORKER
 * Implements fetch timeouts and graceful offline fallbacks.
 */

const CACHE_NAME = 'droppin-ops-cache-v2';
const TIMEOUT_MS = 10000; // 10s timeout for network requests

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/**
 * Fetch with timeout helper
 */
async function fetchWithTimeout(request, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return new Response(JSON.stringify({
        error: 'Request timeout',
        code: 'TIMEOUT'
      }), {
        status: 504,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests or non-GET requests if needed
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetchWithTimeout(event.request).catch(() => {
          return new Response('Offline - Resource unavailable', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});
