import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { locationService, LocationCoords } from '@/services/LocationService';
import { MapBaseLayer } from './MapBaseLayer';
import { MapMarker } from './MapMarker';

// Tactical User Marker Icon (Current Position)
const UserTacticalIcon = L.divIcon({
  className: 'user-tactical-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 rounded-full bg-[#0ad111]/20 border border-[#0ad111] animate-ping"></div>
      <div class="relative w-4 h-4 rounded-full bg-[#0ad111] border-2 border-black shadow-[0_0_10px_#0ad111]"></div>
      <div class="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#0ad111]"></div>
      <div class="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-[#0ad111]"></div>
      <div class="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-[#0ad111]"></div>
      <div class="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#0ad111]"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

interface MapControllerProps {
  center: [number, number];
  zoom: number;
}

function MapController({ center, zoom }: MapControllerProps) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

export function TacticalMap() {
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initial position
    locationService.getCurrentPosition()
      .then(pos => {
        setCoords(pos);
        setIsReady(true);
      })
      .catch(err => {
        setError(err.message);
        setIsReady(true);
      });

    // Tracking
    locationService.startTracking(
      (newCoords) => setCoords(newCoords),
      (err) => setError(err.message)
    );

    return () => locationService.stopTracking();
  }, []);

  if (!isReady) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-2 border-[#106011]/20 border-t-[#0ad111] rounded-full animate-spin"></div>
        <p className="text-[#0ad111] font-mono text-[10px] tracking-[0.3em] animate-pulse">INIT_MAP_ENGINE...</p>
      </div>
    );
  }

  if (error && !coords) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <div className="text-red-500 font-mono text-xs tracking-widest p-4 border border-red-500/30 bg-red-950/10">
          UAV_RELAY_OFFLINE: {error}
        </div>
        <p className="text-slate-500 text-[10px] uppercase font-mono tracking-tighter max-w-xs">
          Satellite link failed. Check field permissions and signal integrity.
        </p>
      </div>
    );
  }

  const mapCenter: [number, number] = coords ? [coords.latitude, coords.longitude] : [0, 0];

  return (
    <div className="w-full h-full tactical-map relative overflow-hidden group">
      {/* Background scanline effect */}
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(16,96,17,0.1)_50%)] bg-[length:100%_4px]"></div>
      
      <MapContainer 
        center={mapCenter} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapBaseLayer />
        
        {coords && (
          <>
            <MapController center={mapCenter} zoom={15} />
            
            <Circle 
              center={mapCenter} 
              radius={coords.accuracy} 
              pathOptions={{ 
                fillColor: '#0ad111', 
                fillOpacity: 0.1, 
                color: '#0ad111', 
                weight: 1,
                dashArray: '5, 5'
              }} 
            />
            
            {/* User Position */}
            <MapMarker 
              position={mapCenter} 
              type="operative" 
              status="active" 
              label="YOU" 
              description="Tactical operative active in sector."
            />

            {/* Simulated Tactical Assets */}
            <MapMarker 
              position={[coords.latitude + 0.002, coords.longitude + 0.002]} 
              type="drop" 
              status="pending" 
              label="DROP_ALPHA" 
              id="DRO-7721"
              description="Secure package awaiting deployment."
            />

            <MapMarker 
              position={[coords.latitude - 0.001, coords.longitude + 0.003]} 
              type="pickup" 
              status="verified" 
              label="PICKUP_BETA" 
              id="PIC-9902"
              description="Inventory verified and secured by field unit."
            />

            <MapMarker 
              position={[coords.latitude + 0.003, coords.longitude - 0.001]} 
              type="depot" 
              status="alert" 
              label="SECTOR_JAMMER" 
              id="JAM-001"
              description="CRITICAL: Signal interference detected at this coordinate."
            />
          </>
        )}
      </MapContainer>

      {/* Map HUD UI */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2 pointer-events-none">
        <div className="px-3 py-1 bg-black/80 backdrop-blur-md border border-[#106011]/60 text-[#0ad111] font-mono text-[9px] tracking-[0.2em] shadow-lg">
          FIELD_UNIT: ALPHA_STRIKE
        </div>
        <div className="px-3 py-1 bg-black/80 backdrop-blur-md border border-[#106011]/60 text-slate-400 font-mono text-[8px] tracking-widest shadow-lg">
          {coords?.latitude.toFixed(6)}, {coords?.longitude.toFixed(6)}
        </div>
      </div>

      {/* Decorative Compass Overlay */}
      <div className="absolute bottom-10 left-10 z-[1000] pointer-events-none opacity-20 hidden sm:block">
        <div className="w-24 h-24 border border-[#106011] rounded-full flex items-center justify-center animate-spin-slow">
           <div className="absolute w-full h-px bg-[#106011]"></div>
           <div className="absolute w-px h-full bg-[#106011]"></div>
           <div className="text-[8px] text-[#0ad111] font-mono absolute -top-3">N</div>
        </div>
      </div>
    </div>
  );
}
