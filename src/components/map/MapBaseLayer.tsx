import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { createCachedTileLayer } from '@/services/map/CachedTileLayer';

export function MapBaseLayer() {
  const map = useMap();

  useEffect(() => {
    const layer = createCachedTileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd'
      }
    );
    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map]);

  return null;
}
