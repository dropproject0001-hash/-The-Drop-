import { lazy, Suspense, useState, useEffect } from 'react';
import { Activity, Radio, Shield, PackageSearch, Terminal, Plus, MessageSquare } from 'lucide-react';
import { CreateDropPanel } from './CreateDropPanel';
import { useNavigate } from 'react-router-dom';
import TTSLogsPanel from '@/features/admin/TTSLogsPanel';
import { supabase } from '@/lib/supabase';

const DropMap = lazy(() => import('@/components/map/DropMap'));

export function SuperAdminPanel() {
  const navigate = useNavigate();
  const [showCreateDrop, setShowCreateDrop] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'tts' | 'agents'>('logs');
  
  const [agents, setAgents] = useState<any[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['dropper', 'admin', 'super_admin'])
          .order('role', { ascending: true });
        
        if (error) throw error;
        setAgents(data || []);
      } catch (err) {
        console.error('Error loading agents:', err);
      } finally {
        setAgentsLoading(false);
      }
    }

    fetchAgents();

    const subscription = supabase
      .channel('realtime-profiles-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchAgents();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return (
    <div className="flex flex-col h-full bg-black/95 rounded-2xl border border-[#106011]/50 shadow-[0_0_20px_rgba(16,96,17,0.3)] overflow-hidden relative select-none">
      {showCreateDrop && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <CreateDropPanel onClose={() => setShowCreateDrop(false)} />
        </div>
      )}
      {/* Tactical HUD Corner Brackets */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#106011] rounded-tl-xl pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.8)] z-30"></div>
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#106011] rounded-tr-xl pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.8)] z-30"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#106011] rounded-bl-xl pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.8)] z-30"></div>
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#106011] rounded-br-xl pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.8)] z-30"></div>

      {/* Inner Nested Rectangle Tactical HUD lines */}
      <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none z-20"></div>
      <div className="absolute inset-2 border border-[#106011]/15 rounded-lg pointer-events-none z-20"></div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-[#106011]/10 border-b border-[#106011]/50 relative z-20">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#106011] drop-shadow-[0_0_6px_rgba(16,96,17,0.8)] animate-pulse" />
          <h2 className="text-[#106011] font-display font-black tracking-[0.18em] uppercase text-sm drop-shadow-[0_0_8px_rgba(16,96,17,0.7)]">
            Gods Eye for The Owner
          </h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCreateDrop(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#106011]/20 hover:bg-[#106011]/40 border border-[#106011] text-[10px] font-mono font-bold tracking-widest uppercase transition-colors"
          >
            <Plus size={12} /> ADD
          </button>
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#106011] font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#106011] animate-ping mr-1.5" /> OVERSEER
          </span>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative min-h-[300px] z-10">
        <Suspense fallback={
          <div className="flex-1 h-full w-full bg-black/95 flex items-center justify-center font-mono text-xs uppercase text-[#106011]/80 tracking-widest animate-pulse min-h-[300px]">
            <span className="w-2 h-2 rounded-full bg-[#106011] animate-ping mr-2"></span>
            Loading telemetry...
          </div>
        }>
          <DropMap height="100%" />
        </Suspense>
        {/* Absolute HUD */}
        <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
          <HUDItem bg="bg-black/85" border="border-[#106011]/40" text="text-[#106011] drop-shadow-[0_0_4px_rgba(16,96,17,0.5)]">
            <Terminal className="w-3 h-3 text-[#106011]" /> ALL AGENTS VISIBLE
          </HUDItem>
          <HUDItem bg="bg-black/85" border="border-[#106011]/40" text="text-[#106011] drop-shadow-[0_0_4px_rgba(16,96,17,0.5)]">
            <Activity className="w-3 h-3 text-[#106011]" /> SYSTEM OVERRIDE ACTIVE
          </HUDItem>
        </div>
      </div>

      {/* Control Panel Area */}
      <div className="h-64 border-t border-[#106011]/40 bg-[#090b09]/95 p-4 shrink-0 flex flex-col gap-2 relative z-20 overflow-hidden">
        {/* Tabs */}
        <div className="flex text-xs font-mono text-[#106011]/60 uppercase tracking-widest border-b border-[#106011]/25 pb-2 mb-2">
          <button
            onClick={() => setActiveTab('logs')}
            className={`${activeTab === 'logs' ? 'text-[#106011] border-b-2 border-[#106011] font-bold' : 'hover:text-slate-300'} pb-2 -mb-[10px] mr-6 tracking-wider transition-all`}
          >
            Live Logs
          </button>
          <button
            onClick={() => setActiveTab('tts')}
            className={`${activeTab === 'tts' ? 'text-[#106011] border-b-2 border-[#106011] font-bold' : 'hover:text-slate-300'} pb-2 -mb-[10px] mr-6 tracking-wider transition-all flex items-center gap-1`}
          >
            <MessageSquare size={12} /> TTS Audit
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`${activeTab === 'agents' ? 'text-[#106011] border-b-2 border-[#106011] font-bold' : 'hover:text-slate-300'} pb-2 -mb-[10px] tracking-wider transition-all`}
          >
            Agents
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'logs' && (
            <div className="rounded border border-[#106011]/20 bg-[#106011]/5 p-2 font-mono text-[10px] flex flex-col gap-1 min-h-full">
              <div className="flex gap-2">
                <span className="text-[#106011]/50 font-bold">[12:04:22]</span>
                <span className="text-slate-300">System uplink established. Scanning DropZones...</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#106011]/50 font-bold">[12:05:11]</span>
                <span className="text-[#106011] font-semibold drop-shadow-[0_0_4px_rgba(16,96_17,0.5)]">Dropper 'DROPPER-01' is online.</span>
              </div>
            </div>
          )}
          {activeTab === 'tts' && (
            <div className="h-full">
              <TTSLogsPanel />
            </div>
          )}
          {activeTab === 'agents' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 min-h-full">
              {agentsLoading ? (
                <div className="text-zinc-500 font-mono text-[10px] text-center py-4 col-span-full">Retrieving tactical nodes...</div>
              ) : agents.length === 0 ? (
                <div className="text-zinc-500 font-mono text-[10px] text-center py-4 col-span-full">No active agents synchronized.</div>
              ) : (
                agents.map((agent) => {
                  const isOnline = agent.is_online || (agent.last_seen && (new Date().getTime() - new Date(agent.last_seen).getTime() < 120000));
                  return (
                    <div key={agent.id} className="border border-[#106011]/30 bg-black/60 p-2.5 rounded-xl flex items-center justify-between gap-4 font-mono text-[10px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative shrink-0">
                          <span className={`absolute -inset-0.5 rounded-full blur-[1px] opacity-65 ${isOnline ? 'bg-green-500 animate-ping' : 'bg-zinc-700'}`} />
                          <span className={`relative w-1.5 h-1.5 rounded-full block ${isOnline ? 'bg-green-500' : 'bg-zinc-650'}`} />
                        </div>
                        <div className="truncate">
                          <div className="text-white font-bold truncate uppercase">{agent.alias || agent.username || 'FIELD_AGENT'}</div>
                          <div className="text-slate-400 text-[8px] uppercase tracking-wider truncate">
                            {agent.role}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                          agent.role === 'super_admin' ? 'border-red-900 text-red-500 bg-red-950/25' :
                          agent.role === 'admin' ? 'border-blue-900 text-blue-400 bg-blue-950/25' : 'border-[#106011]/40 text-[#106011] bg-[#106011]/5'
                        }`}>
                          {agent.role === 'super_admin' ? 'ROOT' : agent.role === 'admin' ? 'ADMIN' : 'FIELD'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HUDItem({ children, bg, border, text }: { children: React.ReactNode, bg: string, border: string, text: string }) {
  return (
    <div className={`px-3 py-1 rounded backdrop-blur-md flex items-center gap-2 border ${bg} ${border} ${text}`}>
      <span className="text-[10px] font-mono tracking-widest uppercase flex items-center gap-2">{children}</span>
    </div>
  )
}
