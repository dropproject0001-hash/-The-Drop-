import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

type SubscriptionCallback<T = any> = (payload: RealtimePostgresChangesPayload<T>) => void;

interface SubscriptionOptions {
  optimisticUpdate?: boolean;
  onError?: (error: any) => void;
  maxRetries?: number;
}

class RealtimeService {
  private channels: Map<string, {
    channel: RealtimeChannel;
    callbacks: Set<SubscriptionCallback>;
  }> = new Map();
  private retries: Map<string, number> = new Map();

  /**
   * Subscribe to table changes
   */
  subscribeToTable<T>(
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: SubscriptionCallback<T>,
    filter?: string,
    options: SubscriptionOptions = {}
  ): () => void {
    const channelName = `${table}-${event}-${filter || 'all'}`;

    // If channel exists, just add the callback
    const existing = this.channels.get(channelName);
    if (existing) {
      existing.callbacks.add(callback);
      return () => {
        existing.callbacks.delete(callback);
        if (existing.callbacks.size === 0) {
          this.unsubscribe(channelName);
        }
      };
    }

    // Create a new entry immediately to prevent race conditions during synchronous setup
    const callbacks = new Set<SubscriptionCallback>();
    callbacks.add(callback);
    
    const channel = supabase.channel(channelName);
    this.channels.set(channelName, { channel, callbacks });
    this.retries.set(channelName, 0);

    channel
      .on('postgres_changes', { event, schema: 'public', table, filter }, (payload) => {
        try {
          const currentEntry = this.channels.get(channelName);
          if (currentEntry) {
            // Use a unique set to prevents potential duplicates if multiple .on calls somehow occurred
            currentEntry.callbacks.forEach(cb => {
              try {
                cb(payload as RealtimePostgresChangesPayload<T>);
              } catch (e) {
                console.error(`[Realtime] Error in shared callback for ${channelName}:`, e);
              }
            });
          }
        } catch (error) {
          console.error(`[Realtime] Fatal error in callback dispatcher for ${channelName}:`, error);
        }
      })
      .subscribe((status, err) => {
        const isActive = this.channels.has(channelName);
        if (!isActive) {
          // Channel was deleted intentionally via unsubscribe cleanup. Skip errors/warnings!
          return;
        }

        if (status === 'SUBSCRIBED') {
          this.retries.set(channelName, 0);
          console.log(`[Realtime] ✅ Subscribed to ${channelName}`);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          const currentRetries = this.retries.get(channelName) || 0;
          const nextRetries = currentRetries + 1;
          this.retries.set(channelName, nextRetries);

          const maxLimit = options.maxRetries ?? 5;
          
          if (nextRetries >= maxLimit) {
            console.error(`[Realtime] 🚨 Hard failure on ${channelName} after ${nextRetries} failed attempts. Dropping to fallback mechanism.`, err);
            if (options.onError) {
              options.onError(err || new Error(`${status} on ${channelName} after ${nextRetries} consecutive failures`));
            }
          } else {
            console.warn(`[Realtime] ⚠️ ${status} on ${channelName} (Attempt ${nextRetries}/${maxLimit}). Supabase will attempt auto-reconnect:`, err);
          }
        }
      });

    return () => {
      const entry = this.channels.get(channelName);
      if (entry) {
        entry.callbacks.delete(callback);
        if (entry.callbacks.size === 0) {
          this.unsubscribe(channelName);
        }
      }
    };
  }

  private unsubscribe(channelName: string) {
    const entry = this.channels.get(channelName);
    if (entry) {
      this.channels.delete(channelName); // Delete first to prevent synchronous CLOSED triggering unsubscribe again
      this.retries.delete(channelName);  // Clear retry counter
      supabase.removeChannel(entry.channel);
      console.log(`[Realtime] Unsubscribed from ${channelName}`);
    }
  }

  unsubscribeAll() {
    this.channels.forEach((_entry, name) => {
      this.unsubscribe(name);
    });
    this.channels.clear();
  }
}

export const realtimeService = new RealtimeService();
