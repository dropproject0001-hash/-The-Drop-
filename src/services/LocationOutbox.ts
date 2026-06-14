import Dexie, { Table } from 'dexie';
import { supabase } from '../lib/supabase';

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
    
    // Request persistent storage if supported
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(granted => {
        if (granted) {
          console.log('[LocationOutbox] Persistent storage granted.');
        } else {
          console.log('[LocationOutbox] Persistent storage denied (may be evicted under memory pressure).');
        }
      }).catch(err => {
        console.error('[LocationOutbox] Error requesting persistent storage:', err);
      });
    }
  }
}

const db = new LocationOutboxDB();

// Log restored items on boot
getQueueSize().then(size => {
  if (size > 0) {
    console.log(`[LocationOutbox] Restored ${size} queued locations from IndexedDB after refresh.`);
  }
});

const listeners = new Set<(state: { isSyncing: boolean; queueSize: number }) => void>();
let isSyncingState = false;

async function getQueueSize() {
  try {
    return await db.outbox.count();
  } catch {
    return 0;
  }
}

async function notify() {
  const queueSize = await getQueueSize();
  for (const listener of listeners) {
    try {
      listener({ isSyncing: isSyncingState, queueSize });
    } catch (e) {
      console.error('[LocationOutbox] Error notifying listener:', e);
    }
  }
}

export const LocationOutbox = {
  subscribe(listener: (state: { isSyncing: boolean; queueSize: number }) => void) {
    listeners.add(listener);
    getQueueSize().then((size) => {
      listener({ isSyncing: isSyncingState, queueSize: size });
    });
    return () => {
      listeners.delete(listener);
    };
  },

  setSyncing(syncing: boolean) {
    isSyncingState = syncing;
    notify();
  },

  async queue(payload: any) {
    await db.outbox.add({
      payload,
      timestamp: new Date().toISOString(),
      attempts: 0,
    });
    notify();
  },

  async getAll() {
    return db.outbox.orderBy('timestamp').toArray();
  },

  async remove(id: number) {
    await db.outbox.delete(id);
    notify();
  },

  async incrementAttempts(id: number) {
    const item = await db.outbox.get(id);
    if (item) {
      await db.outbox.update(id, { attempts: item.attempts + 1 });
    }
    notify();
  },

  async clear() {
    await db.outbox.clear();
    notify();
  },

  async flush() {
    if (isSyncingState) return;
    LocationOutbox.setSyncing(true);
    let errorOccurred = false;

    try {
      const queued = await LocationOutbox.getAll();
      for (const item of queued) {
        try {
          const { error } = await supabase.functions.invoke('broadcast-location', { body: item.payload });
          if (error) throw error;
          await LocationOutbox.remove(item.id!);
        } catch (err) {
          await LocationOutbox.incrementAttempts(item.id!);
          errorOccurred = true;
        }
      }
    } catch (err) {
      console.error('[LocationOutbox] Flush error:', err);
      errorOccurred = true;
    } finally {
      LocationOutbox.setSyncing(false);
    }

    if (errorOccurred) {
      throw new Error('Some outbox items failed to sync to base.');
    }
  }
};
