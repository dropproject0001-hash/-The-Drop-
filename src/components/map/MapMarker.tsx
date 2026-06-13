import React, { memo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export type MarkerStatus = 'pending' | 'active' | 'completed' | 'verified' | 'alert';
export type MarkerType = 'drop' | 'pickup' | 'operative' | 'depot';

interface MapMarkerProps {
  position: [number, number];
  status?: MarkerStatus;
  type?: MarkerType;
  label?: string;
  id?: string;
  description?: string;
  onClick?: () => void;
}

/**
 * ⚡ BOLT OPTIMIZATION: Icon Cache
 * Reusing Leaflet icons prevents redundant DOM creation and object allocation on every render.
 * Especially critical for real-time tracking where markers update frequently.
 */
const iconCache: Record<string, L.DivIcon> = {};

const getTacticalIcon = (status: MarkerStatus, type: MarkerType = 'drop') => {
  const cacheKey = `${status}-${type}`;
  if (iconCache[cacheKey]) return iconCache[cacheKey];

  const colors = {
    pending: '#f59e0b', // Amber
    active: '#0ad111',  // Emerald
    completed: '#3b82f6', // Blue
    verified: '#06b6d4',  // Cyan
    alert: '#ef4444',    // Red
  };

  const selectedColor = colors[status] || colors.active;
  
  const icon = L.divIcon({
    className: 'tactical-marker-container',
    html: `
      <div class="relative flex items-center justify-center group">
        <!-- Pulse Rings -->
        ${status === 'active' || status === 'alert' ? `
          <div class="absolute w-12 h-12 rounded-full border-2 border-[${selectedColor}]/20 animate-ping"></div>
          <div class="absolute w-10 h-10 rounded-full border border-[${selectedColor}]/40 animate-pulse"></div>
        ` : ''}
        
        <!-- Main Marker Body -->
        <div class="relative w-8 h-8 flex items-center justify-center">
          <!-- Glass Background -->
          <div class="absolute inset-0 bg-black/60 backdrop-blur-md rounded-lg rotate-45 border-2 border-[${selectedColor}] shadow-[0_0_15px_${selectedColor}40]"></div>
          
          <!-- Inner Icon Holder -->
          <div class="relative z-10 text-[${selectedColor}]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              ${type === 'drop' ? '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>' : ''}
              ${type === 'pickup' ? '<path d="m20.5 11.5-6-3.5V2L22 6.5v6.5l-1.5-1.5Z"></path><path d="M11 20.5 2 15.5v-6.5L11 4.5l9 5v6.5l-9 5a2.5 2.5 0 0 1-5 0Z"></path><path d="M11 20.5v-10"></path><path d="m2 9 9 5 9-5"></path>' : ''}
              ${type === 'operative' ? '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>' : ''}
              ${type === 'depot' ? '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line><line x1="3" y1="12" x2="21" y2="12"></line>' : ''}
            </svg>
          </div>

          <!-- Tactical Brackets -->
          <div class="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[${selectedColor}]"></div>
          <div class="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-[${selectedColor}]"></div>
          <div class="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-[${selectedColor}]"></div>
          <div class="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[${selectedColor}]"></div>
        </div>

        <!-- Float Label -->
        <div class="absolute -right-2 top-0 translate-x-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div class="bg-black/80 border border-[${selectedColor}]/40 px-2 py-0.5 whitespace-nowrap">
            <span class="text-[7px] font-mono text-[${selectedColor}] tracking-widest uppercase">ID: ${type.toUpperCase()}_LOG</span>
          </div>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });

  iconCache[cacheKey] = icon;
  return icon;
};

/**
 * ⚡ BOLT OPTIMIZATION: React.memo
 * Prevents unnecessary re-renders of map markers during real-time updates.
 * Only re-renders if position, status, type, or label changes.
 */
export const MapMarker = memo(function MapMarker({
  position, 
  status = 'active', 
  type = 'drop', 
  label, 
  id, 
  description,
  onClick 
}: MapMarkerProps) {
  const icon = getTacticalIcon(status, type);

  return (
    <Marker 
      position={position} 
      icon={icon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup className="tactical-popup-container">
        <div className="p-3 min-w-[180px] bg-black text-white font-mono rounded-none border border-[#106011]/30">
          <div className="flex items-center justify-between border-b border-[#106011]/40 pb-2 mb-2">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#0ad111]">
              {label || `${type.toUpperCase()}_UNIT`}
            </span>
            <span className="text-[7px] text-slate-500">{id || 'UID-0000'}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`} />
              <span className="text-[8px] uppercase tracking-widest text-slate-300">Status: {status}</span>
            </div>
            
            {description && (
              <p className="text-[7px] text-slate-400 leading-relaxed italic border-l border-[#106011]/20 pl-2">
                "{description}"
              </p>
            )}
            
            <div className="pt-2 border-t border-[#106011]/10 flex justify-between">
              <span className="text-[6px] text-[#106011]">SEC_LEVEL: 04</span>
              <span className="text-[6px] text-[#106011]">ENCRYPTED: ON</span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
});
