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

export const TileCacheService = {
  async getTile(url: string): Promise<Blob | null> {
    const tile = await db.tiles.get(url);
    if (!tile) return null;
    
    // Update timestamp for LRU
    await db.tiles.update(url, { timestamp: Date.now() });
    return tile.blob;
  },

  async saveTile(url: string, blob: Blob) {
    const count = await db.tiles.count();
    if (count > 2000) { // Limit to 2000 tiles ~ 100-200MB
      const oldest = await db.tiles.orderBy('timestamp').first();
      if (oldest) await db.tiles.delete(oldest.url);
    }
    await db.tiles.put({ url, blob, timestamp: Date.now() });
  }
};
