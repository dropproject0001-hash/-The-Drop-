import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

type SubscriptionCallback<T = any> = (payload: RealtimePostgresChangesPayload<T>) => void;

interface SubscriptionOptions {
  optimisticUpdate?: boolean;
  onError?: (error: any) => void;
}

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

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

    // Reuse existing channel if already subscribed
    if (this.channels.has(channelName)) {
      const existingChannel = this.channels.get(channelName)!;
      existingChannel.on('postgres_changes', { event, schema: 'public', table, filter }, callback as any);
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase.channel(channelName);

    channel
      .on('postgres_changes', { event, schema: 'public', table, filter }, (payload) => {
        try {
          callback(payload as RealtimePostgresChangesPayload<T>);
        } catch (error) {
          console.error(`[Realtime] Error in callback for ${channelName}:`, error);
          if (options.onError) options.onError(error);
        }
      })
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] ✅ Subscribed to ${channelName}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`[Realtime] ❌ Error on ${channelName}:`, err);
          // Clean up and eject channel from map so a future subscription attempt can start fresh
          supabase.removeChannel(channel);
          this.channels.delete(channelName);
          if (options.onError) options.onError(err || new Error(`Channel error or timeout on ${channelName}`));
        }
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  private unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`[Realtime] Unsubscribed from ${channelName}`);
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
      console.log(`[Realtime] Unsubscribed from ${name}`);
    });
    this.channels.clear();
  }
}

export const realtimeService = new RealtimeService();
