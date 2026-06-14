/**
 * @file src/hooks/realtime/useLiveLocations.ts
 *
 * FIXED:
 * - Now subscribes to the real 'locations' table (not non-existent 'drop_locations')
 * - Added initial data load on mount (critical for monitoring)
 * - Proper shape mapping from DB row
 * - Keyed by user_id (agent presence model)
 * - Supports optional user filter
 * - Better error handling + cleanup
 */
import { useEffect, useState, useCallback } from 'react';
import { realtimeService } from '../../services/supabase/realtime.service';
import { supabase } from '../../lib/supabase';

export interface LiveLocation {
  id: number;
  user_id: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  altitude: number | null;
  recorded_at: string;
}

interface UseLiveLocationsOptions {
  userId?: string;
  limit?: number;
}

export function useLiveLocations(options: UseLiveLocationsOptions = {}) {
  const [locations, setLocations] = useState<Record<string, LiveLocation[]>>({});
  const [allLocations, setAllLocations] = useState<LiveLocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [useFallbackPolling, setUseFallbackPolling] = useState(false);

  const { userId, limit = 50 } = options;

  const loadInitial = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      let query = supabase
        .from('locations')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const grouped: Record<string, LiveLocation[]> = {};
      (data || []).forEach((loc: any) => {
        if (!grouped[loc.user_id]) grouped[loc.user_id] = [];
        grouped[loc.user_id].push(loc as LiveLocation);
      });

      setLocations(grouped);
      setAllLocations(data as LiveLocation[] || []);
    } catch (err: any) {
      console.error('[useLiveLocations] Initial load failed:', err);
      setError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    loadInitial();

    const filter = userId ? `user_id=eq.${userId}` : undefined;

    const unsubscribe = realtimeService.subscribeToTable<LiveLocation>(
      'locations',
      'INSERT',
      (payload) => {
        const newLoc = payload.new as LiveLocation;
        
        setLocations(prev => {
          // Performance Optimization: ISO strings are lexicographically sortable.
          // Avoiding 'new Date()' instantiation on the hot path (real-time telemetry updates).
          const userLocs = [...(prev[newLoc.user_id] || []), newLoc]
            .sort((a, b) => b.recorded_at > a.recorded_at ? 1 : -1)
            .slice(0, 20); // keep last 20 per user
          
          return { ...prev, [newLoc.user_id]: userLocs };
        });

        setAllLocations(prev => [newLoc, ...prev].slice(0, limit));
      },
      filter,
      {
        maxRetries: 5,
        onError: (err) => {
          console.warn('[useLiveLocations] Realtime total failure after retries. Fallback to polling:', err);
          setError(err?.message || 'Location realtime error');
          setUseFallbackPolling(true);
        }
      }
    );

    return () => unsubscribe();
  }, [userId, limit, loadInitial]);

  // Backup polling fallback when websocket transport is failing
  useEffect(() => {
    if (!useFallbackPolling) return;

    const interval = setInterval(() => {
      loadInitial(true); // Silent refresh
    }, 8000);

    return () => clearInterval(interval);
  }, [useFallbackPolling, loadInitial]);

  const getLatestForUser = useCallback((uid: string) => {
    const userLocs = locations[uid];
    return userLocs && userLocs.length > 0 ? userLocs[0] : null;
  }, [locations]);

  return { 
    locations, 
    allLocations, 
    getLatestForUser,
    error, 
    loading,
    refresh: loadInitial,
    status: { mode: useFallbackPolling ? 'polling' : 'realtime' }
  };
}
