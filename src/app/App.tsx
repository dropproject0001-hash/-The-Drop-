import { ErrorBoundary } from './providers/ErrorBoundary';
import { EnvChecker } from './providers/EnvChecker';
import { AppRouter } from './router/AppRouter';

export default function App() {
  return (
    <ErrorBoundary>
      <EnvChecker>
        <AppRouter />
      </EnvChecker>
    </ErrorBoundary>
  );
}
