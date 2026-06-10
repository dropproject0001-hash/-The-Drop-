/**
 * @file src/hooks/realtime/useLiveDrops.ts
 *
 * FIXED:
 * - Added initial SELECT on mount (was only realtime → empty on load)
 * - Status aligned to DB enum ('active' | 'claimed' | 'expired')
 * - executeDrop now uses valid transition or generic update
 */
import { useEffect, useState, useCallback } from "react";
import { realtimeService } from "../../services/supabase/realtime.service";
import type { Drop } from "../../types/domain";
import { supabase } from "../../lib/supabase";

export function useLiveDrops() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [useFallbackPolling, setUseFallbackPolling] = useState(false);

  const loadInitial = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("drops")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setDrops((data as Drop[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();

    const unsubscribe = realtimeService.subscribeToTable<Drop>(
      "drops",
      "*",
      (payload) => {
        if (payload.eventType === "INSERT") {
          setDrops((prev) => [payload.new as Drop, ...prev]);
        }
        if (payload.eventType === "UPDATE") {
          setDrops((prev) =>
            prev.map((d) =>
              d.id === (payload.new as Drop).id ? (payload.new as Drop) : d
            )
          );
        }
      },
      undefined,
      {
        onError: (err) => {
          console.warn('[useLiveDrops] Realtime channel transport failure or error occurred. Triggering background polling fallback:', err);
          setError(err?.message || "Realtime error");
          setUseFallbackPolling(true);
        },
      }
    );

    return () => unsubscribe();
  }, [loadInitial]);

  // Backup polling fallback when websocket transport is failing
  useEffect(() => {
    if (!useFallbackPolling) return;

    const interval = setInterval(() => {
      loadInitial(true); // Silent refresh
    }, 8000);

    return () => clearInterval(interval);
  }, [useFallbackPolling, loadInitial]);

  const updateDropStatus = async (dropId: string, status: Drop["status"]) => {
    try {
      const { error: updateError } = await supabase
        .from("drops")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", dropId);

      if (updateError) throw updateError;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { drops, error, loading, refresh: loadInitial, updateDropStatus };
}
