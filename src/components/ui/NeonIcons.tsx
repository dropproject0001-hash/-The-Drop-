import React from 'react';
import { LucideIcon } from 'lucide-react';

export type NeonColor = 'green' | 'blue' | 'red' | 'white' | 'gold';

interface NeonIconProps {
  icon?: LucideIcon;
  imageSrc?: string;
  color: NeonColor;
  size?: number;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export function NeonIcon({ 
  icon: Icon, 
  imageSrc,
  color, 
  size = 48, 
  className = '',
  intensity = 'medium'
}: NeonIconProps) {
  const getGlowStyles = (color: NeonColor) => {
    const glows = {
      green: {
        text: 'text-green-500',
        dropShadow: 'drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]',
        border: 'border-green-500/30 text-green-500/20',
        imgBorder: 'border-[#1dd33b]/80 shadow-[0_0_35px_rgba(29,211,59,0.5),inset_0_0_20px_rgba(0,0,0,0.9)] ring-4 ring-[#0ad111]/20'
      },
      blue: {
        text: 'text-blue-500',
        dropShadow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]',
        border: 'border-blue-500/30 text-blue-500/20',
        imgBorder: 'border-[#3b82f6]/80 shadow-[0_0_35px_rgba(59,130,246,0.5),inset_0_0_20px_rgba(0,0,0,0.9)] ring-4 ring-[#3b82f6]/20'
      },
      red: {
        text: 'text-red-500',
        dropShadow: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]',
        border: 'border-red-500/30 text-red-500/20',
        imgBorder: 'border-[#ef4444]/80 shadow-[0_0_35px_rgba(239,68,68,0.5),inset_0_0_20px_rgba(0,0,0,0.9)] ring-4 ring-[#ef4444]/20'
      },
      white: {
        text: 'text-slate-200',
        dropShadow: 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]',
        border: 'border-slate-300/30 text-slate-300/20',
        imgBorder: 'border-slate-300/80 shadow-[0_0_35px_rgba(255,255,255,0.4),inset_0_0_20px_rgba(0,0,0,0.9)] ring-4 ring-white/20'
      },
      gold: {
        text: 'text-[#e2c80f]',
        dropShadow: 'drop-shadow-[0_0_8px_rgba(226,200,15,0.8)] drop-shadow-[0_0_20px_rgba(226,200,15,0.4)]',
        border: 'border-[#e2c80f]/30 text-[#e2c80f]/20',
        imgBorder: 'border-[#e2c80f]/80 shadow-[0_0_35px_rgba(226,200,15,0.5),inset_0_0_20px_rgba(0,0,0,0.9)] ring-4 ring-[#e2c80f]/20'
      }
    };
    return glows[color];
  };

  const style = getGlowStyles(color);

  return (
    <div className={`relative flex items-center justify-center ${className} w-[220px] h-[220px]`}>
      {/* Background ambient glow */}
      <div 
        className={`absolute inset-0 rounded-full blur-xl opacity-30 mix-blend-screen bg-current ${style.text}`}
      />
      
      {/* HUD Rings (like the image) */}
      <div className={`absolute inset-0 rounded-full border border-dashed ${style.border} animate-spin-slow opacity-60`} style={{ animationDuration: '15s' }}></div>
      <div className={`absolute inset-2 rounded-full border border-dotted ${style.border} animate-spin-reverse-slow opacity-40`} style={{ animationDuration: '20s' }}></div>
      <div className={`absolute inset-4 rounded-full border ${style.border} opacity-50`}></div>
      {/* Crosshairs */}
      <div className={`absolute top-0 bottom-0 left-1/2 w-px border-l border-dashed ${style.border} opacity-30`}></div>
      <div className={`absolute left-0 right-0 top-1/2 h-px border-t border-dashed ${style.border} opacity-30`}></div>

      {imageSrc ? (
        <img 
          src={imageSrc} 
          alt="HUD Interface Center"
          referrerPolicy="no-referrer"
          className={`relative z-10 rounded-full object-cover border-2 ${style.imgBorder} filter brightness-110 contrast-110 transition-all duration-500 hover:scale-[1.12]`}
          style={{ width: size, height: size }}
        />
      ) : (
        Icon && (
          <Icon 
            size={size} 
            strokeWidth={1.5}
            className={`relative z-10 ${style.text} ${style.dropShadow} transition-all duration-300`} 
          />
        )
      )}
    </div>
  );
}
