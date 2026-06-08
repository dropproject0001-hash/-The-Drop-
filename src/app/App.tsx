/**
 * @file src/app/App.tsx
 *
 * FIX L-2: ErrorBoundary wraps the entire app so render/effect crashes
 *           show a user-visible error rather than a blank screen.
 * FIX C-1: env validation is now shown as a UI error instead of crashing
 *           before React renders.
 */
import { Component, type ReactNode } from 'react';
import { GlobalModals } from '@/components/ui/GlobalModals';
import { validateEnv } from '@/lib/env';
import { useProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/stores';
import { AuthPage } from '@/features/auth/AuthPage';
import { SuperAdminPortal } from '@/features/portals/SuperAdminPortal';
import { AdminPortal } from '@/features/portals/AdminPortal';
import { ClientPortal } from '@/features/portals/ClientPortal';
import { supabase, isMock } from '@/lib/supabase';

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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-red-950 border border-red-700 rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold text-red-300 mb-2">Application Error</h2>
            <p className="text-red-400 text-sm font-mono">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-xl bg-red-700 text-white text-sm hover:bg-red-600"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Env Check ─────────────────────────────────────────────────────────────────
function MissingEnvBanner({ missing }: { missing: string[] }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-amber-950 border border-amber-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-amber-300 mb-2">Missing Configuration</h2>
        <p className="text-amber-400 text-sm mb-3">
          The following required environment variables are not set. Create a{' '}
          <code className="bg-amber-900 px-1 rounded">.env.local</code> file and add:
        </p>
        <ul className="list-disc list-inside text-amber-300 text-sm font-mono space-y-1">
          {missing.map((k) => <li key={k}>{k}=YOUR_VALUE</li>)}
        </ul>
      </div>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
const { ok, missing } = validateEnv();

export default function App() {
  if (!ok) {
    return <MissingEnvBanner missing={missing} />;
  }

  return (
    <ErrorBoundary>
      <MainAppShell />
    </ErrorBoundary>
  );
}

import { useState, useEffect } from 'react';
import { 
  Home, 
  Map as MapIcon, 
  Package, 
  Bell, 
  User, 
  LogOut, 
  Plus, 
  ShieldAlert, 
  Activity,
  CheckCircle2,
  Clock,
  Navigation
} from 'lucide-react';
import { DropMap } from '@/components/map/DropMap';
import { CreateDropScreen } from '@/features/drops/CreateDropScreen';
import { SuperAdminAccountManagement } from '@/features/admin/SuperAdminAccountManagement';
import { TransactionHistoryList } from '@/features/transactions/TransactionHistoryList';

function MainAppShell() {
  const { profile, loading, isSuperAdmin, isAdmin, isClient } = useProfile();
  const { session } = useAuthStore();
  const [currentTab, setCurrentTab] = useState<'home' | 'map' | 'drops' | 'alerts' | 'profile'>('home');
  const [stats, setStats] = useState({ active: 0, claimed: 0, expired: 0 });

  // Real-time stats counting directly synced with Supabase or mock fallback
  useEffect(() => {
    if (!session || !profile) return;
    
    if (isMock) {
      // Set realistic mock counts for mock environments
      setStats({ active: 4, claimed: 12, expired: 2 });
      return;
    }

    const fetchStats = async () => {
      const { data } = await supabase.from('drops').select('status');
      if (data) {
        const counts = { active: 0, claimed: 0, expired: 0 };
        data.forEach((row: any) => {
          if (row.status === 'active') counts.active++;
          else if (row.status === 'claimed') counts.claimed++;
          else if (row.status === 'expired') counts.expired++;
        });
        setStats(counts);
      }
    };
    fetchStats();

    const channel = supabase
      .channel('drops-app-stats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drops' },
        fetchStats
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, profile]);

  const handleLogout = async () => {
    if (isMock) {
      useAuthStore.getState().clear();
    } else {
      await supabase.auth.signOut();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-emerald-400 text-sm font-medium">Initializing communication link...</p>
        </div>
      </div>
    );
  }

  // If we have no session or profile, show the beautiful Login page
  if (!session || !profile) {
    return <AuthPage />;
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Header Area */}
            <div className="flex justify-between items-start border-b border-emerald-950/40 pb-4">
              <div>
                <h1 className="text-2xl font-black font-display text-emerald-400 tracking-wider">THE DROP 👽</h1>
                <p className="text-[10px] font-mono tracking-widest text-emerald-500/80 uppercase">100% OCCIDENTAL • 100% MINDORO</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded">
                  OPERATOR ID: {isSuperAdmin ? 'Super' : isAdmin ? 'Admin' : 'Client'}
                </span>
              </div>
            </div>

            {/* Operator Welcome Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
              <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">
                {isClient ? 'Authorized Client' : 'Welcome Back'}
              </span>
              <h2 className="text-2xl font-bold font-display text-white mt-1">{profile.display_name || 'Anonymous Node'}</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 online-indicator"></span>
                {isSuperAdmin 
                  ? 'Role Clearance: Super Admin / Live tracking authorized' 
                  : isAdmin 
                    ? 'Role Clearance: Admin / Live operations' 
                    : `CLIENT OPERATIONS / SIGNAL ID #mock-${profile.id?.slice(0, 6)}`}
              </p>
            </div>

            {/* Counters (Stats Grid) */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 pl-1">OPERATIONAL COUNTERS</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 text-center hover:border-emerald-500/25 transition">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Active</span>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{stats.active} drops</p>
                </div>
                <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 text-center hover:border-blue-500/25 transition">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Claimed</span>
                  <p className="text-xl font-bold text-blue-400 mt-1">{stats.claimed} done</p>
                </div>
                <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 text-center hover:border-red-500/25 transition">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Expired</span>
                  <p className="text-xl font-bold text-red-400 mt-1">{stats.expired} void</p>
                </div>
              </div>
            </div>

            {/* Operational Shortcuts */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 pl-1">OPERATIONAL SHORTCUTS</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setCurrentTab('map')}
                  className="bg-slate-900 border border-slate-800/60 hover:border-emerald-500/30 p-4 rounded-xl text-left transition group active:scale-95 shadow-md"
                >
                  <span className="text-2xl mb-1 block">🗺️</span>
                  <span className="font-bold text-sm text-white block group-hover:text-emerald-400">Radar Map</span>
                  <span className="text-[10px] text-slate-500">View live overhead drone tags</span>
                </button>
                <button 
                  onClick={() => setCurrentTab('drops')}
                  className="bg-slate-900 border border-slate-800/60 hover:border-emerald-500/30 p-4 rounded-xl text-left transition group active:scale-95 shadow-md"
                >
                  <span className="text-2xl mb-1 block">📍</span>
                  <span className="font-bold text-sm text-white block group-hover:text-emerald-400">Deploy Drop</span>
                  <span className="text-[10px] text-slate-500">Deploy a secure drop container</span>
                </button>
              </div>
            </div>

            {/* System Activity Logs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Activity size={14} className="text-emerald-500" /> SYSTEM ACTIVITY LOG
              </h3>
              <div className="space-y-3.5 font-mono text-xs">
                <div className="flex gap-3 text-slate-400">
                  <span className="text-emerald-500">[17:22]</span>
                  <span>CONTROL: Safe authorization handshake finished.</span>
                </div>
                <div className="flex gap-3 text-slate-400">
                  <span className="text-emerald-500">[17:15]</span>
                  <span>GPS: Core telemetry node is ready offline.</span>
                </div>
                <div className="flex gap-3 text-slate-400">
                  <span className="text-emerald-500">[16:50]</span>
                  <span>PWA: Tile block cache validation active.</span>
                </div>
              </div>
            </div>

            {/* Client portal sign out container */}
            {isClient && (
              <div className="pt-4">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 hover:border-red-800 text-red-400 rounded-xl font-mono text-xs uppercase tracking-wider transition-all"
                >
                  <LogOut size={16} /> Disconnect Radio (Sign Out)
                </button>
              </div>
            )}
          </div>
        );

      case 'map':
        return (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 online-indicator"></span>
                Active Deployments Map
              </h2>
              <DropMap height="min(70vh, 700px)" />
            </div>
          </div>
        );

      case 'drops':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h1 className="text-xl font-bold text-white">Deployments Console</h1>
              <p className="text-xs text-slate-400 mt-1">Manage physical package drops and secure transfers.</p>
            </div>
            {(isAdmin || isSuperAdmin) ? (
              <CreateDropScreen />
            ) : (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
                <Package className="text-emerald-500 mx-auto" size={40} />
                <h3 className="text-base font-bold text-white">Secured Drop Container Access</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  As a client, locate assigned markers on the Radar Map. Once near, choose pickup to scan your secure QR authentication.
                </p>
                <button 
                  onClick={() => setCurrentTab('map')}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold tracking-wide transition"
                >
                  Open Radar Map
                </button>
              </div>
            )}
          </div>
        );

      case 'alerts':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h1 className="text-xl font-bold text-white">System Logs & Transaction History</h1>
              <p className="text-xs text-slate-400 mt-1">Audit trail monitoring active operations within the hub.</p>
            </div>
            <TransactionHistoryList />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
              <h2 className="text-lg font-bold text-white">Radio Node Profile</h2>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 text-sm border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400 font-mono text-xs">DISPLAY NAME</span>
                  <span className="text-white font-medium text-right">{profile.display_name || 'Not Available'}</span>
                </div>
                <div className="grid grid-cols-2 text-sm border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400 font-mono text-xs">AUTHORIZED ROLE</span>
                  <span className="text-emerald-400 font-bold text-right uppercase tracking-wider">{profile.role?.replace('_', ' ')}</span>
                </div>
                <div className="grid grid-cols-2 text-sm border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400 font-mono text-xs">TELEMETRY STATUS</span>
                  <span className="text-emerald-400 text-right font-medium flex items-center justify-end gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 online-indicator"></span> Transmitting Live
                  </span>
                </div>
                <div className="grid grid-cols-2 text-sm pb-2">
                  <span className="text-slate-400 font-mono text-xs">IDENTIFIER ID</span>
                  <span className="text-slate-400 font-mono text-xs text-right truncate pl-4">{profile.id}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-900 border border-red-700 hover:bg-red-800 text-white rounded-xl text-sm font-semibold transition"
                >
                  <LogOut size={16} /> Disconnect Radio (Sign Out)
                </button>
              </div>
            </div>

            {isSuperAdmin && <SuperAdminAccountManagement />}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pb-24 text-slate-100 font-sans p-4 md:p-8 flex flex-col w-full max-w-4xl mx-auto">
      {/* Main Tab View */}
      <main className="flex-1 w-full flex flex-col pt-2">
        {renderTabContent()}
      </main>

      {/* Floating Plus action button for quick creation */}
      {(isSuperAdmin || isAdmin) && currentTab !== 'drops' && (
        <button 
          onClick={() => setCurrentTab('drops')}
          className="fixed bottom-20 right-6 z-[4000] w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all text-xl font-bold"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 py-3.5 px-6 flex justify-around items-center z-[5000]">
        <button 
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center gap-1.5 transition ${currentTab === 'home' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Home size={18} />
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Home</span>
        </button>
        <button 
          onClick={() => setCurrentTab('map')}
          className={`flex flex-col items-center gap-1.5 transition ${currentTab === 'map' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <MapIcon size={18} />
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Map</span>
        </button>
        <button 
          onClick={() => setCurrentTab('drops')}
          className={`flex flex-col items-center gap-1.5 transition ${currentTab === 'drops' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Package size={18} />
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Drops</span>
        </button>
        <button 
          onClick={() => setCurrentTab('alerts')}
          className={`flex flex-col items-center gap-1.5 transition ${currentTab === 'alerts' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Bell size={18} />
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Alerts</span>
        </button>
        <button 
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center gap-1.5 transition ${currentTab === 'profile' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <User size={18} />
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Profile</span>
        </button>
      </nav>
    </div>
  );
}
