import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { NeonBadge } from './NeonBadge';

interface ConnectionStatusBadgeProps {
  status: 'realtime' | 'polling' | 'offline';
  className?: string;
}

export function ConnectionStatusBadge({ status, className }: ConnectionStatusBadgeProps) {
  const config = {
    realtime: {
      icon: <Wifi className="w-3 h-3" />,
      text: 'REALTIME',
      variant: 'primary' as const,
      color: 'text-[#0ad111]'
    },
    polling: {
      icon: <RefreshCw className="w-3 h-3 animate-spin-slow" />,
      text: 'POLLING',
      variant: 'caution' as const,
      color: 'text-amber-400'
    },
    offline: {
      icon: <WifiOff className="w-3 h-3" />,
      text: 'OFFLINE',
      variant: 'danger' as const,
      color: 'text-red-500'
    }
  }[status];

  return (
    <NeonBadge
      variant={config.variant}
      className={`flex items-center gap-1.5 px-2 py-1 font-mono text-[9px] tracking-widest ${className}`}
    >
      {config.icon}
      <span>{config.text}</span>
    </NeonBadge>
  );
}
