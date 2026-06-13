/**
 * @file src/services/LocationBroadcastService.ts
 *
 * Refactored to consolidate outbox management into LocationOutbox service.
 * Removed internal OutboxDB to prevent database divergence.
 */
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { LiveLocation } from '../types/domain';
import { LocationOutbox } from './LocationOutbox';

// ── Main Service ──────────────────────────────────────────────
class LocationBroadcastService {
  private watchId: number | null = null;
  private presenceChannel: RealtimeChannel | null = null;
  private isBroadcasting = false;

  // Public state
  public queueSize = 0;
  public isOnline = navigator.onLine;

  private lastBroadcastTime = 0;
  private readonly THROTTLE_MS = 5000; // Minimum 5 seconds between broadcasts

  constructor() {
    this.setupNetworkListeners();
    this.startQueueFlusher();

    // Sync queue size with LocationOutbox
    LocationOutbox.subscribe((state) => {
      this.queueSize = state.queueSize;
    });
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      const isConnectionError =
        !navigator.onLine ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('network') ||
        errorMessage.includes('request') ||
        errorMessage.includes('edge function') ||
        (err as any).name === 'FunctionsFetchError';

      if (isConnectionError) {
        await LocationOutbox.queue(payload as unknown as Record<string, unknown>);
        console.log('[LocationBroadcastService] Telemetry offline or edge function unreachable. Queued in IndexDB via LocationOutbox.');
        return { success: false, queued: true };
      }

      throw err;
    }
  }

  // ── Start Live Tracking (GPS + Presence) ───────────────────
  private async getBatteryLevel(): Promise<number | null> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return battery.level;
      } catch {
        return null;
      }
    }
    return null;
  }

  async startTracking(options: {
    onUpdate?: (location: LiveLocation) => void;
    onError?: (error: GeolocationPositionError) => void;
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
            heading: position.coords.heading ?? undefined,
            speed: position.coords.speed ?? undefined,
            altitude: position.coords.altitude ?? undefined,
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
        if (status === 'SUBSCRIBED' && this.presenceChannel) {
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
    await LocationOutbox.clear();
  }

  public async flushQueue() {
    if (!navigator.onLine) return;
    try {
      await LocationOutbox.flush();
    } catch (err) {
      console.warn('[LocationBroadcastService] Flush failed:', err);
    }
  }

  isCurrentlyBroadcasting() {
    return this.isBroadcasting;
  }
}

// ── Export Singleton ────────────────────────────────────────
export const locationBroadcastService = new LocationBroadcastService();
