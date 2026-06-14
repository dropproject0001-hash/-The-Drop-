import { useEffect } from 'react';
import { db } from '../lib/db';
import { supabase } from '../lib/supabase';

export function useOfflineSync() {
  // Sync when back online
  useEffect(() => {
    const syncQueue = async () => {
      const pending = await db.syncQueue.where('synced').equals(0).toArray();

      for (const item of pending) {
        try {
          if (item.type === 'location') {
            await supabase.from('locations').insert(item.payload);
          }
          // Add more types as needed

          await db.syncQueue.update(item.id!, { synced: true });
        } catch (err) {
          console.error('Sync failed for item:', item.id);
        }
      }
    };

    window.addEventListener('online', syncQueue);
    return () => window.removeEventListener('online', syncQueue);
  }, []);
}

// Helper to queue offline actions
export async function queueOfflineAction(type: string, payload: any) {
  await db.syncQueue.add({
    type: type as any,
    payload,
    timestamp: new Date().toISOString(),
    synced: false,
  });
}
