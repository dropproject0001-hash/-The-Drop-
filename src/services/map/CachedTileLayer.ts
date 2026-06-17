import L from 'leaflet';
import { TileCacheService } from '@/services/map/TileCacheService';

export const createCachedTileLayer = (url: string, options?: L.TileLayerOptions) => {
  const CachedLayer = L.TileLayer.extend({
    createTile: function(coords: any, done: any) {
      const tile = document.createElement('img');
      
      // Select appropriate subdomain based on coords
      let subdomain = 'a';
      if (options?.subdomains) {
        const sub = options.subdomains;
        const index = Math.abs(coords.x + coords.y) % sub.length;
        subdomain = typeof sub === 'string' ? sub.charAt(index) : sub[index];
      }

      const tileUrl = L.Util.template(url, L.extend({
        s: subdomain,
        z: coords.z,
        x: coords.x,
        y: coords.y,
        r: L.Browser.retina ? '@2x' : ''
      }, options));

      // Cache Check
      TileCacheService.getTile(tileUrl)
        .then(blob => {
          if (blob) {
            // Found in IndexedDB! Use it.
            const objectUrl = URL.createObjectURL(blob);
            tile.onload = () => {
              URL.revokeObjectURL(objectUrl);
              done(null, tile);
            };
            tile.onerror = () => {
              URL.revokeObjectURL(objectUrl);
              // Fallback to online if blob had issues
              tile.onload = () => done(null, tile);
              tile.onerror = () => done(null, tile);
              tile.src = tileUrl;
            };
            tile.src = objectUrl;
          } else {
            // Not in cache, fetch it as Blob directly to avoid canvas-tainting issues
            fetch(tileUrl)
              .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.blob();
              })
              .then(fetchedBlob => {
                // Save to cache asynchronously in background
                TileCacheService.saveTile(tileUrl, fetchedBlob).catch(err => {
                  console.warn('[TileCacheService] Failed to cache tile blob:', err);
                });

                const objectUrl = URL.createObjectURL(fetchedBlob);
                tile.onload = () => {
                  URL.revokeObjectURL(objectUrl);
                  done(null, tile);
                };
                tile.onerror = () => {
                  URL.revokeObjectURL(objectUrl);
                  done(null, tile);
                };
                tile.src = objectUrl;
              })
              .catch(err => {
                // Fetch failed (CORS, offline, etc.)
                // Fall back to native img src handling so the browser can still load and render
                // even if CORS doesn't allow JS-based fetch.
                tile.onload = () => done(null, tile);
                tile.onerror = () => done(null, tile);
                tile.src = tileUrl;
              });
          }
        })
        .catch(dbErr => {
          console.error('[TileCacheService] Database error checking tile cache:', dbErr);
          // Fall back to native image tags
          tile.onload = () => done(null, tile);
          tile.onerror = () => done(null, tile);
          tile.src = tileUrl;
        });

      return tile;
    }
  });

  return new (CachedLayer as any)(url, options);
};
