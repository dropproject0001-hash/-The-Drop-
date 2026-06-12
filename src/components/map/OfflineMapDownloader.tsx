import { useState } from 'react';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';

interface OfflineMapDownloaderProps {
  onComplete?: () => void;
}

export function OfflineMapDownloader({ onComplete }: OfflineMapDownloaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Nueva Ecija bounding box + zoom levels
  const NUEVA_ECIJA_BOUNDS = {
    minLat: 15.40,
    maxLat: 15.56,
    minLng: 120.90,
    maxLng: 121.05,
    zoomLevels: [12, 13, 14, 15],
  };

  const downloadNuevaEcijaTiles = async () => {
    setIsDownloading(true);
    setStatus('downloading');
    setProgress(0);
    setMessage('Preparing to download map tiles...');

    const cache = await caches.open('nueva-ecija-map-tiles-v1');
    const tileUrls: string[] = [];

    // Generate all tile URLs
    for (const z of NUEVA_ECIJA_BOUNDS.zoomLevels) {
      const minX = Math.floor(((NUEVA_ECIJA_BOUNDS.minLng + 180) / 360) * Math.pow(2, z));
      const maxX = Math.floor(((NUEVA_ECIJA_BOUNDS.maxLng + 180) / 360) * Math.pow(2, z));
      const minY = Math.floor((1 - Math.log(Math.tan(NUEVA_ECIJA_BOUNDS.maxLat * Math.PI / 180) + 1 / Math.cos(NUEVA_ECIJA_BOUNDS.maxLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
      const maxY = Math.floor((1 - Math.log(Math.tan(NUEVA_ECIJA_BOUNDS.minLat * Math.PI / 180) + 1 / Math.cos(NUEVA_ECIJA_BOUNDS.minLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));

      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          tileUrls.push(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`);
        }
      }
    }

    let downloaded = 0;
    const total = tileUrls.length;

    setMessage(`Downloading ${total} map tiles for Nueva Ecija...`);

    for (const url of tileUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response.clone());
        }
      } catch (error) {
        console.warn('Failed to cache tile:', url);
      }

      downloaded++;
      const percent = Math.round((downloaded / total) * 100);
      setProgress(percent);

      if (downloaded % 20 === 0) {
        setMessage(`Downloaded ${downloaded}/${total} tiles (${percent}%)`);
      }
    }

    setProgress(100);
    setStatus('success');
    setMessage('Map tiles for Nueva Ecija downloaded successfully!');
    setIsDownloading(false);

    if (onComplete) onComplete();
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-sm text-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Download size={18} /> Offline Map - Nueva Ecija
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Download map tiles for offline use in Nueva Ecija area
          </p>
        </div>
      </div>

      {status === 'idle' && (
        <button
          onClick={downloadNuevaEcijaTiles}
          disabled={isDownloading}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium transition-colors"
        >
          <Download size={18} />
          Download Map for Offline Use
        </button>
      )}

      {(status === 'downloading' || status === 'success') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">{message}</span>
            <span className="font-medium bg-slate-800 px-2 py-1 rounded">{progress}%</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-500 text-sm mt-2 font-medium">
              <CheckCircle size={16} /> Map downloaded successfully. You can now use it offline.
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
          <AlertCircle size={16} /> Failed to download map tiles. Please try again.
        </div>
      )}
    </div>
  );
}
