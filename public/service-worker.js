/**
 * @file public/service-worker.js
 *
 * FIX C-7: The fetch catch handler now returns a proper fallback Response
 *           instead of returning undefined, which would break the fetch
 *           event pipeline when a tile is both uncached and unreachable.
 * FIX L-3: Added `activate` event with `clients.claim()` so the SW takes
 *           control of existing tabs immediately without requiring a reload.
 */

const CACHE_NAME = 'mamburao-map-tiles-v1';

const MAMBURAO_BOUNDS = {
  minLat: 13.18,
  maxLat: 13.28,
  minLng: 120.55,
  maxLng: 120.65,
  zoomLevels: [12, 13, 14, 15],
};

// ── Tile URL Generator ────────────────────────────────────────────────────────
function generateTileUrls() {
  const urls = [];
  for (const z of MAMBURAO_BOUNDS.zoomLevels) {
    const n = Math.pow(2, z);
    const minX = Math.floor(((MAMBURAO_BOUNDS.minLng + 180) / 360) * n);
    const maxX = Math.floor(((MAMBURAO_BOUNDS.maxLng + 180) / 360) * n);

    const latToY = (lat) =>
      Math.floor(
        ((1 - Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
        ) / Math.PI) / 2) * n
      );

    const minY = latToY(MAMBURAO_BOUNDS.maxLat);
    const maxY = latToY(MAMBURAO_BOUNDS.minLat);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        urls.push(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`);
      }
    }
  }
  return urls;
}

// ── Install: pre-cache tiles ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Pre-caching Mamburao tiles…');
      const tileUrls = generateTileUrls();

      await Promise.allSettled(
        tileUrls.map((url) =>
          fetch(url)
            .then((res) => { if (res.ok) return cache.put(url, res); })
            .catch(() => { /* individual tile failures are acceptable */ })
        )
      );

      console.log(`[SW] Attempted to cache ${tileUrls.length} tiles for Mamburao`);
      // Skip waiting so the new SW activates immediately
      self.skipWaiting();
    })
  );
});

// ── Activate: claim all clients ───────────────────────────────────────────────
// FIX L-3: clients.claim() ensures the SW controls already-open tabs without
//           requiring a reload.
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Fetch: cache-first for map tiles ─────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const isMapTile =
    url.includes('tile.openstreetmap.org') ||
    url.includes('tiles.stadiamaps.com');

  if (!isMapTile) return; // Let non-tile requests pass through normally

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      // Not in cache — try network
      return fetch(event.request)
        .then((networkResponse) => {
          // Cache the fresh tile for next time
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        })
        .catch(() => {
          // FIX C-7: Return a proper opaque 503 response instead of undefined.
          // Returning undefined from respondWith() is a runtime error.
          return new Response('Map tile unavailable offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    })
  );
});
