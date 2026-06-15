import { useState } from 'react';
import { useLiveLocation } from '../hooks/useLiveLocation';
import { useLiveDrops } from '../hooks/realtime/useLiveDrops';
import EncryptedChat from '../components/EncryptedChat';
import { useAuthStore } from '../stores';
import { useToast } from '@/components/ui/ToastContainer';
import { Shield, ShieldAlert, Lock, Unlock } from 'lucide-react';

export default function DropperDashboard() {
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);
  const [locationSharing, setLocationSharing] = useState(true);

  const profile = useAuthStore(state => state.profile);
  const { showToast } = useToast();

  const { drops } = useLiveDrops();
  const myDrops = drops.filter(d => d.assigned_to === profile?.id && d.status === 'active');
  const hasActiveDrops = myDrops.length > 0;

  // Force location sharing on if there are active drops
  const activeLocationSharing = hasActiveDrops ? true : locationSharing;

  // Live location sharing
  useLiveLocation(selectedDropId || '', activeLocationSharing);

  const handleToggleLocationSharing = () => {
    if (hasActiveDrops) {
      showToast('DISCONNECT DENIED: GPS tracker locked. All assigned drops must be fully executed.', { type: 'error' });
      return;
    }
    setLocationSharing(!locationSharing);
  };

  return (
    <div className="p-6 text-white max-w-6xl mx-auto select-none">
      <div className="flex justify-between items-center mb-8 border-b border-[#106011]/30 pb-4">
        <div>
          <span className="text-[9px] font-mono tracking-[0.25em] bg-[#106011]/15 px-2.5 py-1 rounded border border-[#106011]/30 uppercase font-black">
            Active Dropper Hub
          </span>
          <h1 className="text-3xl font-bold mt-2">DROPPER DASHBOARD</h1>
          <p className="text-emerald-400">Tactical Sector Field Operations</p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-950 border-2 border-[#106011]/40 rounded-xl p-2 px-4 shadow-[0_0_15px_rgba(16,96,17,0.15)]">
          <span className="text-xs font-mono tracking-wider text-slate-300 flex items-center gap-1.5">
            {hasActiveDrops ? (
              <Lock className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-slate-500" />
            )}
            LOCATION_UPLINK:
          </span>
          <button
            onClick={handleToggleLocationSharing}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-mono tracking-widest uppercase font-black transition-all ${
              activeLocationSharing 
                ? 'bg-emerald-600 text-black shadow-[0_0_10px_rgba(16,96,17,0.5)]' 
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            {activeLocationSharing ? 'LOCKED_ON' : 'STANDBY'}
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
