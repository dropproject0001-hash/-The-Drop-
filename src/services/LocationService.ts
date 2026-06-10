/**
 * LocationService.ts
 * Browser-based tactical geolocation tracking for field operations.
 * 
 * DESIGN PRINCIPLE: Resilience and Precision.
 * Manages continuous tracking, battery-optimized updates, and 
 * signal integrity monitoring.
 */

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export type LocationErrorCallback = (error: GeolocationPositionError) => void;
export type LocationUpdateCallback = (location: LocationCoords) => void;

class LocationService {
  private watchId: number | null = null;
  private options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  /**
   * Retrieves the current tactical coordinates.
   */
  async getCurrentPosition(): Promise<LocationCoords> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GEOLOCATION_NOT_SUPPORTED'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(this.mapPosition(position)),
        (error) => reject(this.handleError(error)),
        this.options
      );
    });
  }

  /**
   * Starts a continuous tactical tracking session.
   */
  startTracking(onUpdate: LocationUpdateCallback, onError?: LocationErrorCallback): void {
    if (this.watchId !== null) return;

    if (!navigator.geolocation) {
      if (onError) onError({ code: 0, message: 'GEOLOCATION_NOT_SUPPORTED' } as GeolocationPositionError);
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => onUpdate(this.mapPosition(position)),
      (error) => {
        const tacticalError = this.handleError(error);
        if (onError) onError(error);
        console.error(` [LocationService] Protocol Failure: ${tacticalError}`);
      },
      this.options
    );

    console.log(' [LocationService] Tactical tracking engaged');
  }

  /**
   * Disengages the current tracking session.
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log(' [LocationService] Tactical tracking disengaged');
    }
  }

  /**
   * Checks for active location permissions.
   */
  async checkPermissions(): Promise<PermissionState> {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      return permissionStatus.state;
    } catch (error) {
      return 'prompt';
    }
  }

  private mapPosition(position: GeolocationPosition): LocationCoords {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp
    };
  }

  private handleError(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'SIGNAL_BLOCKED: PERMISSION_DENIED';
      case error.POSITION_UNAVAILABLE:
        return 'SIGNAL_LOST: POSITION_UNAVAILABLE';
      case error.TIMEOUT:
        return 'SIGNAL_TIMEOUT: REQUEST_EXPIRED';
      default:
        return 'SIGNAL_INTERRUPT: UNKNOWN_ERROR';
    }
  }
}

export const locationService = new LocationService();
