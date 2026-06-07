const CACHE_NAME = 'mamburao-map-tiles-v1';

// Approximate bounding box for Mamburao, Occidental Mindoro
const MAMBURAO_BOUNDS = {
  minLat: 13.18,
  maxLat: 13.28,
  minLng: 120.55,
  maxLng: 120.65,
  zoomLevels: [12, 13, 14, 15] // Pre-cache these zoom levels
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Pre-caching Mamburao tiles...');

      const tileUrls = [];

      for (let z of MAMBURAO_BOUNDS.zoomLevels) {
        const minTileX = Math.floor((MAMBURAO_BOUNDS.minLng + 180) / 360 * Math.pow(2, z));
        const maxTileX = Math.floor((MAMBURAO_BOUNDS.maxLng + 180) / 360 * Math.pow(2, z));
        const minTileY = Math.floor((1 - Math.log(Math.tan(MAMBURAO_BOUNDS.maxLat * Math.PI / 180) + 1 / Math.cos(MAMBURAO_BOUNDS.maxLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
        const maxTileY = Math.floor((1 - Math.log(Math.tan(MAMBURAO_BOUNDS.minLat * Math.PI / 180) + 1 / Math.cos(MAMBURAO_BOUNDS.minLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));

        for (let x = minTileX; x <= maxTileX; x++) {
          for (let y = minTileY; y <= maxTileY; y++) {
            const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
            tileUrls.push(url);
          }
        }
      }

      // Cache tiles (with error handling)
      await Promise.allSettled(
        tileUrls.map(url => 
          fetch(url).then(res => {
            if (res.ok) return cache.put(url, res);
          }).catch(() => {})
        )
      );

      console.log(`[SW] Cached ${tileUrls.length} tiles for Mamburao`);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('tile.openstreetmap.org') || event.request.url.includes('tiles.stadiamaps.com')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
          // You might return a fallback offline tile image here if needed
        });
      })
    );
  }
});
