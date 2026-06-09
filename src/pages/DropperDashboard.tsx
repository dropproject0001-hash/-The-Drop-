import { useState } from 'react';
import { useLiveLocation } from '../hooks/useLiveLocation';
import { useLiveDrops } from '../hooks/realtime/useLiveDrops';
import EncryptedChat from '../components/EncryptedChat';

export default function DropperDashboard() {
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);
  const [locationSharing, setLocationSharing] = useState(true);

  const { drops } = useLiveDrops();
  const myDrops = drops.filter(d => d.status === 'active' || d.status === 'executed');

  // Live location sharing
  useLiveLocation(selectedDropId || '', locationSharing);

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">DROPPER DASHBOARD</h1>
          <p className="text-emerald-400">Field Operations</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm">Location Sharing</span>
          <button
            onClick={() => setLocationSharing(!locationSharing)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              locationSharing 
                ? 'bg-emerald-600 text-white' 
                : 'bg-zinc-700 text-zinc-300'
            }`}
          >
            {locationSharing ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Drops */}
        <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-semibold mb-4">My Active Drops</h3>
          <div className="space-y-3">
            {myDrops.length === 0 && <p className="text-zinc-500">No active drops assigned.</p>}
            
            {myDrops.map(drop => (
              <div 
                key={drop.id}
                onClick={() => setSelectedDropId(drop.id)}
                className={`p-4 rounded-xl cursor-pointer border transition-colors ${
                  selectedDropId === drop.id 
                    ? 'border-emerald-500 bg-zinc-950' 
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="font-mono text-sm">#{drop.id}</div>
                <div className="text-emerald-400 text-sm capitalize mt-1">{drop.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDropId ? (
            <>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Drop #{selectedDropId}</h3>
                <button 
                  onClick={() => window.location.href = `/execute/${selectedDropId}`}
                  className="w-full bg-emerald-600 py-3 rounded-xl mb-3"
                >
                  Open Execution Screen
                </button>
              </div>

              <EncryptedChat dropId={selectedDropId} />
            </>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400">
              Select a drop from the list to begin operations
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
