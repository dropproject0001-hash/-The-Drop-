import Dexie, { Table } from 'dexie';

export interface SyncQueueItem {
  id?: number;
  type: 'location' | 'drop_status' | 'message';
  payload: any;
  timestamp: string;
  synced: boolean;
}

class DropDatabase extends Dexie {
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('TheDropDB');
    this.version(1).stores({
      syncQueue: '++id, type, synced, timestamp'
    });
  }
}

export const db = new DropDatabase();
