// src/features/portals/AdminPortal.tsx
import React from 'react';
import { useLiveDrops } from '@/hooks/realtime/useLiveDrops';
import { DropStatusBadge } from '@/components/drops/DropStatusBadge';
import { CreateDropPanel } from '@/components/panels/CreateDropPanel';

export default function AdminPortal() {
  const { drops, loading } = useLiveDrops();
  const [showCreate, setShowCreate] = React.useState(false);

  if (loading) {
    return <div className="p-6 text-center text-emerald-500 font-mono">Loading tactical data...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-mono tracking-widest text-[#106011]">ADMIN PORTAL</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-mono tracking-widest text-black font-bold transition-colors"
        >
          + CREATE DROP
        </button>
      </div>

      {showCreate && (
        <div className="mb-6">
          <CreateDropPanel onClose={() => setShowCreate(false)} />
        </div>
      )}

      <div className="grid gap-4">
        {drops.length === 0 && (
          <div className="text-center py-12 text-zinc-500 font-mono uppercase tracking-widest">No drops found in proximity</div>
        )}

        {drops.map((drop) => (
          <div key={drop.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 hover:border-[#106011]/50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-lg text-white">{drop.title}</div>
                <div className="text-xs text-zinc-500 mt-1 font-mono">
                  Assigned: {drop.assigned_to ? drop.assigned_to.slice(0, 8) : 'UNASSIGNED'}
                </div>
                <div className="text-[10px] text-zinc-600 mt-1 font-mono">
                  ID: {drop.id.slice(0, 8)}...
                </div>
              </div>
              <DropStatusBadge status={drop.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
