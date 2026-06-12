import { useEffect } from 'react';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { EnvChecker } from './providers/EnvChecker';
import { AuthProvider } from './providers/AuthContext';
import { AppRouter } from './router/AppRouter';
import { RoleProvider } from '../context/RoleContext';
import { LocationOutbox } from '../services/LocationOutbox';
import { supabase } from '../lib/supabase';
import { LocationDebugPanel } from '../components/debug/LocationDebugPanel';
import { ToastProvider } from '@/components/ui/ToastContainer';

import { InstallBanner } from '@/components/ui/InstallBanner';

function BackgroundSync() {
  useEffect(() => {
    const flushQueue = async () => {
      try {
        await LocationOutbox.flush();
      } catch (err) {
        console.warn('[BackgroundSync] Auto-flush error:', err);
      }
    };

    const interval = setInterval(flushQueue, 15000); // every 15s
    window.addEventListener('online', flushQueue);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', flushQueue);
    };
  }, []);
  
  return null;
}

export default function App() {
  console.log('🔄 [App.tsx] Rendering App root component...');
  const showDebug = import.meta.env.DEV || localStorage.getItem('show_location_debug') === 'true';

  return (
    <ErrorBoundary>
      <EnvChecker>
        <AuthProvider>
          <RoleProvider>
            <ToastProvider>
              <BackgroundSync />
              <InstallBanner />
              <AppRouter />
              {showDebug && <LocationDebugPanel />}
            </ToastProvider>
          </RoleProvider>
        </AuthProvider>
      </EnvChecker>
    </ErrorBoundary>
  );
}

