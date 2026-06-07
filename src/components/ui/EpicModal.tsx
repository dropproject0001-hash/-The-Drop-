import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EpicModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  variant?: 'default' | 'bottom-sheet';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[95vw]',
};

export function EpicModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  variant = 'default',
}: EpicModalProps) {
  const isBottomSheet = variant === 'bottom-sheet';

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeOnBackdropClick ? onClose : undefined}
          />

          <motion.div
            drag={isBottomSheet ? "y" : false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (isBottomSheet && info.offset.y > 150) onClose();
            }}
            initial={isBottomSheet ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
            animate={isBottomSheet ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={isBottomSheet ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "relative w-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col",
              "rounded-t-3xl md:rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700",
              "max-h-[92dvh] md:max-h-[85vh]",
              isBottomSheet ? "md:max-w-lg" : sizeClasses[size]
            )}
          >
            {isBottomSheet && (
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
              </div>
            )}

            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-5 py-4 border-b">
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                {showCloseButton && (
                  <button onClick={onClose} className="p-2 -mr-2">
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
