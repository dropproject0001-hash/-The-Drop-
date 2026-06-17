import { supabase } from '../lib/supabase';
import type { LiveLocation } from '../types/domain';
import { LocationOutbox } from './LocationOutbox';

// ── Main Service ──────────────────────────────────────────────
class LocationBroadcastService {
  private watchId: number | null = null;
  private presenceChannel: any = null;
  private isBroadcasting = false;

  // Track active options for live updating
  private activeOptions: {
    onUpdate?: (location: LiveLocation) => void;
    onError?: (error: any) => void;
    dropId?: string | null;
  } | null = null;

  // Public state
  public isOnline = navigator.onLine;

  private lastBroadcastTime = 0;
  private lastQueueFlushTime = 0;

  private get throttleMs() {
    try {
      const lowData = localStorage.getItem('drop_low_data_mode') === 'true';
      return lowData ? 30000 : 5000; // Minimum 30 seconds in Low Data Mode, 5 seconds normally
    } catch {
      return 5000;
    }
  }

  private get queueFlushIntervalMs() {
    try {
      const lowData = localStorage.getItem('drop_low_data_mode') === 'true';
      return lowData ? 60000 : 15000; // Flush queue once every 60 seconds in Low Data Mode, 15 seconds normally
    } catch {
      return 15000;
    }
  }

  constructor() {
    this.setupNetworkListeners();
    this.startQueueFlusher();
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      const stealthMode = localStorage.getItem('setting_stealth_mode') === 'true';
      if (!stealthMode) {
        this.flushQueue();
      }
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private async startQueueFlusher() {
    setInterval(() => {
      try {
        const stealthMode = localStorage.getItem('setting_stealth_mode') === 'true';
        if (stealthMode) return;
      } catch (err) {}

      const now = Date.now();
      if (now - this.lastQueueFlushTime >= this.queueFlushIntervalMs) {
        this.lastQueueFlushTime = now;
        this.flushQueue();
      }
    }, 5000); // Check threshold every 5 seconds
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
    if (!force && now - this.lastBroadcastTime < this.throttleMs) {
      return { success: true, throttled: true };
    }

    this.lastBroadcastTime = now;
    
    // Stealth Mode Intercept
    try {
      const stealthMode = localStorage.getItem('setting_stealth_mode') === 'true';
      if (stealthMode && !force) {
        await LocationOutbox.queue(payload);
        console.log('[LocationBroadcastService] Stealth Mode ACTIVE. Queued telemetry locally.');
        return { success: false, queued: true };
      }
    } catch {}

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
        await LocationOutbox.queue(payload);
        console.log('[LocationBroadcastService] Telemetry offline or edge function unreachable. Queued in LocationOutbox.');
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

    this.activeOptions = options;
    this.isBroadcasting = true;

    // Start presence
    await this.trackPresence(options.dropId);

    const lowData = localStorage.getItem('drop_low_data_mode') === 'true';
    const batteryLevel = await this.getBatteryLevel();
    const highAccuracy = !lowData && (batteryLevel === null || batteryLevel > 0.2); // Core: disable high accuracy in Low Data Mode

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
        maximumAge: highAccuracy ? 10000 : (lowData ? 60000 : 30000),
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
    this.activeOptions = null;
  }

  async updateTrackingMode() {
    if (this.watchId === null) return;

    console.log('[LocationBroadcastService] Modifying location settings. Restarting location watcher...');
    const currentOptions = this.activeOptions;

    // Fast clear of current geolocation watcher
    navigator.geolocation.clearWatch(this.watchId);
    this.watchId = null;

    const lowData = localStorage.getItem('drop_low_data_mode') === 'true';
    const batteryLevel = await this.getBatteryLevel();
    const highAccuracy = !lowData && (batteryLevel === null || batteryLevel > 0.2);

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
            drop_id: currentOptions?.dropId ?? null,
          };

          const result = await this.broadcast(payload);

          if (result.success && currentOptions?.onUpdate) {
            currentOptions.onUpdate({
              id: 0,
              user_id: '',
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
        if (currentOptions?.onError) currentOptions.onError(error);
      },
      { 
        enableHighAccuracy: highAccuracy,
        maximumAge: highAccuracy ? 10000 : (lowData ? 60000 : 30000),
        timeout: 15000,
      }
    );
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

    const trackData = {
      user_id: user.id,
      drop_id: dropId,
      username,
      role,
      timestamp: new Date().toISOString(),
    };

    try {
      // In JS, sometimes the state is represented differently. Check if track is available or just try it.
      if (this.presenceChannel.state === 'joined') {
        await this.presenceChannel.track(trackData);
      } else {
        this.presenceChannel.subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await this.presenceChannel.track(trackData);
          }
        });
      }
    } catch (err) {
      console.warn('Error setting up presence tracking:', err);
    }
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
    await LocationOutbox.flush();
  }

  isCurrentlyBroadcasting() {
    return this.isBroadcasting;
  }
}

// ── Export Singleton ────────────────────────────────────────
export const locationBroadcastService = new LocationBroadcastService();
