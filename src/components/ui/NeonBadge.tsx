import React from 'react';
import { cn } from '@/lib/utils';

interface NeonBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'caution';
}

export function NeonBadge({ className, children, variant = 'primary', ...props }: NeonBadgeProps) {
  const variants = {
    primary: "border-[--accent-primary]/30 bg-[--accent-primary]/10 text-[--accent-primary] shadow-[0_0_8px_rgba(34,197,94,0.2)]",
    danger: "border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]",
    caution: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.2)]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
