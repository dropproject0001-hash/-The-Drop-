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

function BackgroundSync() {
  useEffect(() => {
    const flushQueue = async () => {
      const queued = await LocationOutbox.getAll();
      for (const item of queued) {
        try {
          await supabase.functions.invoke('broadcast-location', { body: item.payload });
          await LocationOutbox.remove(item.id!);
        } catch {
          await LocationOutbox.incrementAttempts(item.id!);
        }
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
              <AppRouter />
              {showDebug && <LocationDebugPanel />}
            </ToastProvider>
          </RoleProvider>
        </AuthProvider>
      </EnvChecker>
    </ErrorBoundary>
  );
}

