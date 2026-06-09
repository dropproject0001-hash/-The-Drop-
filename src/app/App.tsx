import { ErrorBoundary } from './providers/ErrorBoundary';
import { EnvChecker } from './providers/EnvChecker';
import { AuthProvider } from './providers/AuthContext';
import { AppRouter } from './router/AppRouter';
import { RoleProvider } from '../context/RoleContext';

export default function App() {
  console.log('🔄 [App.tsx] Rendering App root component...');
  return (
    <ErrorBoundary>
      <EnvChecker>
        <AuthProvider>
          <RoleProvider>
            <AppRouter />
          </RoleProvider>
        </AuthProvider>
      </EnvChecker>
    </ErrorBoundary>
  );
}

