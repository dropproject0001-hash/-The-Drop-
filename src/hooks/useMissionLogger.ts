import { useEffect, useRef } from 'react';
import { useDrops } from './useDrops';
import { calculateDistance } from '@/utils/calculateDistance';

interface MissionLog {
  timestamp: string;
  lat: number;
  lng: number;
  ambientLight: number | null;
  dropId: string;
  distanceM: number;
}

export function useMissionLogger() {
  const { drops } = useDrops();
  const currentLocationRef = useRef<{lat: number, lng: number} | null>(null);
  const ambientLightRef = useRef<number | null>(null);
  const loggedDropsRef = useRef<Set<string>>(new Set());
  const dropsRef = useRef(drops);

  useEffect(() => {
    dropsRef.current = drops;
    checkProximity(); // Check proximity whenever drops update as well
  }, [drops]);

  useEffect(() => {
    // Attempt to track ambient light if supported.

    // In many browsers this is behind a feature flag or requires secure context.
    if ('AmbientLightSensor' in window) {
      try {
        const sensor = new (window as any).AmbientLightSensor();
        sensor.onreading = () => {
          ambientLightRef.current = sensor.illuminance;
        };
        sensor.onerror = (event: any) => {
          console.warn('[MissionLogger] AmbientLightSensor error:', event.error.name, event.error.message);
        };
        sensor.start();
        return () => sensor.stop();
      } catch (err) {
        console.warn('[MissionLogger] AmbientLightSensor initialization failed:', err);
      }
    } else {
      // Setup a mock or just leave it null if sensor not available
      const interval = setInterval(() => {
        // Just mock some varying light levels for ambient tracking diagnostic if sensor is not present
        ambientLightRef.current = Math.floor(Math.random() * 50) + 200; 
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        currentLocationRef.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        checkProximity();
      },
      (err) => {
        if (err.code === 1) {
          console.warn('[MissionLogger] Geolocation permission denied or blocked by policy.');
        } else {
          console.error(`[MissionLogger] GPS Error [${err.code}]:`, err.message);
        }
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const checkProximity = () => {
    if (!currentLocationRef.current || !dropsRef.current.length) return;

    dropsRef.current.forEach(drop => {
      if (drop.status !== 'active') return;

      const distanceKm = calculateDistance(
        currentLocationRef.current!.lat,
        currentLocationRef.current!.lng,
        drop.lat,
        drop.lng
      );
      const distanceM = distanceKm * 1000;

      // Define "mission area" as <= 50 meters
      if (distanceM <= 50 && !loggedDropsRef.current.has(drop.id)) {
        logMissionEntry(drop.id, distanceM);
      } else if (distanceM > 100 && loggedDropsRef.current.has(drop.id)) {
        // Reset if they leave the area so it can trigger again later if needed
        loggedDropsRef.current.delete(drop.id);
      }
    });
  };

  const logMissionEntry = (dropId: string, distanceM: number) => {
    if (!currentLocationRef.current) return;
    
    // Log to local history buffer
    const logEntry: MissionLog = {
      timestamp: new Date().toISOString(),
      lat: currentLocationRef.current.lat,
      lng: currentLocationRef.current.lng,
      ambientLight: ambientLightRef.current,
      dropId,
      distanceM: Math.round(distanceM)
    };

    try {
      const historyUrl = localStorage.getItem('mission_area_logs');
      const history: MissionLog[] = historyUrl ? JSON.parse(historyUrl) : [];
      history.push(logEntry);
      
      // Keep buffer size reasonable (last 100 logs)
      if (history.length > 100) history.shift();
      
      localStorage.setItem('mission_area_logs', JSON.stringify(history));
      console.log(`[MissionLogger] Entered mission area for Drop ${dropId}. Environment data recorded.`);
      
      // Also write to session storage so we can quickly verify it in a diagnostics tab if needed
      sessionStorage.setItem('last_mission_log', JSON.stringify(logEntry));
    } catch (e) {
      console.error('[MissionLogger] Error writing to history buffer:', e);
    }
    
    loggedDropsRef.current.add(dropId);
  };
}
