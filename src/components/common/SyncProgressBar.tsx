import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocationOutboxStatus } from '@/hooks/useLocationOutboxStatus';

export function SyncProgressBar() {
  const { isSyncing, queueSize } = useLocationOutboxStatus();
  const [totalToSync, setTotalToSync] = useState(0);

  useEffect(() => {
    if (isSyncing && queueSize >= totalToSync) {
      setTotalToSync(queueSize);
    } else if (!isSyncing && queueSize === 0) {
      setTimeout(() => setTotalToSync(0), 1000); // keep full for a second then reset
    }
  }, [isSyncing, queueSize, totalToSync]);

  const progress = totalToSync > 0 ? ((totalToSync - queueSize) / totalToSync) * 100 : 0;
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const shouldShow = isSyncing || (queueSize > 0 && isOnline);
  const currentWidth = isSyncing && totalToSync > 0 ? `${progress}%` : (queueSize > 0 ? '5%' : '100%');

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-[#106011]/30"
        >
          <motion.div
            className="h-full bg-[#0ad111] shadow-[0_0_8px_rgba(10,209,17,0.8)]"
            initial={{ width: 0 }}
            animate={{ width: currentWidth }}
            transition={{ ease: "linear" }}
          />
          {queueSize > 0 && (
            <div className="absolute top-1 right-2 text-[8px] font-mono text-[#0ad111] tracking-widest bg-black/80 px-1 rounded">
              SYNCING OUTBOX: {queueSize} PENDING
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
