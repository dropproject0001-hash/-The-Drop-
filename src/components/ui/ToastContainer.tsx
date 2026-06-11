import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastType, ToastAction } from './Toast';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
  persistent?: boolean;
  actions?: ToastAction[];
}

interface ToastItem extends ToastOptions {
  id: string;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const MAX_VISIBLE_TOASTS = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, options: ToastOptions = {}): string => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);

    const newToast: ToastItem = {
      id,
      message,
      type: options.type || 'info',
      duration: options.persistent ? undefined : (options.duration ?? 4500),
      persistent: options.persistent ?? false,
      actions: options.actions,
    };

    setToasts((prev) => {
      const updated = [...prev, newToast];
      // Queue management: keep only MAX_VISIBLE_TOASTS visible
      return updated.length > MAX_VISIBLE_TOASTS 
        ? updated.slice(updated.length - MAX_VISIBLE_TOASTS) 
        : updated;
    });

    // Auto dismiss (unless persistent)
    if (!options.persistent && newToast.duration) {
      setTimeout(() => {
        dismissToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const dismissAll = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, dismissAll }}>
      {children}

      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 items-end">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type!}
            message={toast.message}
            actions={toast.actions}
            persistent={toast.persistent}
            onClose={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
