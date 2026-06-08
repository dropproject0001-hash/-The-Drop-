import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface FloatingActionBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  children: React.ReactNode;
}

export function FloatingActionBar({ className, children, ...props }: FloatingActionBarProps) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-full",
        "bg-[--card-bg] border border-[--border-subtle] backdrop-blur-md shadow-2xl",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
