import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Shield, Radio, Lock, Unlock, MapPin, Activity, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';

export function DropperListView({ onSwitchToChat }: { onSwitchToChat?: () => void }) {
  const [operatives, setOperatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchOperatives = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'dropper'])
      .order('display_name');

    if (error) {
      showToast('FAILED TO FETCH OPERATIVE ROSTER', { type: 'error' });
    } else {
      setOperatives(data || []);
    }
    setLoading(false);
  };

  const toggleTrackingLock = async (userId: string, currentLock: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ tracking_locked: !currentLock })
      .eq('id', userId);

    if (error) {
      showToast('COULD NOT UPDATE PROTOCOL LOCK', { type: 'error' });
    } else {
      showToast(`TRACKING ${!currentLock ? 'ENFORCED' : 'RELEASED'} FOR OPERATIVE`, { type: 'success' });
      fetchOperatives();
    }
  };

  useEffect(() => {
    fetchOperatives();
  }, []);

  return (
    <div className="p-6 h-full flex flex-col gap-6 bg-zinc-950/50">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
           <Users className="w-6 h-6 text-blue-500" />
           <h3 className="text-blue-500 font-mono tracking-[0.3em] uppercase text-sm font-black">FIELD_OPERATIVE_ROSTER</h3>
        </div>
        <button
          onClick={fetchOperatives}
          className="text-[10px] font-mono text-slate-500 hover:text-blue-400 uppercase tracking-widest border border-slate-800 px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? 'SYNCING...' : 'REFRESH_ROSTER'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar">
        {operatives.map(op => (
          <div key={op.id} className="bg-black/60 border-2 border-blue-900/20 rounded-2xl p-5 relative group transition-all hover:border-blue-500/40">
             {/* Status Badge */}
             <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${op.is_online ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#106011]' : 'bg-slate-700'}`} />
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{op.is_online ? 'ONLINE' : 'OFFLINE'}</span>
             </div>

             <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full border-2 border-blue-500/20 p-1">
                   <img src={op.avatar_url || '/dropper_role_icon.jpg'} className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                   <h4 className="text-white font-bold uppercase tracking-wider">{op.display_name || op.username || 'CODENAME_PENDING'}</h4>
                   <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest">{op.role} // UNIT_{op.id.substring(0,4).toUpperCase()}</span>
                </div>
             </div>

             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                      <div className="flex items-center gap-2 text-slate-500 text-[8px] font-mono uppercase tracking-widest mb-1">
                         <Activity className="w-3 h-3" /> Latency
                      </div>
                      <div className="text-[10px] font-mono text-blue-400 font-black">12ms</div>
                   </div>
                   <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                      <div className="flex items-center gap-2 text-slate-500 text-[8px] font-mono uppercase tracking-widest mb-1">
                         <MapPin className="w-3 h-3" /> Region
                      </div>
                      <div className="text-[10px] font-mono text-blue-400 font-black">SECTOR_01</div>
                   </div>
                </div>

                <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50 flex justify-between items-center">
                   <div className="flex flex-col gap-1">
                      <div className="text-slate-500 text-[8px] font-mono uppercase tracking-widest">Tracking Protocol</div>
                      <div className={`text-[10px] font-mono font-black ${op.tracking_locked ? 'text-red-500' : 'text-emerald-500'}`}>
                         {op.tracking_locked ? 'ENFORCED_BROADCAST' : 'MANUAL_CONTROL'}
                      </div>
                   </div>
                   <button
                     onClick={() => toggleTrackingLock(op.id, op.tracking_locked)}
                     className={`p-2 rounded-lg transition-all ${op.tracking_locked ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                   >
                      {op.tracking_locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                   </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                   <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-3 h-3" />
                      <span className="text-[8px] font-mono uppercase tracking-tighter">LAST_CONTACT: {new Date(op.last_seen).toLocaleTimeString()}</span>
                   </div>
                   <button className="px-3 py-1 bg-blue-600/10 border border-blue-500/30 text-blue-400 text-[8px] font-mono font-black uppercase rounded hover:bg-blue-600/20 transition-all">VIEW_Locker</button>
                </div>
             </div>
          </div>
        ))}

        {operatives.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center opacity-20">
             <Shield className="w-16 h-16 mx-auto mb-4" />
             <p className="font-mono text-sm uppercase tracking-widest">NO FIELD OPERATIVES REGISTERED</p>
          </div>
        )}
      </div>
    </div>
  );
}
