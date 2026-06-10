import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { locationService, LocationCoords } from '../services/LocationService';

export function useLiveLocation(dropId: string, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || !dropId) return;

    const sendLocation = async (coords: LocationCoords) => {
      try {
        const { error } = await supabase.from('drop_locations').insert({
          drop_id: dropId,
          lat: coords.latitude,
          lng: coords.longitude,
          timestamp: new Date().toISOString(),
        });
        
        if (error) console.error(" [UAV_UPLINK] Transmission Interrupted:", error.message);
      } catch (err) {
        console.error(" [UAV_UPLINK] Critical Failure");
      }
    };

    locationService.startTracking(
      sendLocation,
      (error) => console.error(" [GPS_SIG_LOST] Protocol Failure:", error.message)
    );

    return () => {
      locationService.stopTracking();
    };
  }, [dropId, enabled]);
}
