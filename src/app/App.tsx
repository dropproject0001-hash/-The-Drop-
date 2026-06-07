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
import { supabase } from '@/lib/supabase';

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

function MainAppShell() {
  const { profile, loading, isSuperAdmin, isAdmin, isClient } = useProfile();
  const { session } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
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

  // Route to the appropriate portal
  if (isSuperAdmin) {
    return (
      <>
        <SuperAdminPortal />
        <GlobalModals />
      </>
    );
  }
  if (isAdmin) {
    return (
      <>
        <AdminPortal />
        <GlobalModals />
      </>
    );
  }
  if (isClient) {
    return (
      <>
        <ClientPortal />
        <GlobalModals />
      </>
    );
  }

  // Fallback if role is not recognized but session/profile exists
  return (
    <div className="min-h-screen bg-card flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-lg">
        <h2 className="text-xl font-bold text-white mb-2">Unauthorized Connection</h2>
        <p className="text-slate-400 text-sm mb-6">
          Your profile does not have a recognized operational role ("{profile.role}"). Please contact the control center.
        </p>
        <button
          onClick={async () => {
            const envMeta = (import.meta as any).env || {};
            if ((supabase as any).supabaseUrl?.includes('mock') || envMeta.VITE_SUPABASE_URL?.includes('mock')) {
              useAuthStore.getState().clear();
            } else {
              await supabase.auth.signOut();
            }
          }}
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white rounded-xl text-sm font-medium transition"
        >
          Disconnect Radio
        </button>
      </div>
    </div>
  );
}
