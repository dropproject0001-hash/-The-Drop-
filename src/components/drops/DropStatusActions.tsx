import React, { useState } from 'react';
import { dropsService } from '@/services/drops';
import { useAuthStore } from '@/stores';
import { useToast } from '@/components/ui/ToastContainer';
import type { Drop, DropStatus } from '@/types/domain';

interface DropStatusActionsProps {
  drop: Drop;
  onStatusChanged?: () => void;
}

export function DropStatusActions({ drop, onStatusChanged }: DropStatusActionsProps) {
  const { profile } = useAuthStore();
  const { showToast } = useToast();
  const [optimisticStatus, setOptimisticStatus] = useState<DropStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const currentStatus = optimisticStatus || drop.status;

  const handleStatusChange = async (newStatus: DropStatus) => {
    if (!profile) return;

    setOptimisticStatus(newStatus);
    setLoading(true);

    try {
      const result = await dropsService.transitionStatus(drop.id, newStatus, profile.id);

      if (result.success) {
        showToast(
          newStatus === 'claimed' 
            ? 'Drop claimed successfully!' 
            : 'Drop status updated',
          { type: 'success' }
        );
        onStatusChanged?.();
      } else {
        setOptimisticStatus(null);
        showToast(result.message || 'Failed to update status', { type: 'error' });
      }
    } catch (err) {
      setOptimisticStatus(null);
      showToast('An unexpected error occurred', { type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setOptimisticStatus(null), 500);
    }
  };

  const canClaim = currentStatus === 'active' && 
    (drop.assigned_to === profile?.id || drop.created_by === profile?.id);

  const canExpire = ['active', 'claimed'].includes(currentStatus) && 
    ['admin', 'super_admin'].includes(profile?.role || '');

  if (currentStatus === 'expired') return null;

  return (
    <div className="flex gap-2 mt-3">
      {canClaim && (
        <button
          onClick={() => handleStatusChange('claimed')}
          disabled={loading}
          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 rounded-xl text-sm font-mono tracking-widest transition"
        >
          {loading ? 'CLAIMING...' : 'CLAIM DROP'}
        </button>
      )}

      {canExpire && (
        <button
          onClick={() => handleStatusChange('expired')}
          disabled={loading}
          className="px-4 py-2 bg-red-600/80 hover:bg-red-600 disabled:bg-zinc-700 rounded-xl text-sm font-mono tracking-widest transition"
        >
          MARK EXPIRED
        </button>
      )}
    </div>
  );
}
