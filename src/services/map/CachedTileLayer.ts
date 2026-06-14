import L from 'leaflet';
import { TileCacheService } from '@/services/map/TileCacheService';

export const createCachedTileLayer = (url: string, options?: L.TileLayerOptions) => {
  const CachedLayer = L.TileLayer.extend({
    createTile: function(coords: any, done: any) {
      const tile = document.createElement('img');
      const tileUrl = L.Util.template(url, L.extend({
        s: this.options.subdomains ? (Array.isArray(this.options.subdomains) ? this.options.subdomains[0] : this.options.subdomains) : 'a',
        z: coords.z,
        x: coords.x,
        y: coords.y,
        r: L.Browser.retina ? '@2x' : ''
      }, options));

      // Cache Check
      TileCacheService.getTile(tileUrl).then(blob => {
        if (blob) {
          tile.src = URL.createObjectURL(blob);
          done();
        } else {
          // Fetch and store
          tile.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = tile.naturalWidth;
            canvas.height = tile.naturalHeight;
            canvas.getContext('2d')?.drawImage(tile, 0, 0);
            canvas.toBlob(blob => {
              if (blob) TileCacheService.saveTile(tileUrl, blob);
            }, 'image/png');
            done();
          };
          tile.onerror = () => done();
          tile.crossOrigin = "anonymous";
          tile.src = tileUrl;
        }
      });

      return tile;
    }
  });

  return new (CachedLayer as any)(url, options);
};
