import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { LocationOutbox } from '../services/LocationOutbox';

export interface BroadcastPayload {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  altitude?: number;
  drop_id?: string | null;
}

export function useLocationBroadcast() {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastBroadcast, setLastBroadcast] = useState<any>(null);

  const broadcast = useCallback(async (payload: BroadcastPayload) => {
    setIsBroadcasting(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('broadcast-location', {
        body: payload,
      });

      if (invokeError) throw invokeError;

      setLastBroadcast(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.message?.toLowerCase() || '';
      const isConnectionError =
        errorMessage.includes('fetch') ||
        errorMessage.includes('network') ||
        errorMessage.includes('request') ||
        errorMessage.includes('edge function') ||
        err.name === 'FunctionsFetchError';

      if (isConnectionError) {
        await LocationOutbox.queue(payload as unknown as Record<string, unknown>);
        console.log('[LocationOutbox] Telemetry offline or edge function unreachable. Queued location for offline sync.');
      } else {
        const message = err.message || 'Failed to broadcast location';
        setError(message);
        throw err;
      }
    } finally {
      setIsBroadcasting(false);
    }
  }, []);

  return {
    broadcast,
    isBroadcasting,
    error,
    lastBroadcast,
    clearError: () => setError(null),
  };
}
