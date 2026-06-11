import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DropStatusBadge } from '@/components/drops/DropStatusBadge';
import { DropStatusActions } from '@/components/drops/DropStatusActions';
import { DropReassignControl } from '@/components/admin/DropReassignControl';
import { useToast } from '@/components/ui/ToastContainer';
import type { Drop, Profile } from '@/types/domain';

interface AdminDropsListProps {
  drops: Drop[];
  droppers: Profile[];
  onRefresh: () => void;
}

export default function AdminDropsList({ drops, droppers, onRefresh }: AdminDropsListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { showToast } = useToast();

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === drops.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(drops.map(d => d.id));
    }
  };

  const handleBulkExpire = async () => {
    if (selectedIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('drops')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .in('id', selectedIds);

      if (error) throw error;

      showToast(`${selectedIds.length} drops marked as expired`, { type: 'success' });
      setSelectedIds([]);
      onRefresh();
    } catch (err) {
      showToast('Failed to update some drops', { type: 'error' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-zinc-900 rounded-xl border border-zinc-700">
          <span className="text-sm text-zinc-400">
            {selectedIds.length} selected
          </span>
          <button
            onClick={handleBulkExpire}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-sm rounded-lg font-mono tracking-widest"
          >
            MARK AS EXPIRED
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="px-4 py-1.5 text-sm border border-zinc-600 rounded-lg"
          >
            CLEAR
          </button>
        </div>
      )}

      <div className="space-y-4">
        {drops.length === 0 && (
          <div className="text-center py-12 text-zinc-500">No drops found</div>
        )}

        {drops.map((drop) => (
          <div key={drop.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex gap-4">
            <input
              type="checkbox"
              checked={selectedIds.includes(drop.id)}
              onChange={() => toggleSelect(drop.id)}
              className="mt-2 accent-[#106011]"
            />

            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <div className="font-bold">{drop.title}</div>
                  <div className="text-xs text-zinc-500">Assigned to: {drop.assigned_to?.slice(0,8)}...</div>
                </div>
                <DropStatusBadge status={drop.status} />
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <DropStatusActions drop={drop} onStatusChanged={onRefresh} />
                <DropReassignControl 
                  drop={drop} 
                  availableDroppers={droppers} 
                  onReassigned={onRefresh} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
