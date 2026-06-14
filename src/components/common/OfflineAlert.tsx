import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Save } from 'lucide-react';
import { LocationOutbox } from '@/services/LocationOutbox';
import { useToast } from '@/components/ui/ToastContainer';

export function OfflineAlert() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { showToast } = useToast();

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

  const handleSaveDraft = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported', { type: 'error' });
      return;
    }
    
    showToast('Staging coordinates...', { type: 'success' });
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const payload = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString(),
          is_draft: true
        };
        await LocationOutbox.queue(payload);
        showToast('Draft location saved securely to outbox', { type: 'success' });
      },
      (err) => {
        showToast('Failed to get location: ' + err.message, { type: 'error' });
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-black/90 border border-amber-500/50 p-2 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center gap-3 backdrop-blur-sm"
        >
          <div className="bg-amber-500/20 p-1.5 rounded-full">
            <WifiOff size={14} className="text-amber-500 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-amber-500 tracking-widest uppercase truncate max-w-[100px] sm:max-w-none">
            Connection Lost
          </span>
          
          <button 
            onClick={handleSaveDraft}
            className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-full text-[9px] font-bold tracking-widest transition-colors ml-1"
          >
            <Save size={10} />
            STAGE
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
