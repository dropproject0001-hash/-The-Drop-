import { lazy, Suspense, useState, useEffect } from 'react';
import { Radio, Crosshair, Package, Upload, Shield, MessageSquare, Lock, Eye, Video, QrCode, RefreshCw } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/ToastContainer';
import EncryptedChat from '@/components/EncryptedChat';
import { DropperTrackingControl } from '@/components/dropper/DropperTrackingControl';
import { CreateDropPanel } from './CreateDropPanel';

const DropMap = lazy(() => import('@/components/map/DropMap'));

export function DropperPanel() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'console' | 'hq_chat' | 'locker'>('console');
  const [showCreateDrop, setShowCreateDrop] = useState(false);
  const [myDrops, setMyDrops] = useState<any[]>([]);
  const [loadingDrops, setLoadingDrops] = useState(false);

  // Room ID for Boss-Dropper chat
  const hqRoomId = `boss_dropper_${profile?.id}`;

  const fetchLocker = async () => {
    if (!profile?.id) return;
    setLoadingDrops(true);
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .eq('created_by', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching locker:', error);
    } else {
      setMyDrops(data || []);
    }
    setLoadingDrops(false);
  };

  useEffect(() => {
    if (activeTab === 'locker') {
      fetchLocker();
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-2xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-blue-500/10 border-b border-blue-500/20">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-blue-500 animate-pulse" />
          <h2 className="text-blue-500 font-display font-bold tracking-widest uppercase text-sm">FIELD OPERATIVE PORTAL</h2>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-[10px] font-mono text-blue-400">
            <Shield className="w-3 h-3" /> LINK: SECURE_UPLINK
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'console' && (
          <div className="flex-1 relative">
            <Suspense fallback={
              <div className="flex-1 h-full w-full bg-black/95 flex items-center justify-center font-mono text-xs uppercase text-blue-400 tracking-widest animate-pulse min-h-[300px]">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping mr-2"></span>
                UAV TELEMETRY INITIALIZING...
              </div>
            }>
              <DropMap height="100%" />
            </Suspense>

            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
              <HUDItem bg="bg-blue-950/80" border="border-blue-500/30" text="text-blue-200">
                <Crosshair className="w-3 h-3 text-blue-400" /> GPS: ACTIVE_LOCK
              </HUDItem>
              <HUDItem bg="bg-blue-950/80" border="border-blue-500/30" text="text-blue-200">
                <Lock className="w-3 h-3 text-blue-400" /> TRACKING: {profile?.tracking_locked ? 'ENFORCED' : 'MANUAL'}
              </HUDItem>
            </div>

            {/* Quick Action Overlay */}
            <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-2 items-end">
               <button
                 onClick={() => setShowCreateDrop(true)}
                 className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all font-mono text-xs font-black tracking-widest uppercase"
               >
                 <Upload className="w-4 h-4" /> INITIALIZE DROP
               </button>

               <div className="w-64">
                 <DropperTrackingControl />
               </div>
            </div>

            {showCreateDrop && (
              <div className="absolute inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-lg">
                  <CreateDropPanel onClose={() => {
                    setShowCreateDrop(false);
                    fetchLocker();
                  }} />
                  <button
                    onClick={() => setShowCreateDrop(false)}
                    className="w-full mt-4 py-2 text-[10px] font-mono text-slate-500 hover:text-white uppercase tracking-widest"
                  >
                    Cancel Operations
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hq_chat' && (
          <div className="flex-1 p-4 bg-zinc-950">
            <div className="mb-4 flex items-center gap-2 text-[#0ad111] font-mono text-[10px] tracking-[0.2em] uppercase">
              <MessageSquare className="w-4 h-4" /> HQ Command Frequency
            </div>
            <EncryptedChat dropId="hq" />
          </div>
        )}

        {activeTab === 'locker' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950">
            <div className="flex justify-between items-center mb-2">
               <h3 className="text-blue-400 font-mono text-xs tracking-widest uppercase font-black">OPERATIVE_LOCKER (DROPPED_CARGO)</h3>
               <button onClick={fetchLocker} className="text-blue-500/60 hover:text-blue-400">
                 <RefreshCw className={`w-4 h-4 ${loadingDrops ? 'animate-spin' : ''}`} />
               </button>
            </div>

            {myDrops.length === 0 && !loadingDrops && (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-blue-900/20 rounded-2xl text-slate-600">
                <Package className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-[10px] font-mono uppercase tracking-widest">Locker is currently empty</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {myDrops.map(drop => (
                <div key={drop.id} className="bg-zinc-900 border border-blue-900/20 rounded-xl p-4 flex flex-col gap-3 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[9px] font-mono text-blue-500 uppercase tracking-tighter">ID: {drop.id.substring(0,8)}</div>
                      <div className="text-sm font-bold text-white uppercase mt-1">{drop.title}</div>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase ${
                      drop.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                      drop.status === 'claimed' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                      'bg-red-950 text-red-400 border border-red-900'
                    }`}>
                      {drop.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-mono text-slate-500 uppercase">TELEMETRY</span>
                      <span className="text-[10px] font-mono text-slate-300">{drop.lat.toFixed(4)}, {drop.lng.toFixed(4)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-mono text-slate-500 uppercase">CREATED</span>
                      <span className="text-[10px] font-mono text-slate-300">{new Date(drop.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-mono text-slate-500 uppercase">IDENTIFIER</span>
                      <div className="flex items-center gap-1 text-blue-400">
                        <QrCode className="w-3 h-3" />
                        <span className="text-[9px] font-mono">TOKEN_LOGGED</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2 pt-3 border-t border-blue-900/10">
                     {drop.photo_url && <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-950/40 border border-blue-500/20 rounded text-[9px] font-mono text-blue-400 hover:bg-blue-500/20"><Eye className="w-3 h-3"/> PHOTO</button>}
                     {drop.video_url && <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-950/40 border border-blue-500/20 rounded text-[9px] font-mono text-blue-400 hover:bg-blue-500/20"><Video className="w-3 h-3"/> VIDEO</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Control Tabs Navigation */}
      <div className="h-20 border-t border-blue-500/20 bg-background/50 px-4 flex items-center shrink-0">
        <div className="flex w-full justify-around items-center">
          <TabButton
            active={activeTab === 'console'}
            onClick={() => setActiveTab('console')}
            icon={<Crosshair className="w-5 h-5" />}
            label="CONSOLE"
          />
          <TabButton
            active={activeTab === 'locker'}
            onClick={() => setActiveTab('locker')}
            icon={<Package className="w-5 h-5" />}
            label="LOCKER"
          />
          <TabButton
            active={activeTab === 'hq_chat'}
            onClick={() => setActiveTab('hq_chat')}
            icon={<MessageSquare className="w-5 h-5" />}
            label="HQ LINK"
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
        active ? 'text-blue-500 scale-110' : 'text-slate-600 hover:text-blue-400'
      }`}
    >
      {icon}
      <span className="text-[9px] font-mono font-black tracking-widest uppercase">{label}</span>
      {active && <div className="w-8 h-0.5 bg-blue-500 mt-1 shadow-[0_0_10px_#3b82f6]" />}
    </button>
  );
}

function HUDItem({ children, bg, border, text }: { children: React.ReactNode, bg: string, border: string, text: string }) {
  return (
    <div className={`px-3 py-1 rounded backdrop-blur-md flex items-center gap-2 border ${bg} ${border} ${text}`}>
      <span className="text-[10px] font-mono tracking-widest uppercase flex items-center gap-2">{children}</span>
    </div>
  )
}
