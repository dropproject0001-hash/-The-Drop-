import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/ToastContainer';
import type { Drop, Profile } from '@/types/domain';

interface DropReassignControlProps {
  drop: Drop;
  availableDroppers: Profile[];
  onReassigned?: () => void;
}

export function DropReassignControl({ drop, availableDroppers, onReassigned }: DropReassignControlProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleReassign = async (dropperId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('drops')
        .update({ assigned_to: dropperId, updated_at: new Date().toISOString() })
        .eq('id', drop.id);

      if (error) throw error;
      
      showToast('Drop reassigned successfully', { type: 'success' });
      onReassigned?.();
    } catch (err: any) {
      showToast(err.message || 'Failed to reassign drop', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      disabled={loading}
      onChange={(e) => handleReassign(e.target.value)}
      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm"
      defaultValue={drop.assigned_to || ""}
    >
      <option value="">Reassign to...</option>
      {availableDroppers.map((dropper) => (
        <option key={dropper.id} value={dropper.id}>
          {dropper.display_name || dropper.username || dropper.id.slice(0, 8)}
        </option>
      ))}
    </select>
  );
}
