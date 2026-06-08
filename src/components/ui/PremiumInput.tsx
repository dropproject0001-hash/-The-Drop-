import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function PremiumInput({ className, ...props }: PremiumInputProps) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-lg border border-[--border-subtle] bg-[--bg-secondary] px-4 py-2 text-sm text-[--text-primary] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[--text-secondary]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent-primary]/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        className
      )}
      {...props}
    />
  );
}
