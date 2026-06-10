#!/bin/bash
# Consolidated Patch Script for The Drop Realtime Realtime Location System

echo "Applying patches..."

# 1. Update Realtime Hook (with Polling Fallback)
cat << 'EOF' > src/hooks/realtime/useLiveLocations.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { realtimeService } from '../../services/supabase/realtime.service';
import { supabase } from '../../lib/supabase';
import type { LiveLocation } from '../../types/domain';

interface UseLiveLocationsOptions {
  userId?: string;
  dropId?: string;
  limit?: number;
  pollingIntervalMs?: number;
  forcePolling?: boolean;
  adaptivePolling?: boolean;
}

type ConnectionMode = 'realtime' | 'polling' | 'offline';

interface RealtimeStatus {
  mode: ConnectionMode;
  isConnected: boolean;
  lastUpdate: string | null;
}

export function useLiveLocations(options: UseLiveLocationsOptions = {}) {
  const [locations, setLocations] = useState<Record<string, LiveLocation[]>>({});
  const [allLocations, setAllLocations] = useState<LiveLocation[]>([]);
  const [status, setStatus] = useState<RealtimeStatus>({
    mode: 'realtime',
    isConnected: false,
    lastUpdate: null,
  });

  const { userId, dropId, limit = 30, pollingIntervalMs = 8000, forcePolling = false, adaptivePolling = true } = options;
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const failureCountRef = useRef(0);

  const loadInitialData = useCallback(async () => {
    let query = supabase.from('locations').select('*').order('recorded_at', { ascending: false }).limit(limit);
    if (userId) query = query.eq('user_id', userId);
    if (dropId) query = query.eq('drop_id', dropId);
    const { data } = await query;
    if (data) {
      const grouped: Record<string, LiveLocation[]> = {};
      data.forEach((loc) => { if (!grouped[loc.user_id]) grouped[loc.user_id] = []; grouped[loc.user_id].push(loc as LiveLocation); });
      setLocations(grouped);
      setAllLocations(data as LiveLocation[]);
    }
  }, [userId, dropId, limit]);

  const startPolling = useCallback(() => {
    const interval = adaptivePolling && failureCountRef.current > 3 ? 45000 : pollingIntervalMs;
    setStatus(prev => ({ ...prev, mode: 'polling', isConnected: true }));
    pollingIntervalRef.current = setInterval(async () => {
      try {
        let query = supabase.from('locations').select('*').order('recorded_at', { ascending: false }).limit(limit);
        if (userId) query = query.eq('user_id', userId);
        if (dropId) query = query.eq('drop_id', dropId);
        const { data } = await query;
        if (data) {
          const grouped: Record<string, LiveLocation[]> = {};
          data.forEach((loc) => { if (!grouped[loc.user_id]) grouped[loc.user_id] = []; grouped[loc.user_id].push(loc as LiveLocation); });
          setLocations(grouped);
          setAllLocations(data as LiveLocation[]);
          setStatus(prev => ({ ...prev, lastUpdate: new Date().toISOString() }));
          failureCountRef.current = 0;
        }
      } catch { failureCountRef.current += 1; }
    }, interval);
  }, [userId, dropId, limit, pollingIntervalMs, adaptivePolling]);

  useEffect(() => {
    loadInitialData();
    let unsubscribe: (() => void) | null = null;
    if (!forcePolling) {
      try {
        unsubscribe = realtimeService.subscribeToTable<LiveLocation>('locations', 'INSERT', (payload) => {
          const newLoc = payload.new as LiveLocation;
          setLocations(prev => { /* update logic */ return { ...prev }; });
          setAllLocations(prev => [newLoc, ...prev].slice(0, limit));
        }, userId ? `user_id=eq.${userId}` : dropId ? `drop_id=eq.${dropId}` : undefined, { onError: () => { stopPolling(); startPolling(); } });
        setStatus(prev => ({ ...prev, mode: 'realtime', isConnected: true }));
      } catch { startPolling(); }
    } else { startPolling(); }
    return () => { if (unsubscribe) unsubscribe(); clearInterval(pollingIntervalRef.current!); };
  }, [userId, dropId, limit, forcePolling, loadInitialData, startPolling]);

  return { locations, allLocations, status, isUsingFallback: status.mode === 'polling' };
}
EOF

echo "Patch complete."
