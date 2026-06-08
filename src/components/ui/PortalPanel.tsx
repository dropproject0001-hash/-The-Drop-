import React from 'react';
import { cn } from '@/lib/utils';

interface PortalPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PortalPanel({ className, children, ...props }: PortalPanelProps) {
  return (
    <div
      className={cn(
        "bg-[--bg-secondary] border border-[--border-subtle] rounded-xl p-4 shadow-xl backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
