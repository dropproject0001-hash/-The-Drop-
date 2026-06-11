import { supabase } from '../lib/supabase';
import Dexie, { Table } from 'dexie';
import type { LiveLocation } from '../types/domain';

// ── Offline Queue (Dexie) ─────────────────────────────────────
interface QueuedLocation {
  id?: number;
  payload: any;
  timestamp: string;
  attempts: number;
}

class OutboxDB extends Dexie {
  outbox!: Table<QueuedLocation>;
  constructor() {
    super('location-outbox-v1');
    this.version(1).stores({ outbox: '++id, timestamp' });
  }
}
const outboxDB = new OutboxDB();

// ── Main Service ──────────────────────────────────────────────
class LocationBroadcastService {
  private watchId: number | null = null;
  private presenceChannel: any = null;
  private isBroadcasting = false;

  // Public state
  public queueSize = 0;
  public isOnline = navigator.onLine;

  private lastBroadcastTime = 0;
  private readonly THROTTLE_MS = 5000; // Minimum 5 seconds between broadcasts

  constructor() {
    this.setupNetworkListeners();
    this.startQueueFlusher();
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private async startQueueFlusher() {
    setInterval(() => this.flushQueue(), 15000); // every 15 seconds
  }

  // ── Core Broadcast ─────────────────────────────────────────
  async broadcast(payload: {
    lat: number;
    lng: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
    altitude?: number;
    drop_id?: string | null;
  }, force = false) {
    const now = Date.now();
    if (!force && now - this.lastBroadcastTime < this.THROTTLE_MS) {
      return { success: true, throttled: true };
    }

    this.lastBroadcastTime = now;
    try {
      const { error } = await supabase.functions.invoke('broadcast-location', {
        body: payload,
      });

      if (error) throw error;

      return { success: true };
    } catch (err: any) {
      // Queue if network-related or edge function fetch / connection error
      const errorMessage = err.message?.toLowerCase() || '';
      const isConnectionError =
        !navigator.onLine ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('network') ||
        errorMessage.includes('request') ||
        errorMessage.includes('edge function') ||
        err.name === 'FunctionsFetchError';

      if (isConnectionError) {
        await outboxDB.outbox.add({
          payload,
          timestamp: new Date().toISOString(),
          attempts: 0,
        });
        this.queueSize = (await outboxDB.outbox.count());
        console.log('[LocationBroadcastService] Telemetry offline or edge function unreachable. Queued in IndexDB.');
        return { success: false, queued: true };
      }

      throw err;
    }
  }

  // ── Start Live Tracking (GPS + Presence) ───────────────────
  private async getBatteryLevel(): Promise<number | null> {
    if ('getBattery' in navigator) {
      try {
        const battery: any = await (navigator as any).getBattery();
        return battery.level;
      } catch {
        return null;
      }
    }
    return null;
  }

  async startTracking(options: {
    onUpdate?: (location: LiveLocation) => void;
    onError?: (error: any) => void;
    dropId?: string | null;
  } = {}) {
    if (this.watchId !== null) return; // already tracking

    this.isBroadcasting = true;

    // Start presence
    await this.trackPresence(options.dropId);

    const batteryLevel = await this.getBatteryLevel();
    const highAccuracy = batteryLevel === null || batteryLevel > 0.2; // Throttle if < 20%

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          const payload = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            altitude: position.coords.altitude,
            drop_id: options.dropId ?? null,
          };

          const result = await this.broadcast(payload);

          if (result.success && options.onUpdate) {
            options.onUpdate({
              id: 0,
              user_id: '', // filled by server
              lat: payload.lat,
              lng: payload.lng,
              accuracy: payload.accuracy ?? null,
              heading: payload.heading ?? null,
              speed: payload.speed ?? null,
              altitude: payload.altitude ?? null,
              recorded_at: new Date().toISOString(),
              drop_id: payload.drop_id ?? null,
            });
          }
        } catch (err) {
          console.error('[LocationBroadcastService] Uncaught error during telemetry tracking execution:', err);
        }
      },
      (error) => {
        console.error('[LocationBroadcastService] GPS error:', error);
        if (options.onError) options.onError(error);
      },
      { 
        enableHighAccuracy: highAccuracy,
        maximumAge: highAccuracy ? 10000 : 30000,
        timeout: 15000,
      }
    );
  }

  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.untrackPresence();
    this.isBroadcasting = false;
  }

  // ── Presence ───────────────────────────────────────────────
  private async trackPresence(dropId?: string | null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch user profile for username and role to support debug pane representation
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, alias, role')
      .eq('id', user.id)
      .maybeSingle();

    const username = profile?.username || profile?.alias || user.email?.split('@')[0] || 'Unknown Agent';
    const role = profile?.role || 'agent';

    this.presenceChannel = supabase.channel('field-agents-presence');

    await this.presenceChannel
      .on('presence', { event: 'sync' }, () => {})
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await this.presenceChannel.track({
            user_id: user.id,
            drop_id: dropId,
            username,
            role,
            timestamp: new Date().toISOString(),
          });
        }
      });
  }

  private async untrackPresence() {
    if (this.presenceChannel) {
      await this.presenceChannel.untrack();
      await supabase.removeChannel(this.presenceChannel);
      this.presenceChannel = null;
    }
  }

  // ── Offline Queue Flush ────────────────────────────────────
  public async clearQueue() {
    await outboxDB.outbox.clear();
    this.queueSize = 0;
  }

  public async flushQueue() {
    if (!navigator.onLine) return;

    const items = await outboxDB.outbox.orderBy('timestamp').toArray();

    for (const item of items) {
      try {
        const { error } = await supabase.functions.invoke('broadcast-location', {
          body: item.payload,
        });

        if (!error) {
          await outboxDB.outbox.delete(item.id!);
        } else {
          await outboxDB.outbox.update(item.id!, {
            attempts: item.attempts + 1,
          });
        }
      } catch {
        // keep in queue
      }
    }

    this.queueSize = await outboxDB.outbox.count();
  }

  isCurrentlyBroadcasting() {
    return this.isBroadcasting;
  }
}

// ── Export Singleton ────────────────────────────────────────
export const locationBroadcastService = new LocationBroadcastService();
