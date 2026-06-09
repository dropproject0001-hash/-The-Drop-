import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { RoleSelector } from '@/components/layout/RoleSelector';
import { SuperAdminPanel } from '@/components/panels/SuperAdminPanel';
import { DropperPanel } from '@/components/panels/DropperPanel';
import { ClientPanel } from '@/components/panels/ClientPanel';
import LoginWithOTP from '@/pages/LoginWithOTP';
import AuthFlow from '@/pages/AuthFlow';
import ClientRegistration from '@/pages/ClientRegistration';
import CreateDropper from '@/pages/CreateDropper';
import SuperAdminSetup from '@/pages/SuperAdminSetup';
import Unauthorized from '@/pages/Unauthorized';
import ProtectedRoute from '@/components/ProtectedRoute';

export function AppRouter() {
  console.log('AppRouter rendering');
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthFlow />} />
        <Route path="/register" element={<ClientRegistration />} />
        <Route path="/super-admin-setup" element={<SuperAdminSetup />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Portal Base Routing */}
        <Route path="/" element={<BaseLayout />}>
          <Route index element={<RoleSelector />} />
          
          {/* Protected Routes */}
          <Route 
            path="super-admin" 
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="dropper" 
            element={
              <ProtectedRoute allowedRoles={['dropper']}>
                <DropperPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="client" 
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="create-dropper" 
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <CreateDropper />
              </ProtectedRoute>
            } 
          />
          <Route path="login-otp" element={<LoginWithOTP />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
