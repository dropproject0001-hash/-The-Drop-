import { lazy, Suspense, useState, useEffect } from 'react';
import { Shield, Radio, Users, Package, Settings, MessageSquare, Activity, Map as MapIcon, ChevronRight } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/ToastContainer';
import EncryptedChat from '@/components/EncryptedChat';

const TacticalMap = lazy(() => import('@/components/map/TacticalMap').then(m => ({ default: m.TacticalMap })));
const DropperListView = lazy(() => import('@/components/layout/views/DropperListView').then(m => ({ default: m.DropperListView })));
const CargoBayView = lazy(() => import('@/components/layout/views/CargoBayView').then(m => ({ default: m.CargoBayView })));

export function SuperAdminPanel() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'monitor' | 'operatives' | 'inventory' | 'comms' | 'settings'>('monitor');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  return (
    <div className="flex flex-col h-full bg-black/60 rounded-3xl border-2 border-emerald-500/30 shadow-[0_0_50px_rgba(16,96,17,0.2)] overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-emerald-500/10 border-b-2 border-emerald-500/20">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-emerald-500 shadow-[0_0_10px_#106011]" />
          <div>
             <h2 className="text-emerald-500 font-display font-black tracking-[0.4em] uppercase text-sm">BOSS_COMMAND_CENTER</h2>
             <p className="text-[7px] font-mono text-emerald-500/50 tracking-widest uppercase">Global Operations Oversight // Level 5 Clearance</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
             <span className="text-[8px] font-mono text-emerald-500/60 uppercase">System_Status</span>
             <span className="text-[9px] font-mono text-emerald-400 font-black">NOMINAL // SECURE</span>
          </div>
          <div className="w-10 h-10 rounded-full border border-emerald-500/30 overflow-hidden bg-black">
             <img src={profile?.avatar_url || '/admin_role_icon.jpg'} alt="Boss" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {activeTab === 'monitor' && (
          <div className="flex-1 relative">
            <Suspense fallback={<div className="h-full w-full bg-black flex items-center justify-center font-mono text-emerald-500 animate-pulse">SYNCING_SATELLITE_FEED...</div>}>
              <TacticalMap />
            </Suspense>

            {/* Absolute Overlays */}
            <div className="absolute top-6 left-6 z-[400] space-y-3 pointer-events-none">
               <HUDItem>ACTIVE_OPERATIVES: 12</HUDItem>
               <HUDItem>LIVE_DROPS: 48</HUDItem>
               <HUDItem>SECURITY_LEVEL: HIGH</HUDItem>
            </div>
          </div>
        )}

        {activeTab === 'operatives' && (
          <div className="flex-1 overflow-hidden">
             <Suspense fallback={<div className="p-8 font-mono text-emerald-500">Loading roster...</div>}>
                <DropperListView />
             </Suspense>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="flex-1 overflow-hidden">
             <Suspense fallback={<div className="p-8 font-mono text-emerald-500">Scanning cargo...</div>}>
                <CargoBayView />
             </Suspense>
          </div>
        )}

        {activeTab === 'comms' && (
          <div className="flex-1 p-6 bg-zinc-950 flex flex-col gap-6">
             <div className="flex gap-4 h-full">
                <div className="w-64 bg-black border border-emerald-900/30 rounded-2xl p-4 flex flex-col gap-2">
                   <h3 className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-4 border-b border-emerald-900/20 pb-2">Active Frequencies</h3>
                   <ChannelItem label="Field Operatives" active />
                   <ChannelItem label="Clients/Looters" />
                   <ChannelItem label="Security Alerts" />
                </div>
                <div className="flex-1">
                   <EncryptedChat customRoomId="global_hq_broadcast" />
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Nav Tabs */}
      <div className="h-24 border-t-2 border-emerald-500/20 bg-black/80 px-8 flex items-center shrink-0">
        <div className="flex w-full justify-between items-center max-w-4xl mx-auto">
          <NavTab active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} icon={<MapIcon />} label="MONITOR" />
          <NavTab active={activeTab === 'operatives'} onClick={() => setActiveTab('operatives')} icon={<Users />} label="ROSTER" />
          <NavTab active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package />} label="CARGO" />
          <NavTab active={activeTab === 'comms'} onClick={() => setActiveTab('comms')} icon={<MessageSquare />} label="COMMS" />
          <NavTab active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings />} label="SYSTEM" />
        </div>
      </div>
    </div>
  );
}

function NavTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 px-6 py-2 transition-all ${
        active ? 'text-emerald-400 scale-110' : 'text-emerald-900 hover:text-emerald-600'
      }`}
    >
      <div className={`p-2 rounded-xl border-2 transition-colors ${active ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_#106011]' : 'border-transparent'}`}>
         {icon}
      </div>
      <span className="text-[10px] font-mono font-black tracking-[0.2em] uppercase">{label}</span>
    </button>
  );
}

function HUDItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-black/80 border border-emerald-500/30 px-4 py-1.5 rounded-lg backdrop-blur-md">
       <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {children}
       </span>
    </div>
  );
}

function ChannelItem({ label, active }: { label: string, active?: boolean }) {
  return (
    <button className={`w-full text-left p-3 rounded-xl flex items-center justify-between group transition-all ${
      active ? 'bg-emerald-500/10 border border-emerald-500/30' : 'hover:bg-emerald-950/20 border border-transparent'
    }`}>
       <span className={`text-[10px] font-mono uppercase tracking-widest ${active ? 'text-emerald-400 font-black' : 'text-slate-500 group-hover:text-emerald-700'}`}>{label}</span>
       <ChevronRight className={`w-3 h-3 ${active ? 'text-emerald-500' : 'text-slate-800'}`} />
    </button>
  );
}
