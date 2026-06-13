import { useState, useEffect } from 'react';

export function useDeviceHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    typeof (DeviceOrientationEvent as any)?.requestPermission === 'function' ? null : true
  );

  useEffect(() => {
    if (permissionGranted !== true) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let h = null;
      // iOS
      if ('webkitCompassHeading' in e) {
        h = (e as any).webkitCompassHeading;
      }
      // Android / Standard
      else if (e.alpha !== null) {
        h = 360 - e.alpha; // approximate heading depending on OS version
      }

      if (h !== null) {
        setHeading(h);
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

  return { heading, permissionGranted, requestPermission };
}
