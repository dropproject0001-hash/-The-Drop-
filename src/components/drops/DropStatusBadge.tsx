import React from 'react';
import type { DropStatus } from '@/types/domain';

interface DropStatusBadgeProps {
  status: DropStatus;
  size?: 'sm' | 'md';
}

export function DropStatusBadge({ status, size = 'md' }: DropStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return { label: 'ACTIVE', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'claimed':
        return { label: 'CLAIMED', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'expired':
        return { label: 'EXPIRED', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' };
      default:
        return { label: status.toUpperCase(), color: 'bg-zinc-800 text-zinc-400' };
    }
  };

  const config = getStatusConfig();
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span className={`inline-block rounded-full border font-mono tracking-widest ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  );
}
