import { ErrorBoundary } from './providers/ErrorBoundary';
import { EnvChecker } from './providers/EnvChecker';
import { AuthProvider } from './providers/AuthContext';
import { AppRouter } from './router/AppRouter';

export default function App() {
  console.log('🔄 [App.tsx] Rendering App root component...');
  return (
    <ErrorBoundary>
      <EnvChecker>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </EnvChecker>
    </ErrorBoundary>
  );
}

