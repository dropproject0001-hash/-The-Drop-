import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function RoleRouter() {
  const { session, profile, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="VERIFYING CREDENTIALS..." />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Boss Hierarchy: super_admin and admin are same role
  if (profile.role === 'super_admin' || profile.role === 'admin') {
    return <Navigate to="/super-admin" replace />;
  }

  switch (profile.role) {
    case 'dropper':
      return <Navigate to="/dropper" replace />;
    case 'client':
      return <Navigate to="/client" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}
