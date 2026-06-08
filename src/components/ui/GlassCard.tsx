import React from 'react';
import { cn } from '@/lib/utils'; // Assuming this exists or needed

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-[--card-bg] backdrop-blur-md border border-[--border-subtle] rounded-2xl p-6",
        "shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
