import { supabase } from '@/lib/supabase';
import type { Drop } from '@/types/domain';

export const dropsService = {
  async getAllDrops(): Promise<Drop[]> {
    const { data } = await supabase.from('drops').select('*');
    return (data as Drop[]) || [];
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
