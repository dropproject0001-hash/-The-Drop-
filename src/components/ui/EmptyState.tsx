import React from 'react';
import { Inbox, AlertTriangle, MapPin } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'inbox' | 'warning' | 'map';
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = 'inbox', title, description, action }: EmptyStateProps) {
  const Icon = {
    inbox: Inbox,
    warning: AlertTriangle,
    map: MapPin,
  }[icon];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-zinc-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-400 max-w-xs mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
