import { useState, useEffect } from 'react';
import type { Drop } from '@/types/domain';
import { dropsService } from '@/services/drops';
import { tacticalVibration } from '@/lib/vibration';

export function useDrops() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    async function loadDrops() {
      setLoading(true);
      const data = await dropsService.getAllDrops();
      setDrops(data);
      setLoading(false);
      
      unsubscribe = dropsService.subscribeToDrops((payload) => {
        if (payload.eventType === 'INSERT') {
          setDrops((prev) => [...prev, payload.new as Drop]);
          tacticalVibration.newDropAssignment();
        }
        if (payload.eventType === 'UPDATE')
          setDrops((prev) =>
            prev.map((d) => (d.id === payload.new.id ? (payload.new as Drop) : d))
          );
        if (payload.eventType === 'DELETE')
          setDrops((prev) => prev.filter((d) => d.id !== (payload.old as Drop).id));
      });
    }

    loadDrops();
    return () => unsubscribe?.();
  }, []);

  return { drops, loading };
}
