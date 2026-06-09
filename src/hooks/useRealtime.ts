import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeOptions<T = any> {
  table: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;                    // e.g. "status=eq.active"
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (payload: T) => void;
  enabled?: boolean;
}

export function useRealtime<T = any>({
  table,
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const channelName = `realtime:${table}:${filter || 'all'}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          const newRecord = (payload.new ?? payload.old) as T;

          if (payload.eventType === 'INSERT' && onInsert) onInsert(newRecord);
          if (payload.eventType === 'UPDATE' && onUpdate) onUpdate(newRecord);
          if (payload.eventType === 'DELETE' && onDelete) onDelete(newRecord);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Subscribed to ${channelName}`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(`[Realtime] Error on ${channelName}`);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, event, filter, enabled, onInsert, onUpdate, onDelete]);

  return {
    unsubscribe: () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    },
  };
}
