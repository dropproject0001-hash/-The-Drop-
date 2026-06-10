import Dexie, { Table } from 'dexie';

interface QueuedLocation {
  id?: number;
  payload: any;
  timestamp: string;
  attempts: number;
}

class LocationOutboxDB extends Dexie {
  outbox!: Table<QueuedLocation>;

  constructor() {
    super('location-outbox');
    this.version(1).stores({
      outbox: '++id, timestamp',
    });
  }
}

const db = new LocationOutboxDB();

export const LocationOutbox = {
  async queue(payload: any) {
    await db.outbox.add({
      payload,
      timestamp: new Date().toISOString(),
      attempts: 0,
    });
  },

  async getAll() {
    return db.outbox.orderBy('timestamp').toArray();
  },

  async remove(id: number) {
    await db.outbox.delete(id);
  },

  async incrementAttempts(id: number) {
    const item = await db.outbox.get(id);
    if (item) {
      await db.outbox.update(id, { attempts: item.attempts + 1 });
    }
  },

  async clear() {
    await db.outbox.clear();
  },
};
