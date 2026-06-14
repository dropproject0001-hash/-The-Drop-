import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ icon: IconComponent, size = 20, className, strokeWidth = 2 }: IconProps) {
  return (
    <IconComponent 
      size={size} 
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)} 
    />
  );
}
