import { supabase } from '@/lib/supabase';
import type { Drop, DropStatus } from '@/types/domain';

export const dropsService = {
  async getAllDrops(): Promise<Drop[]> {
    const { data } = await supabase.from('drops').select('*');
    return (data as Drop[]) || [];
  },

  async getDropsByAssignee(userId: string): Promise<Drop[]> {
    const { data } = await supabase.from('drops').select('*').eq('assigned_to', userId);
    return (data as Drop[]) || [];
  },

  async getDropsByStatus(status: DropStatus): Promise<Drop[]> {
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Drop[];
  },

  async transitionStatus(
    dropId: string,
    newStatus: DropStatus,
    userId: string
  ): Promise<{ success: boolean; message?: string }> {
    const { data: currentDrop, error: fetchError } = await supabase
      .from('drops')
      .select('status, assigned_to, created_by')
      .eq('id', dropId)
      .single();

    if (fetchError || !currentDrop) {
      return { success: false, message: 'Drop not found' };
    }

    const currentStatus = currentDrop.status as DropStatus;

    if (currentStatus === newStatus) {
      return { success: false, message: 'Drop is already in this status' };
    }

    if (currentStatus === 'claimed' && newStatus !== 'expired') {
      return { success: false, message: 'Cannot change status of a claimed drop' };
    }

    if (currentStatus === 'expired') {
      return { success: false, message: 'Cannot modify an expired drop' };
    }

    if (newStatus === 'claimed') {
      if (currentDrop.assigned_to !== userId && currentDrop.created_by !== userId) {
        return { success: false, message: 'Not authorized to claim this drop' };
      }
    }

    const { error: updateError } = await supabase
      .from('drops')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', dropId);

    if (updateError) {
      return { success: false, message: 'Failed to update status' };
    }

    return { success: true };
  },

  subscribeToDrops(onPayload: (payload: any) => void) {
    const channel = supabase
      .channel(`drops-realtime-${Math.random().toString(36).substring(7)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drops' },
        onPayload
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }
};
