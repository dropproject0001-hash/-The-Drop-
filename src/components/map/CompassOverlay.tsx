import React, { useState, useEffect, useMemo } from 'react';
import { Navigation } from 'lucide-react';
import type { Drop } from '@/types/domain';
import { tacticalVibration } from '@/lib/vibration';

interface CompassOverlayProps {
  userPosition: [number, number] | null;
  targetDrop: Drop | null;
}

// Math to calculate bearing between two coordinates
function getBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const l1 = (lat1 * Math.PI) / 180;
  const l2 = (lat2 * Math.PI) / 180;
  
  const y = Math.sin(dLon) * Math.cos(l2);
  const x = Math.cos(l1) * Math.sin(l2) - Math.sin(l1) * Math.cos(l2) * Math.cos(dLon);
  
  let brng = Math.atan2(y, x);
  brng = (brng * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Math to calculate distance between two coordinates in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function CompassOverlay({ userPosition, targetDrop }: CompassOverlayProps) {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    typeof (DeviceOrientationEvent as any)?.requestPermission === 'function' ? null : true
  );

  useEffect(() => {
    if (permissionGranted !== true) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading = null;
      // iOS
      if ('webkitCompassHeading' in e) {
        heading = (e as any).webkitCompassHeading;
      } 
      // Android / Standard
      else if (e.alpha !== null) {
        heading = 360 - e.alpha; // approximate heading depending on OS version
      }

      if (heading !== null) {
        setDeviceHeading(heading);
      }
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation as any);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionGranted]);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setPermissionGranted(true);
        } else {
          setPermissionGranted(false);
        }
      } catch (error) {
        console.error('Compass permission error', error);
      }
    }
  };

  const [hasAlertedProximity, setHasAlertedProximity] = useState(false);

  const bearing = useMemo(() => {
    if (!userPosition || !targetDrop) return null;
    return getBearing(userPosition[0], userPosition[1], targetDrop.lat, targetDrop.lng);
  }, [userPosition, targetDrop]);

  const rawDistance = useMemo(() => {
    if (!userPosition || !targetDrop) return null;
    return getDistance(userPosition[0], userPosition[1], targetDrop.lat, targetDrop.lng);
  }, [userPosition, targetDrop]);

  const distance = useMemo(() => {
    if (rawDistance === null) return null;
    if (rawDistance >= 1000) {
      return `${(rawDistance / 1000).toFixed(1)} km`;
    }
    return `${Math.round(rawDistance)} m`;
  }, [rawDistance]);

  // Proximity Alert Effect
  useEffect(() => {
    if (rawDistance === null) return;
    const PROXIMITY_THRESHOLD = 50; // 50 meters
    
    if (rawDistance <= PROXIMITY_THRESHOLD && !hasAlertedProximity) {
      tacticalVibration.proximityAlert();
      setHasAlertedProximity(true);
    } else if (rawDistance > PROXIMITY_THRESHOLD && hasAlertedProximity) {
      setHasAlertedProximity(false); // Reset if they leave
    }
  }, [rawDistance, hasAlertedProximity]);

  if (!targetDrop || !userPosition) return null;

  // Wait for permission prompt if on iOS 13+
  if (permissionGranted === null) {
    return (
      <div className="absolute bottom-6 right-6 z-[1000] p-3 rounded-full bg-slate-950/90 border border-[#106011] shadow-[0_0_15px_rgba(16,96,17,0.4)] backdrop-blur-md">
        <button 
          onClick={requestPermission}
          className="text-[#0ad111] font-mono text-[9px] uppercase tracking-widest font-black"
        >
          Enable Compass
        </button>
      </div>
    );
  }

  // The dial rotates to keep N pointing North
  const dialRotation = deviceHeading !== null ? -deviceHeading : 0;

  // The needle points to the target relative to the top of the screen (device forward axis)
  const needleRotation = bearing !== null && deviceHeading !== null 
    ? bearing - deviceHeading 
    : bearing || 0;

  return (
    <div className="absolute bottom-6 right-6 z-[1000] drop-shadow-xl backdrop-blur-sm pointer-events-none flex flex-col items-center">
      {/* Target Drop Identifier */}
      <div className="mb-1.5 px-2 py-0.5 bg-slate-950/80 border border-[#106011]/50 rounded text-[9px] font-mono font-black text-[#0ad111] tracking-widest shadow-[0_0_10px_rgba(16,96,17,0.2)]">
        {targetDrop.id.slice(0, 4)} target
      </div>

      <div className="relative w-16 h-16 rounded-full bg-slate-950/90 border border-[#106011]/50 flex items-center justify-center shadow-[0_0_20px_rgba(16,96,17,0.4)]">
        
        {/* The Rotating Dial (North/East/South/West) */}
        <div 
          className="absolute inset-0 transition-transform duration-300 ease-out will-change-transform rounded-full"
          style={{ transform: `rotate(${dialRotation}deg)` }}
        >
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[7px] font-mono text-[#0ad111] font-black drop-shadow-[0_0_2px_#0ad111]">N</div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-mono text-[#0ad111]/40 font-black">S</div>
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[7px] font-mono text-[#0ad111]/40 font-black">E</div>
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[7px] font-mono text-[#0ad111]/40 font-black">W</div>
          {/* Subtle radar ring */}
          <div className="absolute inset-1.5 rounded-full border border-dashed border-[#106011]/40" />
        </div>
        
        {/* The Target Needle */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out will-change-transform z-10"
          style={{ transform: `rotate(${needleRotation}deg)` }}
        >
          {deviceHeading === null ? (
            <Navigation className="w-7 h-7 text-[#0ad111]/40" strokeWidth={1.5} />
          ) : (
            <Navigation className="w-7 h-7 text-[#0ad111] fill-[#0ad111]/20 drop-shadow-[0_0_8px_#0ad111]" strokeWidth={1.5} />
          )}
        </div>
      </div>

      {/* Distance Indicator */}
      {distance && (
        <div className="mt-1.5 px-2 py-1 bg-slate-950/80 border border-[#106011]/50 rounded min-w-[60px] text-center shadow-[0_0_10px_rgba(16,96,17,0.2)] pointer-events-auto">
          <div className="text-[11px] font-mono font-bold text-white tracking-wider">
            {distance}
          </div>
        </div>
      )}
    </div>
  );
}
