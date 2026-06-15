import { useLiveDrops } from '../hooks/realtime/useLiveDrops';
import { useLiveLocations } from '../hooks/realtime/useLiveLocations';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

export default function ClientTrackingScreen({ clientId }: { clientId: string }) {
  const { drops } = useLiveDrops();
  const myDrops = drops.filter(d => d.assigned_to === clientId);

  const activeDrop = myDrops.find(d => d.status === 'active');
  const { locations } = useLiveLocations({});

  const latestLocation = activeDrop ? locations[activeDrop.assigned_to]?.slice(-1)[0] : null;

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8">Your Drop Status</h1>

      {!activeDrop && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <p className="text-zinc-400">No active drops at the moment.</p>
        </div>
      )}

      {activeDrop && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex justify-between">
              <div>
                <div className="text-sm text-zinc-400">Drop ID</div>
                <div className="font-mono text-xl">#{activeDrop.id}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-zinc-400">Status</div>
                <div className="text-emerald-400 font-medium capitalize">{activeDrop.status}</div>
              </div>
            </div>
          </div>

          {/* Live Map */}
          {latestLocation && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden h-[380px]">
              <MapContainer 
                center={[latestLocation.lat, latestLocation.lng]} 
                zoom={15} 
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[latestLocation.lat, latestLocation.lng]} />
              </MapContainer>
            </div>
          )}

          {/* Confirmation Action */}
          {activeDrop.status === 'claimed' && (
            <button 
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-semibold text-lg"
              onClick={() => window.location.href = '/claim/' + activeDrop.id}
            >
              Confirm Receipt (Loot)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
