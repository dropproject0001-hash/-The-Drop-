import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { createCachedTileLayer } from '@/services/map/CachedTileLayer';
import L from 'leaflet';

interface CachedTileLayerProps {
  url: string;
  attribution?: string;
  subdomains?: string | string[];
  maxZoom?: number;
  minZoom?: number;
  [key: string]: any; // Allow any other options
}

export function CachedTileLayer({ 
  url, 
  attribution, 
  subdomains = 'abc', 
  maxZoom = 19, 
  minZoom = 0,
  ...otherOptions 
}: CachedTileLayerProps) {
  const map = useMap();
  const layerRef = useRef<any>(null);

  useEffect(() => {
    // If there is an existing layer, remove it first
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    // Create the cached tile layer with the specified options
    const layer = createCachedTileLayer(url, {
      attribution,
      subdomains,
      maxZoom,
      minZoom,
      ...otherOptions
    });

    // Add it to the Leaflet map container
    layer.addTo(map);
    layerRef.current = layer;

    // Cleanup layer when the component is unmounted or options change
    return () => {
      if (layerRef.current) {
        if (map.hasLayer(layerRef.current)) {
          map.removeLayer(layerRef.current);
        }
        layerRef.current = null;
      }
    };
  }, [map, url, attribution, JSON.stringify(subdomains), maxZoom, minZoom, JSON.stringify(otherOptions)]);

  return null;
}
