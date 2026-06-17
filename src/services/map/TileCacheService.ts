import Dexie, { Table } from 'dexie';

interface TileData {
  url: string; // The URL as the primary key/ID
  blob: Blob;
  timestamp: number;
}

class TileDatabase extends Dexie {
  tiles!: Table<TileData>;

  constructor() {
    super('NuevaEcijaCache');
    this.version(1).stores({
      tiles: 'url, timestamp'
    });
  }
}

const db = new TileDatabase();

// Help convert lat/lon to OpenStreetMap tile coordinates
function latLonToTile(lat: number, lon: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

export const TileCacheService = {
  async getTile(url: string): Promise<Blob | null> {
    try {
      const tile = await db.tiles.get(url);
      if (!tile) return null;
      
      // Update timestamp for LRU
      await db.tiles.update(url, { timestamp: Date.now() });
      return tile.blob;
    } catch (err) {
      console.error('[TileCacheService] Error reading tile:', err);
      return null;
    }
  },

  async saveTile(url: string, blob: Blob) {
    try {
      const count = await db.tiles.count();
      if (count > 3000) { // Increased limit slightly to 3000 tiles (~100-150MB)
        const oldest = await db.tiles.orderBy('timestamp').first();
        if (oldest) await db.tiles.delete(oldest.url);
      }
      await db.tiles.put({ url, blob, timestamp: Date.now() });
    } catch (err) {
      console.warn('[TileCacheService] Error saving tile:', err);
    }
  },

  async clearCache() {
    try {
      await db.tiles.clear();
      console.log('[TileCacheService] Cache successfully cleared.');
      return true;
    } catch (err) {
      console.error('[TileCacheService] Error clearing cache:', err);
      return false;
    }
  },

  async getCacheStats() {
    try {
      const count = await db.tiles.count();
      let totalSize = 0;
      await db.tiles.each(tile => {
        if (tile.blob) {
          totalSize += tile.blob.size;
        }
      });
      return {
        count,
        sizeMb: parseFloat((totalSize / (1024 * 1024)).toFixed(2))
      };
    } catch (err) {
      console.error('[TileCacheService] Error reading cache stats:', err);
      return { count: 0, sizeMb: 0 };
    }
  },

  /**
   * Scans a lat/lon center point and bounding box radius, pre-fetches and saves tiles 
   * in IndexedDB for the selected zoom levels.
   */
  async seedCacheForArea(
    lat: number, 
    lon: number, 
    radiusKm: number, 
    zoomLevels: number[], 
    urlTemplate: string,
    subdomains: string = 'abc',
    onProgress?: (downloaded: number, total: number, message: string) => void
  ): Promise<{ success: number; failed: number }> {
    let successCount = 0;
    let failedCount = 0;

    // Estimate coordinates box
    // 1 lat degree ~ 111.1km
    const latDelta = radiusKm / 111.1;
    // 1 lon degree ~ 111.1 * cos(lat)
    const lonDelta = radiusKm / (111.1 * Math.cos((lat * Math.PI) / 180));

    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLon = lon - lonDelta;
    const maxLon = lon + lonDelta;

    const urlsToDownload: string[] = [];

    // Calculate tile boundaries for each target zoom level
    for (const z of zoomLevels) {
      const topLeft = latLonToTile(maxLat, minLon, z);
      const bottomRight = latLonToTile(minLat, maxLon, z);

      const minX = Math.min(topLeft.x, bottomRight.x);
      const maxX = Math.max(topLeft.x, bottomRight.x);
      const minY = Math.min(topLeft.y, bottomRight.y);
      const maxY = Math.max(topLeft.y, bottomRight.y);

      // Bound safety (restrict seed size to prevent huge downloads)
      // Max 40 tiles per zoom level to protect server rates and network bandwidth
      const tilesCount = (maxX - minX + 1) * (maxY - minY + 1);
      if (tilesCount > 100) {
        console.warn(`[TileCache] Skipping zoom level ${z} due to high tile count (${tilesCount} tiles). Max is 100.`);
        continue;
      }

      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          // Select subdomain
          const subdomainIndex = Math.abs(x + y) % subdomains.length;
          const s = subdomains.charAt(subdomainIndex);

          // Format tile url
          let tileUrl = urlTemplate
            .replace('{s}', s)
            .replace('{z}', z.toString())
            .replace('{x}', x.toString())
            .replace('{y}', y.toString())
            .replace('{r}', ''); // clean retina if present
          
          urlsToDownload.push(tileUrl);
        }
      }
    }

    const totalToDownload = urlsToDownload.length;
    onProgress?.(0, totalToDownload, `Identified ${totalToDownload} tiles to buffer...`);

    // Download tiles in small blocks to avoid server blocking / rate limits
    const chunkSize = 5;
    for (let i = 0; i < totalToDownload; i += chunkSize) {
      const chunk = urlsToDownload.slice(i, i + chunkSize);
      
      await Promise.all(
        chunk.map(async (url) => {
          // Check if already in cache
          const existing = await this.getTile(url);
          if (existing) {
            successCount++;
            return;
          }

          try {
            const res = await fetch(url, { mode: 'cors' });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            await this.saveTile(url, blob);
            successCount++;
          } catch (e) {
            failedCount++;
          }
        })
      );

      const currentProgress = Math.min(i + chunkSize, totalToDownload);
      onProgress?.(
        currentProgress, 
        totalToDownload, 
        `Downloading tiles... [${currentProgress}/${totalToDownload}]`
      );

      // Small throttle safety to protect mapping servers
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    onProgress?.(totalToDownload, totalToDownload, `Caching operational: ${successCount} saved, ${failedCount} skipped.`);
    return { success: successCount, failed: failedCount };
  }
};
