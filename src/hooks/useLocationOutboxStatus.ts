import { useState, useEffect } from 'react';
import { LocationOutbox } from '@/services/LocationOutbox';

export function useLocationOutboxStatus() {
  const [status, setStatus] = useState({ isSyncing: false, queueSize: 0 });

  useEffect(() => {
    const unsubscribe = LocationOutbox.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  return {
    ...status,
    flush: () => LocationOutbox.flush(),
    clear: () => LocationOutbox.clear(),
  };
}
