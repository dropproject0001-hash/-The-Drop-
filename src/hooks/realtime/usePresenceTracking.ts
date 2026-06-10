import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export interface ActiveBroadcaster {
  user_id: string;
  username?: string;
  role?: string;
  last_seen: string;
}

export function usePresenceTracking() {
  const [activeBroadcasters, setActiveBroadcasters] = useState<ActiveBroadcaster[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const channel = supabase.channel('field-agents-presence', {
      config: { presence: { key: 'user_id' } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const broadcasters: ActiveBroadcaster[] = [];

        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            broadcasters.push({
              user_id: presence.user_id,
              username: presence.username,
              role: presence.role,
              last_seen: new Date().toISOString(),
            });
          });
        });

        setActiveBroadcasters(broadcasters);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsTracking(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsTracking(false);
    };
  }, []);

  // Call this when user starts broadcasting
  const trackPresence = async (userData: { user_id: string; username?: string; role?: string }) => {
    const channel = supabase.channel('field-agents-presence');
    await channel.track(userData);
  };

  // Call this when user stops broadcasting
  const untrackPresence = async () => {
    const channel = supabase.channel('field-agents-presence');
    await channel.untrack();
  };

  return {
    activeBroadcasters,
    isTracking,
    trackPresence,
    untrackPresence,
  };
}
