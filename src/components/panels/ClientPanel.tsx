import { lazy, Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Map as MapIcon, MessageSquare, Shield, Clock, Navigation } from 'lucide-react';
import EncryptedChat from '@/components/EncryptedChat';

const DropMap = lazy(() => import('@/components/map/DropMap'));

export function ClientPanel() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'map' | 'chat' | 'history'>('map');
  const [assignedDrops, setAssignedDrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyDrops = async () => {
      if (!profile?.id) return;
      const { data, error } = await supabase
        .from('drops')
        .select('*')
        .eq('assigned_to', profile.id)
        .order('created_at', { ascending: false });

      if (!error) setAssignedDrops(data || []);
      setLoading(false);
    };

    fetchMyDrops();

    // Subscribe to new assignments
    const channel = supabase
      .channel('client-assignments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'drops',
        filter: `assigned_to=eq.${profile?.id}`
      }, fetchMyDrops)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  const activeDrop = assignedDrops.find(d => d.status === 'active');

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-2xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,166,35,0.1)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-amber-500/10 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-amber-500" />
          <h2 className="text-amber-500 font-display font-bold tracking-widest uppercase text-sm">CLIENT_PORTAL</h2>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400">
             <Shield className="w-3 h-3" /> SECURE_SESSION
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'map' && (
          <div className="flex-1 relative">
            <Suspense fallback={<div className="h-full w-full bg-zinc-950 animate-pulse" />}>
              <DropMap height="100%" />
            </Suspense>

            {!activeDrop && (
               <div className="absolute inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 text-center">
                  <div className="max-w-xs space-y-4">
                     <Clock className="w-12 h-12 text-amber-500/40 mx-auto animate-pulse" />
                     <h3 className="text-amber-500 font-mono font-black text-sm tracking-widest uppercase">AWAITING_DROP_ASSIGNMENT</h3>
                     <p className="text-[10px] font-mono text-slate-500 leading-relaxed uppercase">The Boss has not yet designated a drop zone for your current session. Standby for encrypted telemetry.</p>
                  </div>
               </div>
            )}

            {activeDrop && (
              <div className="absolute bottom-4 left-4 right-4 z-[400] bg-zinc-950/90 border border-amber-500/30 p-4 rounded-2xl backdrop-blur-md shadow-2xl">
                 <div className="flex justify-between items-start mb-3">
                    <div>
                       <div className="text-[8px] font-mono text-amber-500 uppercase tracking-widest mb-1">ACTIVE_UPLINK_DETECTION</div>
                       <h3 className="text-sm font-black text-white uppercase">{activeDrop.title}</h3>
                    </div>
                    <button
                      onClick={() => window.location.href = `/claim/${activeDrop.id}`}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[10px] font-mono font-black tracking-widest uppercase shadow-[0_0_15px_rgba(245,166,35,0.3)] transition-all"
                    >
                      EXECUTE LOOT
                    </button>
                 </div>
                 <div className="flex items-center gap-4 text-[9px] font-mono text-slate-400">
                    <div className="flex items-center gap-1"><Navigation className="w-3 h-3 text-amber-500" /> TRACKING_ACTIVE</div>
                    <div className="flex items-center gap-1"><Shield className="w-3 h-3 text-amber-500" /> ENCRYPTED</div>
                 </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex-1 p-4 bg-zinc-950">
             <div className="mb-4 flex items-center gap-2 text-amber-500 font-mono text-[10px] tracking-[0.2em] uppercase">
              <MessageSquare className="w-4 h-4" /> SECURE_BOSS_CHANNEL
            </div>
            {/* Logic to choose room: if active drop, use drop chat, else use global client-boss chat */}
            <EncryptedChat customRoomId={activeDrop ? `drop_${activeDrop.id}` : `client_boss_${profile?.id}`} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950">
             <h3 className="text-amber-500 font-mono text-xs tracking-widest uppercase font-black mb-4">PAST_COLLECTIONS</h3>
             {assignedDrops.filter(d => d.status !== 'active').map(drop => (
               <div key={drop.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] font-mono text-slate-500">#{drop.id.substring(0,8)}</div>
                    <div className="text-xs font-bold text-slate-300 uppercase">{drop.title}</div>
                  </div>
                  <div className="text-[9px] font-mono text-emerald-500 uppercase font-black">LOOTED</div>
               </div>
             ))}
             {assignedDrops.filter(d => d.status !== 'active').length === 0 && (
               <div className="text-center py-12 opacity-20 font-mono text-[10px] uppercase">No prior activity logged</div>
             )}
          </div>
        )}
      </div>

      <div className="h-20 border-t border-amber-500/20 bg-background/50 px-4 flex items-center shrink-0">
        <div className="flex w-full justify-around items-center">
          <TabButton
            active={activeTab === 'map'}
            onClick={() => setActiveTab('map')}
            icon={<MapIcon className="w-5 h-5" />}
            label="TELEMETRY"
          />
          <TabButton
            active={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
            icon={<MessageSquare className="w-5 h-5" />}
            label="COMMS"
          />
          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            icon={<Clock className="w-5 h-5" />}
            label="ARCHIVE"
          />
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 px-4 py-2 transition-all ${
        active ? 'text-amber-500 scale-110' : 'text-slate-600 hover:text-amber-400'
      }`}
    >
      {icon}
      <span className="text-[9px] font-mono font-black tracking-widest uppercase">{label}</span>
      {active && <div className="w-8 h-0.5 bg-amber-500 mt-1 shadow-[0_0_10px_#f5a623]" />}
    </button>
  );
}
