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
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] ✅ Subscribed to ${channelName}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error(`[Realtime] ❌ ${status} on ${channelName}:`, err);
          // Only unsubscribe if it's still the same entry
          const current = this.channels.get(channelName);
          if (current && current.channel === channel) {
            this.unsubscribe(channelName);
          }
          if (options.onError) options.onError(err || new Error(`${status} on ${channelName}`));
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
      supabase.removeChannel(entry.channel);
      this.channels.delete(channelName);
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
