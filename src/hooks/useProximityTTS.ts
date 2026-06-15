// src/hooks/useProximityTTS.ts
import { useEffect, useRef } from 'react';
import { useTTS } from './useTTS';
import { useDrops } from './useDrops';
import { calculateDistance } from '@/utils/calculateDistance';

export function useProximityTTS() {
  const { speak } = useTTS();
  const { drops } = useDrops();
  const lastAlertRef = useRef<Record<string, number>>({});
  const currentLocationRef = useRef<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Get initial position and watch for updates
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        currentLocationRef.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
      },
      (err) => {
        if (err.code === 1) {
          console.warn('[useProximityTTS] Geolocation permission denied or blocked by policy.');
        } else {
          console.error(`[useProximityTTS] GPS Error [${err.code}]:`, err.message);
        }
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const checkProximity = () => {
      if (!currentLocationRef.current || !drops.length) return;

      drops.forEach(drop => {
        if (drop.status !== 'active') return;

        const distanceKm = calculateDistance(
          currentLocationRef.current!.lat,
          currentLocationRef.current!.lng,
          drop.lat,
          drop.lng
        );
        const distanceM = distanceKm * 1000;

        const now = Date.now();
        const lastAlert = lastAlertRef.current[drop.id] || 0;

        // Throttle to 1 minute per drop unless distance tier changes
        if (now - lastAlert > 60000) {
          let message = '';
          if (distanceM < 50) {
            message = "Proximity alert: Drop location very close. Prepare for retrieval.";
          } else if (distanceM < 200) {
            message = `Drop approaching. Approximately ${Math.round(distanceM)} meters away.`;
          }

          if (message) {
            console.log(`🔊 [useProximityTTS] Triggering alert for drop ${drop.id} at ${distanceM}m`);
            speak(message);
            lastAlertRef.current[drop.id] = now;
          }
        }
      });
    };

    const interval = setInterval(checkProximity, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [drops, speak]);
}
