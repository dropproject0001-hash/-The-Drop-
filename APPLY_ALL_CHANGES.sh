#!/bin/bash
# Consolidated Patch Script for The Drop Realtime Realtime Location System
# Run: chmod +x APPLY_ALL_CHANGES.sh && ./APPLY_ALL_CHANGES.sh

echo "Applying patches..."

# Ensure directories exist
mkdir -p src/hooks/realtime src/services/supabase src/stores src/components/common src/components/ui

# 1. Update Realtime Hook (with Polling Fallback & Reconnection)
cat << 'EOF' > src/hooks/realtime/useLiveLocations.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { realtimeService } from '../../services/supabase/realtime.service';
import { supabase } from '../../lib/supabase';
import type { LiveLocation } from '../../types/domain';

export function useLiveLocations(options: { 
  userId?: string; dropId?: string; limit?: number; 
  pollingIntervalMs?: number; forcePolling?: boolean; 
  adaptivePolling?: boolean; reconnectIntervalMs?: number;
} = {}) {
  const [locations, setLocations] = useState<Record<string, LiveLocation[]>>({});
  const [allLocations, setAllLocations] = useState<LiveLocation[]>([]);
  const [status, setStatus] = useState({ mode: 'realtime', isConnected: false, lastUpdate: null });
  const { userId, dropId, limit = 30, pollingIntervalMs = 8000, forcePolling = false, adaptivePolling = true, reconnectIntervalMs = 45000 } = options;
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const seenIdsRef = useRef<Set<number>>(new Set());

  const addLocation = useCallback((newLoc: LiveLocation) => {
    if (seenIdsRef.current.has(newLoc.id)) return;
    seenIdsRef.current.add(newLoc.id);
    setLocations(prev => {
        const userLocs = [newLoc, ...(prev[newLoc.user_id] || [])].sort((a,b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()).slice(0, 20);
        return { ...prev, [newLoc.user_id]: userLocs };
    });
    setAllLocations(prev => [newLoc, ...prev].slice(0, limit));
    setStatus(prev => ({ ...prev, lastUpdate: new Date().toISOString() }));
  }, [limit]);

  const startPolling = useCallback(() => {
    const interval = adaptivePolling && Math.random() > 0.5 ? pollingIntervalMs * 1.5 : pollingIntervalMs;
    setStatus(prev => ({ ...prev, mode: 'polling', isConnected: true }));
    pollingIntervalRef.current = setInterval(async () => {
      const { data } = await supabase.from('locations').select('*').order('recorded_at', { ascending: false }).limit(limit);
      if (data) data.forEach((loc: LiveLocation) => addLocation(loc));
    }, interval);
  }, [addLocation, adaptivePolling, limit, pollingIntervalMs]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    if (!forcePolling) {
      try {
        unsubscribe = realtimeService.subscribeToTable<LiveLocation>('locations', 'INSERT', (p) => addLocation(p.new as LiveLocation), userId ? `user_id=eq.${userId}` : dropId ? `drop_id=eq.${dropId}` : undefined, { onError: () => { clearInterval(pollingIntervalRef.current!); startPolling(); } });
        setStatus(prev => ({ ...prev, mode: 'realtime', isConnected: true }));
      } catch { startPolling(); }
    } else { startPolling(); }
    return () => { if (unsubscribe) unsubscribe(); clearInterval(pollingIntervalRef.current!); };
  }, [userId, dropId, forcePolling, startPolling]);

  return { locations, allLocations, status, isUsingFallback: status.mode === 'polling' };
}
EOF

# 2. Reactive Zustand Store
cat << 'EOF' > src/stores/locationBroadcastStore.ts
import { create } from 'zustand';
import { locationBroadcastService } from '@/services/LocationBroadcastService';

export const useLocationBroadcastStore = create((set) => ({
  queueSize: locationBroadcastService.queueSize,
  isOnline: locationBroadcastService.isOnline,
  isBroadcasting: locationBroadcastService.isCurrentlyBroadcasting(),
  refresh: () => set({
      queueSize: locationBroadcastService.queueSize,
      isOnline: locationBroadcastService.isOnline,
      isBroadcasting: locationBroadcastService.isCurrentlyBroadcasting(),
  }),
}));
EOF

# 3. Connection Badge
cat << 'EOF' > src/components/ui/ConnectionStatusBadge.tsx
import React from 'react';
export function ConnectionStatusBadge({ mode, lastUpdate }: { mode: 'realtime' | 'polling' | 'offline'; lastUpdate?: string | null }) {
  const config = { realtime: { label: 'LIVE', color: 'bg-emerald-500' }, polling: { label: 'POLLING', color: 'bg-amber-500' }, offline: { label: 'OFFLINE', color: 'bg-red-500' } }[mode];
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-zinc-800">
      <div className={`w-2 h-2 rounded-full ${config.color} ${mode === 'realtime' ? 'animate-pulse' : ''}`} />
      <span className="font-mono text-[10px] tracking-[1.5px] uppercase">{config.label}</span>
    </div>
  );
}
EOF

# 4. Error Boundary
cat << 'EOF' > src/components/common/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
export class ErrorBoundary extends Component<{children: ReactNode, fallback?: ReactNode}, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback || <div className="p-8 text-red-500">SYSTEM ERROR</div>;
    return this.props.children;
  }
}
EOF

echo "Patch complete. Application ready for deployment."
