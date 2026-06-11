import { useState, useEffect } from 'react';
import type { Drop } from '@/types/domain';
import { dropsService } from '@/services/drops';

export function useDropperDrops(userId: string | undefined) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setDrops([]);
      setLoading(false);
      return;
    }

    let unsubscribe: () => void;

    async function loadDrops() {
      setLoading(true);
      const data = await dropsService.getDropsByAssignee(userId!);
      setDrops(data);
      setLoading(false);
      
      unsubscribe = dropsService.subscribeToDrops((payload) => {
        // Only update if relevant to this dropper
        if (payload.eventType === 'INSERT' && payload.new.assigned_to === userId)
          setDrops((prev) => [...prev, payload.new as Drop]);
        
        if (payload.eventType === 'UPDATE') {
          if (payload.new.assigned_to === userId) {
             setDrops((prev) =>
               prev.some(d => d.id === payload.new.id)
                 ? prev.map((d) => (d.id === payload.new.id ? (payload.new as Drop) : d))
                 : [...prev, payload.new as Drop]
             );
          } else {
             // Removed from this dropper
             setDrops((prev) => prev.filter((d) => d.id !== payload.new.id));
          }
        }
        
        if (payload.eventType === 'DELETE')
          setDrops((prev) => prev.filter((d) => d.id !== (payload.old as Drop).id));
      });
    }

    loadDrops();
    return () => unsubscribe?.();
  }, [userId]);

  return { drops, loading };
}
