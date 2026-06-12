import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const InstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the banner in this session/local storage
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      setHasDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (isInstallable && !isInstalled && !hasDismissed) {
      // Small delay so it doesn't pop up immediately on load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isInstallable, isInstalled, hasDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setHasDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleInstall = async () => {
    await promptInstall();
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50, transition: { duration: 0.2 } }}
          className="fixed bottom-4 left-4 right-4 z-50 md:bottom-8 md:origin-bottom md:w-96 md:left-auto md:right-8"
        >
          <div className="bg-black/90 backdrop-blur-md border border-[#0ad111]/50 shadow-[0_0_20px_rgba(10,209,17,0.3)] rounded-xl p-4 flex items-center justify-between gap-4 relative overflow-hidden">
            {/* Background scanner effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(10,209,17,0.1)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none opacity-20" />
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-[#0ad111]/20 border border-[#0ad111]/50 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-[#0ad111]" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-medium text-sm">Install The Drop</span>
                <span className="text-slate-400 text-xs">Add to home screen for quick access</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative z-10">
              <button
                onClick={handleInstall}
                className="bg-[#0ad111] hover:bg-[#0ad111]/90 text-black font-bold text-xs px-3 py-2 rounded-lg truncate transition-colors shadow-[0_0_10px_rgba(10,209,17,0.5)]"
              >
                INSTALL
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
