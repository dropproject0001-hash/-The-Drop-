import { useEffect, useState } from 'react';
import { realtimeService } from '../../services/supabase/realtime.service';

interface LocationUpdate {
  drop_id: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export function useLiveLocations(dropId?: string) {
  const [locations, setLocations] = useState<Record<string, LocationUpdate[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const filter = dropId ? `drop_id=eq.${dropId}` : undefined;

    const unsubscribe = realtimeService.subscribeToTable<LocationUpdate>(
      'drop_locations',
      'INSERT',
      (payload) => {
        const newLoc = payload.new as LocationUpdate;
        setLocations(prev => ({
          ...prev,
          [newLoc.drop_id]: [...(prev[newLoc.drop_id] || []), newLoc]
        }));
      },
      filter,
      {
        onError: (err) => setError(err?.message || 'Location realtime error')
      }
    );

    return () => unsubscribe();
  }, [dropId]);

  return { locations, setLocations, error };
}
