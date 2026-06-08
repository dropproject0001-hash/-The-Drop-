import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface GlowButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  children: React.ReactNode;
}

export function GlowButton({ className, children, ...props }: GlowButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative px-6 py-3 rounded-lg font-medium text-white transition-all",
        "bg-[--accent-primary]/10 border border-[--accent-primary]/30",
        "hover:bg-[--accent-primary]/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
