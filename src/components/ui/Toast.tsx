import React from 'react';
import { X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  actions?: ToastAction[];
  persistent?: boolean;
  onClose: (id: string) => void;
}

export function Toast({ id, type, message, actions, persistent, onClose }: ToastProps) {
  const colors = {
    success: 'border-emerald-500/40 text-emerald-400',
    error: 'border-red-500/40 text-red-400',
    info: 'border-blue-500/40 text-blue-400',
    warning: 'border-amber-500/40 text-amber-400',
  };

  return (
    <div className={`w-full max-w-sm bg-zinc-950 border ${colors[type]} rounded-2xl p-4 shadow-xl`}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 text-sm text-white pr-2">{message}</div>
        
        {!persistent && (
          <button 
            onClick={() => onClose(id)} 
            className="text-zinc-400 hover:text-white transition mt-0.5"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {actions && actions.length > 0 && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onClose(id);
              }}
              className="px-3 py-1.5 text-xs font-mono tracking-widest bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-700 transition"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
