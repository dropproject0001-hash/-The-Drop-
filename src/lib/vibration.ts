export const tacticalVibration = {
  // New drop assigned: Rapid succession pulse
  newDropAssignment: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      // 200ms on, 100ms off, 200ms on, 100ms off, 400ms on
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  },

  // Proximity Alert: Double short pulse
  proximityAlert: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      // 100ms on, 50ms off, 100ms on
      navigator.vibrate([100, 50, 100]);
    }
  },

  // Generic tick
  tick: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }
};
