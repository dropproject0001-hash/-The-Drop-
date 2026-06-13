import { useEffect, useRef } from 'react';
import { realtimeService } from '@/services/supabase/realtime.service';

interface UseRealtimeOptions<T extends { [key: string]: any } = any> {
  table: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;                    // e.g. "status=eq.active"
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (payload: T) => void;
  enabled?: boolean;
}

export function useRealtime<T extends { [key: string]: any } = any>({
  table,
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions<T>) {
  // Use refs for callbacks to avoid re-subscription loops when anonymous functions are passed
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);

  useEffect(() => {
    onInsertRef.current = onInsert;
    onUpdateRef.current = onUpdate;
    onDeleteRef.current = onDelete;
  }, [onInsert, onUpdate, onDelete]);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = realtimeService.subscribeToTable<T>(
      table,
      event as any,
      (payload) => {
        const newRecord = (payload.new ?? payload.old) as T;

        if (payload.eventType === 'INSERT' && onInsertRef.current) onInsertRef.current(newRecord);
        if (payload.eventType === 'UPDATE' && onUpdateRef.current) onUpdateRef.current(newRecord);
        if (payload.eventType === 'DELETE' && onDeleteRef.current) onDeleteRef.current(newRecord);
      },
      filter
    );

    return () => unsubscribe();
  }, [table, event, filter, enabled]);

  return {
    // Unsubscribe is handled by useEffect cleanup, but we can expose it if needed
  };
}
