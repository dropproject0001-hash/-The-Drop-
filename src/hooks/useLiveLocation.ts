import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useLiveLocation(dropId: string, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || !dropId) return;

    let watchId: number;

    const sendLocation = async (position: GeolocationPosition) => {
      await supabase.from('drop_locations').insert({
        drop_id: dropId,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: new Date().toISOString(),
      });
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        sendLocation,
        (error) => console.error("Location error:", error),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [dropId, enabled]);
}
