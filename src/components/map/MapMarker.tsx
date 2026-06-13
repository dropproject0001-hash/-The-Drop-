import React, { useCallback, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Shield, Navigation, CheckCircle2 } from 'lucide-react';

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
  children?: React.ReactNode;
}

const colors = {
  pending: '#f59e0b', // Amber
  active: '#0ad111',  // Emerald
  completed: '#3b82f6', // Blue
  verified: '#06b6d4',  // Cyan
  alert: '#ef4444',    // Red
};

// Create a transparent div icon container as Leaflet's render root
const createFramerIcon = () => {
  return L.divIcon({
    className: 'framer-tactical-marker-root',
    html: '<div class="framer-portal-root w-10 h-10 flex items-center justify-center"></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

export function MapMarker({ 
  position, 
  status = 'active', 
  type = 'drop', 
  label, 
  id, 
  description,
  onClick,
  children
}: MapMarkerProps) {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  // Callback ref guarantees the Leaflet DOM element is captured the moment it mounts
  const markerRef = useCallback((node: L.Marker | null) => {
    if (node) {
      const el = node.getElement();
      if (el) {
        // Find or target our specific portal entry child inside Leaflet's container
        const target = el.querySelector('.framer-portal-root') as HTMLElement || el;
        setPortalElement(target);
      }
    }
  }, []);

  const selectedColor = colors[status] || colors.active;

  // Icon switcher for visual HUD indicators
  const renderIcon = () => {
    switch (type) {
      case 'drop':
        return <Package className="w-3.5 h-3.5" style={{ color: selectedColor }} />;
      case 'pickup':
        return <Navigation className="w-3.5 h-3.5 rotate-45" style={{ color: selectedColor }} />;
      case 'operative':
        return <Shield className="w-3.5 h-3.5" style={{ color: selectedColor }} />;
      case 'depot':
        return <CheckCircle2 className="w-3.5 h-3.5" style={{ color: selectedColor }} />;
      default:
        return <Package className="w-3.5 h-3.5" style={{ color: selectedColor }} />;
    }
  };

  return (
    <>
      <Marker 
        ref={markerRef}
        position={position} 
        icon={createFramerIcon()}
        eventHandlers={{
          click: onClick,
        }}
      >
        <Popup className="tactical-popup-container">
          <AnimatePresence mode="wait">
            <motion.div 
              className="p-3 min-w-[200px] bg-black text-white font-mono rounded-none border border-[#106011]/45 shadow-[0_0_20px_rgba(10,209,17,0.2)] overflow-hidden"
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ type: "spring", damping: 15, stiffness: 180 }}
            >
              {children ? (
                children
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-[#106011]/40 pb-2 mb-2">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#0ad111]">
                      {label || `${type.toUpperCase()}_UNIT`}
                    </span>
                    <span className="text-[7px] text-slate-500">{id || 'UID-0000'}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedColor }} />
                      <span className="text-[8px] uppercase tracking-widest text-slate-300">Status: {status}</span>
                    </div>
                    
                    {description && (
                      <p className="text-[7.5px] text-slate-400 leading-relaxed italic border-l border-[#106011]/20 pl-2">
                        "{description}"
                      </p>
                    )}
                    
                    <div className="pt-2 border-t border-[#106011]/10 flex justify-between">
                      <span className="text-[6px] text-[#106011]">SEC_LEVEL: 05</span>
                      <span className="text-[6px] text-[#106011]">ENCRYPTED: ON</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </Popup>
      </Marker>

      {/* Render the Framer Motion Marker layout directly inside Leaflet's elements */}
      {portalElement && createPortal(
        <div className="relative w-10 h-10 flex items-center justify-center select-none" style={{ color: selectedColor }}>
          {/* Realtime Ripple expansion radar rings */}
          {(status === 'active' || status === 'pending' || status === 'alert') && (
            <>
              <motion.div
                className="absolute w-12 h-12 rounded-full border-2 opacity-30 pointer-events-none"
                style={{ borderColor: selectedColor }}
                animate={{ scale: [1, 2.2], opacity: [0.35, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              />
              <motion.div
                className="absolute w-10 h-10 rounded-full border opacity-50 pointer-events-none"
                style={{ borderColor: selectedColor }}
                animate={{ scale: [1, 1.6], opacity: [0.55, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
              />
            </>
          )}

          {/* Smooth tactical drop-in entrance with spring bounce */}
          <motion.div
            className="relative w-8 h-8 flex items-center justify-center group"
            initial={{ y: -85, scale: 0, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              damping: 11,
              stiffness: 130,
              mass: 0.75
            }}
          >
            {/* Diamond shape rotating on entrance */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-lg border-2 pointer-events-none"
              style={{ 
                borderColor: selectedColor, 
                boxShadow: `0 0 10px ${selectedColor}40`,
              }}
              animate={{ rotate: 45 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />

            {/* Inner Icon */}
            <div className="relative z-10 flex items-center justify-center">
              {renderIcon()}
            </div>

            {/* Glowing Tactical Frame Brackets */}
            <motion.div 
              className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 border-t-2 border-l-2"
              style={{ borderColor: selectedColor }}
              animate={{ x: [-4, 0], y: [-4, 0] }}
              transition={{ type: "spring", stiffness: 85, damping: 8 }}
            />
            <motion.div 
              className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 border-t-2 border-r-2"
              style={{ borderColor: selectedColor }}
              animate={{ x: [4, 0], y: [-4, 0] }}
              transition={{ type: "spring", stiffness: 85, damping: 8 }}
            />
            <motion.div 
              className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 border-b-2 border-l-2"
              style={{ borderColor: selectedColor }}
              animate={{ x: [-4, 0], y: [4, 0] }}
              transition={{ type: "spring", stiffness: 85, damping: 8 }}
            />
            <motion.div 
              className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 border-b-2 border-r-2"
              style={{ borderColor: selectedColor }}
              animate={{ x: [4, 0], y: [4, 0] }}
              transition={{ type: "spring", stiffness: 85, damping: 8 }}
            />
          </motion.div>

          {/* Holographic Float Label */}
          <div className="absolute -right-2 top-0 translate-x-full ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-black/95 border px-1.5 py-0.5 whitespace-nowrap rounded font-mono text-[6px] tracking-wider" style={{ borderColor: selectedColor, color: selectedColor }}>
              SEC_{type.toUpperCase()}
            </div>
          </div>
        </div>,
        portalElement
      )}
    </>
  );
}
