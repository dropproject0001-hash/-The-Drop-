import { useEffect, useState } from "react";
import { realtimeService } from "../../services/supabase/realtime.service";
import { Drop } from "../../types";
import { supabase } from "../../lib/supabase";

export function useLiveDrops() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Optimistic update helper
  const updateDropOptimistically = (dropId: string, updates: Partial<Drop>) => {
    setDrops((prev) =>
      prev.map((drop) => (drop.id === dropId ? { ...drop, ...updates } : drop)),
    );
  };

  useEffect(() => {
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
              d.id === (payload.new as Drop).id ? (payload.new as Drop) : d,
            ),
          );
        }
      },
      undefined,
      {
        onError: (err) => setError(err?.message || "Realtime error"),
      },
    );

    return () => unsubscribe();
  }, []);

  // Helper to execute drop with optimistic UI
  const executeDrop = async (dropId: string) => {
    // Optimistic update
    updateDropOptimistically(dropId, { status: "executed" });

    try {
      const { error } = await supabase
        .from("drops")
        .update({
          status: "executed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", dropId);

      if (error) throw error;
    } catch (err: any) {
      // Rollback on error
      updateDropOptimistically(dropId, { status: "active" });
      setError(err.message);
      throw err;
    }
  };

  return { drops, error, executeDrop };
}
