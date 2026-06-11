import { useEffect, useState, useRef } from 'react';
import * as turf from '@turf/turf';

interface GeofencingOptions {
  userCoords: [number, number] | null;
  zoneCenter: [number, number];
  radiusMeters: number;
}

export function useGeofencing({ userCoords, zoneCenter, radiusMeters }: GeofencingOptions) {
  const [isInside, setIsInside] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const wasInsideRef = useRef(false);

  useEffect(() => {
    if (!userCoords) return;

    // Turf uses [longitude, latitude]
    const from = turf.point([userCoords[1], userCoords[0]]);
    const to = turf.point([zoneCenter[1], zoneCenter[0]]);
    
    // Calculate distance in meters
    const distanceMeter = turf.distance(from, to, { units: 'meters' });
    const currentlyInside = distanceMeter <= radiusMeters;

    // Trigger alert only on entry
    if (currentlyInside && !wasInsideRef.current) {
      setAlertVisible(true);
    }

    setIsInside(currentlyInside);
    wasInsideRef.current = currentlyInside;
  }, [userCoords, zoneCenter, radiusMeters]);

  return { isInside, alertVisible, closeAlert: () => setAlertVisible(false) };
}
