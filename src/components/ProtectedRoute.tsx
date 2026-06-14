import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'super_admin' | 'admin' | 'dropper' | 'client'>;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { role, loading } = useRole();
  
  console.log('[ProtectedRoute] Role:', role, 'Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-xs font-mono uppercase tracking-widest text-emerald-500 animate-pulse">
            Decrypting Security Clearance...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!role) {
    return <Navigate to="/auth" replace />;
  }

  // Role restriction
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
