/**
 * @file src/app/App.tsx
 *
 * THE DROP v2 — Premium Mobile Mapping Experience
 * Implements a modern, responsive, highly-polished mobile container with
 * sticky glass headers, bento stats, floating action buttons, and standard
 * bottom tab bars (Grab/GCash style navigation).
 */
import { Component, useState, useEffect, type ReactNode } from 'react';
import { 
  Home as HomeIcon, 
  Map as MapIcon, 
  Package, 
  Bell, 
  User, 
  Plus, 
  Search, 
  Navigation, 
  ChevronRight, 
  ShieldAlert, 
  Activity, 
  Compass, 
  Lock, 
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { GlobalModals } from '@/components/ui/GlobalModals';
import { DropMap } from '@/components/map/DropMap';
import { AuthPage } from '@/features/auth/AuthPage';
import { CreateDropScreen } from '@/features/drops/CreateDropScreen';
import { EpicModal } from '@/components/ui/EpicModal';
import { validateEnv } from '@/lib/env';
import { useAuthStore, useDropStore } from '@/stores';
import { supabase } from '@/lib/supabase';
import type { Drop, DropStatus } from '@/types/domain';

// ── ErrorBoundary ─────────────────────────────────────────────────────────────
interface EBState { hasError: boolean; message: string }
class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false, message: '' };
  static getDerivedStateFromError(err: Error): EBState {
    return { hasError: true, message: err.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#031108] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-[#08150C] border border-red-900/30 rounded-3xl p-6 text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2 font-display">System Interruption</h2>
            <p className="text-slate-400 text-sm font-mono mb-4">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm font-medium hover:opacity-90 transition-all font-display shadow-lg shadow-green-950/20"
            >
              Restart Session
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

// ── Env Check Banner ──────────────────────────────────────────────────────────
function MissingEnvBanner({ missing }: { missing: string[] }) {
  return (
    <div className="min-h-screen bg-[#031108] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-[#08150C] border border-green-900/20 rounded-3xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-green-400 mb-2 font-display">System Configuration Required</h2>
        <p className="text-slate-400 text-sm mb-4">
          The following required environment variables are not loaded. Create a{' '}
          <code className="bg-black/50 text-[#22C55E] px-1.5 py-0.5 rounded font-mono">.env.local</code> file and configure:
        </p>
        <ul className="list-disc list-inside text-[#22C55E] text-sm font-mono space-y-1 bg-black/30 p-3 rounded-xl border border-green-950/30 mb-4">
          {missing.map((k) => <li key={k}>{k}</li>)}
        </ul>
        <p className="text-xs text-slate-500">
          *Note: If you want to bypass cloud sync, you can input mock credentials to configure local preview mode.
        </p>
      </div>
    </div>
  );
}

// ── Main App Container ─────────────────────────────────────────────────────────
const { ok, missing } = validateEnv();

export default function App() {
  const { session, profile, clear } = useAuthStore();
  const { drops, setDrops } = useDropStore();
  const [activeTab, setActiveTab ] = useState<'home' | 'map' | 'drops' | 'alerts' | 'profile'>('map');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsfeed, setNewsfeed] = useState<Array<{ id: string; title: string; body: string; time: string }>>([
    { id: '1', title: 'OPS BROADCAST', body: 'New operational guidelines updated for Occidental Mindoro drop sequences.', time: '10m ago' },
    { id: '2', title: 'GPS SIGNAL CLEAR', body: 'Mamburao satellite coverage is optimal at ±3m precision.', time: '1h ago' },
    { id: '3', title: 'SYSTEM REBOOT', body: 'The Drop v2 tracking engine has been successfully deployed.', time: '2h ago' }
  ]);

  // Sync session and profile immediately from Supabase to store on boot
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        useAuthStore.getState().setSession(session);
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
          if (data) useAuthStore.getState().setProfile(data as any);
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      useAuthStore.getState().setSession(session);
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
          if (data) useAuthStore.getState().setProfile(data as any);
        });
      } else {
        useAuthStore.getState().clear();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync drops to useDropStore so all views read real-time data
  useEffect(() => {
    if (!profile) return;
    const fetchDrops = async () => {
      const { data } = await supabase.from('drops').select('*');
      if (data) setDrops(data as Drop[]);
    };
    fetchDrops();
  }, [profile, setDrops]);

  if (!ok) {
    return <MissingEnvBanner missing={missing} />;
  }

  // If user is not authenticated, render the gorgeous theme login page
  if (!profile) {
    return (
      <ErrorBoundary>
        <AuthPage />
      </ErrorBoundary>
    );
  }

  // Active user details
  const activeDrops = drops.filter(d => d.status === 'active');
  const claimedDrops = drops.filter(d => d.status === 'claimed');
  const expiredDrops = drops.filter(d => d.status === 'expired');

  // Filter drops based on search query
  const filteredRepository = drops.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (d.assigned_to && d.assigned_to.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative flex flex-col justify-between select-none">
        
        {/* Phase 1 — Rebrand sticky brand header with circle logo */}
        <header className="sticky top-0 z-40 p-3 max-w-lg mx-auto w-full">
          <div className="glass-header rounded-3xl p-4 flex items-center justify-between shadow-lg shadow-black/40">
            <div className="flex items-center gap-3">
              {/* Logo fallback or image with zero margin layout */}
              <div className="relative">
                <img
                  src="/logo.png"
                  onError={(e) => {
                    // Failover if logo didn't render
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  className="w-12 h-12 rounded-full border-2 border-emerald-500/30 object-cover shadow-inner"
                  alt="THE DROP"
                />
                {/* Fallback stylized badge */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-800 flex items-center justify-center border-2 border-emerald-400/40 text-white font-bold text-lg font-display shadow-md shadow-emerald-950/40">
                  TD
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full online-indicator" />
                </div>
              </div>

              <div>
                <h1 className="font-extrabold text-xl text-white tracking-tight font-display leading-tight flex items-center gap-1.5">
                  THE DROP <span className="text-xs bg-emerald-500/20 text-[#22C55E] font-mono px-1.5 py-0.5 rounded-md border border-emerald-500/30 uppercase tracking-widest leading-none font-bold">V2</span>
                </h1>
                <p className="text-[10px] text-green-400 font-medium font-sans uppercase tracking-wider flex items-center gap-1">
                  <span>100% Occidental</span>
                  <span className="text-emerald-500/40">•</span>
                  <span>100% Mindoro</span>
                </p>
              </div>
            </div>

            {/* Micro details panel */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-sans uppercase font-semibold leading-none">Operator ID</span>
              <span className="text-xs text-white font-mono font-bold">{profile.display_name?.split(' ')[0] || 'Guest'}</span>
            </div>
          </div>
        </header>

        {/* Phase 3 & 4 — Mobile-first viewport grids wrapper */}
        <main className="flex-1 w-full max-w-lg mx-auto px-3 pt-1 pb-28 flex flex-col justify-start">
          
          {/* TAB 1: HOME PANEL */}
          {activeTab === 'home' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Operator Greeting Card */}
              <div className="glass-card rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                <div className="space-y-1 relative z-10">
                  <p className="text-xs text-green-400 font-semibold uppercase tracking-wider">Welcome back</p>
                  <h2 className="text-2xl font-black text-white font-display tracking-tight">{profile.display_name}</h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Activity size={12} className="text-emerald-500" />
                    Role Clearance: <span className="capitalize font-bold text-emerald-400 font-mono">{profile.role.replace('_', ' ')}</span>
                  </p>
                </div>

                <div className="flex gap-2 mt-4 relative z-10">
                  <div className="flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-800/20 px-3 py-1.5 rounded-full text-xs font-semibold text-[#22C55E]">
                    <Clock size={12} /> Live tracking authorized
                  </div>
                </div>
              </div>

              {/* Phase 9 — Statistics Cards Horizontal scroll bar */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                <div className="glass-card rounded-2xl p-4 min-w-[120px] flex-1 snap-start flex flex-col gap-1 border-r-2 border-r-emerald-500/20">
                  <span className="text-[10px] uppercase font-bold text-green-400 tracking-wider">Active</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-display text-white">{activeDrops.length}</span>
                    <span className="text-xs text-slate-500 font-mono">drops</span>
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-4 min-w-[120px] flex-1 snap-start flex flex-col gap-1 border-r-2 border-r-blue-505/20">
                  <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Claimed</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-display text-white">{claimedDrops.length}</span>
                    <span className="text-xs text-slate-500 font-mono">done</span>
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-4 min-w-[120px] flex-1 snap-start flex flex-col gap-1 border-r-2 border-r-red-500/20">
                  <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Expired</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-display text-white">{expiredDrops.length}</span>
                    <span className="text-xs text-slate-500 font-mono">void</span>
                  </div>
                </div>
              </div>

              {/* Quick Operation Launchers */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest font-display flex items-center gap-1.5">
                  <Compass size={14} className="text-emerald-500" /> Operational shortcuts
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setActiveTab('map')}
                    className="glass-card p-4 rounded-2xl flex flex-col gap-2 items-start justify-between min-h-[100px] hover:border-emerald-500/30 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform duration-200">
                      <MapIcon size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-sm text-white font-display">Radar Map</h4>
                      <p className="text-[10px] text-slate-400">Launch mapping view</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setIsCreateOpen(true)}
                    className="glass-card p-4 rounded-2xl flex flex-col gap-2 items-start justify-between min-h-[100px] hover:border-green-500/30 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0B6E2F]/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform duration-200">
                      <Plus size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-sm text-white font-display">New Drop</h4>
                      <p className="text-[10px] text-slate-400">Deploy coordinate pin</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activity feed */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest font-display flex items-center gap-1.5">
                  <Activity size={14} className="text-emerald-500" /> System Activity Log
                </h3>

                <div className="glass-card rounded-2xl p-4 gap-3">
                  {drops.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">No locations logged. Click map radar to begin.</p>
                  ) : (
                    <div className="space-y-3">
                      {drops.slice(-3).reverse().map((drop) => (
                        <div key={drop.id} className="flex gap-3 justify-between items-center text-xs text-slate-400">
                          <div className="flex gap-2 items-center">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: drop.status === 'active' ? '#10B981' : drop.status === 'claimed' ? '#3B82F6' : '#EF4444' }} />
                            <span className="font-medium text-slate-200 truncate max-w-[160px]">{drop.title}</span>
                          </div>
                          <span className="font-mono text-slate-500 text-[10px]">{drop.status.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MAP PANEL (THE DROP MASTER MAP) */}
          {activeTab === 'map' && (
            <div className="space-y-4 animate-in fade-in duration-200 flex-1 flex flex-col justify-start">
              {/* DropMap itself holds filters, search bar, 55vh map and the horizontal sliders */}
              <div className="flex-1 flex flex-col">
                <DropMap height="53vh" />
              </div>
            </div>
          )}

          {/* TAB 3: DROPS MANAGEMENT PANEL */}
          {activeTab === 'drops' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-white font-display">Repository</h2>
                <p className="text-xs text-slate-400">Search and audit active drop zones in Occidental Mindoro.</p>
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Filter drops by name or operator..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#08150C]/80 backdrop-blur border border-green-900/30 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {filteredRepository.length === 0 ? (
                  <div className="glass-card rounded-2xl p-6 text-center text-slate-500 border border-green-950/15">
                    No matching drop pins found.
                  </div>
                ) : (
                  filteredRepository.map((drop) => (
                    <div 
                      key={drop.id} 
                      className="glass-card rounded-2xl p-4 border-l-4 hover:border-r hover:border-r-emerald-500/10 transition-all"
                      style={{ 
                        borderLeftColor: drop.status === 'active' ? '#10B981' : drop.status === 'claimed' ? '#3B82F6' : '#EF4444' 
                      }}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h3 className="font-bold text-sm text-white font-display">{drop.title}</h3>
                          <div className="font-mono text-[10px] text-[#22C55E] mt-1">
                            GPS: {drop.lat.toFixed(5)}, {drop.lng.toFixed(5)}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold font-mono uppercase bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-900/30 ${
                          drop.status === 'active' ? 'text-green-400' : drop.status === 'claimed' ? 'text-blue-400' : 'text-red-400'
                        }`}>
                          {drop.status}
                        </span>
                      </div>
                      
                      <div className="mt-2 text-xs text-slate-400 border-t border-green-950/30 pt-2 flex justify-between items-center">
                        <span>Assigned to: <code className="text-slate-300 bg-emerald-950/40 px-1 py-0.5 rounded text-[10px]">{drop.assigned_to?.slice(0,8) || 'Unassigned'}</code></span>
                        <span>{new Date(drop.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ALERTS / NOTIFICATIONS FEED */}
          {activeTab === 'alerts' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-white font-display">Command Center</h2>
                  <p className="text-xs text-slate-400">Live operational broadcasts and emergency notifications.</p>
                </div>
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full online-indicator" />
              </div>

              <div className="space-y-3">
                {newsfeed.map((news) => (
                  <div key={news.id} className="glass-card rounded-2xl p-4 border-l-4 border-l-red-500/50">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[10px] font-bold font-display tracking-widest text-[#22C55E] uppercase bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-900/20">
                        {news.title}
                      </span>
                      <span className="text-[10px] text-slate-500">{news.time}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans mt-2">{news.body}</p>
                  </div>
                ))}
              </div>

              {/* Network Status Widget */}
              <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 online-indicator" />
                  <span className="text-xs font-bold text-white">SYSTEM ONLINE</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">PWA VERSION 2.4</span>
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE MANAGER */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Profile Card */}
              <div className="glass-card rounded-3xl p-6 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#0B6E2F]/20 rounded-full blur-xl" />
                
                <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-800 p-1 mb-4 border border-emerald-400/20 shadow-md">
                  <div className="w-full h-full rounded-full bg-black/60 flex items-center justify-center text-4xl font-extrabold text-[#22C55E] font-display">
                    {profile.display_name?.slice(0, 2).toUpperCase() || 'TD'}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white font-display">{profile.display_name}</h3>
                <span className="inline-block mt-1 text-xs px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/30 font-semibold tracking-wider uppercase font-mono">
                  {profile.role.replace('_', ' ')}
                </span>

                <div className="grid grid-cols-2 gap-2 mt-6 text-left border-t border-green-950/30 pt-4">
                  <div className="bg-black/30 p-3 rounded-xl border border-green-950/15">
                    <span className="text-[10px] text-slate-500 block uppercase">Operations</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">{drops.length} total</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-green-950/15">
                    <span className="text-[10px] text-slate-500 block uppercase">Signal ID</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">#{profile.id.slice(0, 5)}</span>
                  </div>
                </div>
              </div>

              {/* Developer / Operations Controls */}
              <div className="space-y-3">
                <button 
                  onClick={clear}
                  className="w-full bg-red-950/50 hover:bg-red-900/30 text-red-400 font-semibold border border-red-900/20 py-3.5 rounded-2xl text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2"
                >
                  Disconnect Radio (Sign Out)
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Phase 8 — Floating Action Button (FAB) (Green gradient + pulse shadow) */}
        {profile && (profile.role === 'admin' || profile.role === 'super_admin') && (
          <button 
            id="fab-create-drop"
            onClick={() => setIsCreateOpen(true)}
            className="fixed bottom-24 right-5 z-[2000] w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-400 hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-950/40 border-2 border-emerald-300/30 transition-transform cursor-pointer"
          >
            <Plus size={28} className="text-white" />
          </button>
        )}

        {/* Phase 3 — Sticky bottom navigation dock (GCash, Uber, Grab high reaches) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto w-full px-3 pb-3">
          <div className="glass-nav rounded-3xl p-2 flex justify-between items-center shadow-2xl relative">
            <button 
              onClick={() => setActiveTab('home')}
              className={`flex-1 flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'home' ? 'text-[#22C55E]' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <HomeIcon size={18} />
              <span className="text-[9px] font-sans font-semibold">Home</span>
            </button>

            <button 
              onClick={() => setActiveTab('map')}
              className={`flex-1 flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'map' ? 'text-[#22C55E]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <MapIcon size={18} />
              <span className="text-[9px] font-sans font-semibold">Map</span>
            </button>

            {/* Inactive gap for FAB spacing if needed, or simple padding */}
            <div className="w-1" />

            <button 
              onClick={() => setActiveTab('drops')}
              className={`flex-1 flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'drops' ? 'text-[#22C55E]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Package size={18} />
              <span className="text-[9px] font-sans font-semibold">Drops</span>
            </button>

            <button 
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer relative ${
                activeTab === 'alerts' ? 'text-[#22C55E]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Bell size={18} />
              <span className="text-[9px] font-sans font-semibold">Alerts</span>
              <span className="absolute top-1.5 right-6 w-1.5 h-1.5 bg-red-400 rounded-full" />
            </button>

            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'profile' ? 'text-[#22C55E]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <User size={18} />
              <span className="text-[9px] font-sans font-semibold">Profile</span>
            </button>
          </div>
        </nav>

        {/* Phase 7 & 8 — Create Drop bottom sheet modal */}
        <EpicModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Deploy Radar Drop"
          variant="bottom-sheet"
        >
          <div className="py-2 text-slate-100">
            <CreateDropScreen />
          </div>
        </EpicModal>

        <GlobalModals />
      </div>
    </ErrorBoundary>
  );
}
