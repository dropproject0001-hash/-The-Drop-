import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function TacticalToast({ message, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed bottom-24 left-4 right-4 z-[2000] flex items-center gap-3 bg-zinc-950/90 border border-emerald-500/50 p-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-md"
        >
          <AlertCircle className="text-emerald-400 shrink-0" size={24} />
          <p className="text-sm font-mono text-white tracking-wide">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
