import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { RoleSelector } from '@/components/layout/RoleSelector';
import { ToastProvider } from '@/components/ui/ToastContainer';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load heavy page components
const AuthFlow = lazy(() => import('@/pages/AuthFlow'));
const LoginWithOTP = lazy(() => import('@/pages/LoginWithOTP'));
const ClientRegistration = lazy(() => import('@/pages/ClientRegistration'));
const SuperAdminSetup = lazy(() => import('@/pages/SuperAdminSetup'));
const Unauthorized = lazy(() => import('@/pages/Unauthorized'));
const CreateDropper = lazy(() => import('@/pages/CreateDropper'));

const AdminPortal = lazy(() => import('@/features/portals/AdminPortal'));
const QRConfirmationScreen = lazy(() => import('@/features/drops/QRConfirmationScreen'));

const SuperAdminPanel = lazy(() => import('@/components/panels/SuperAdminPanel').then(m => ({ default: m.SuperAdminPanel })));
const DropperPanel = lazy(() => import('@/components/panels/DropperPanel').then(m => ({ default: m.DropperPanel })));
const ClientPanel = lazy(() => import('@/components/panels/ClientPanel').then(m => ({ default: m.ClientPanel })));

// Test pages
const CaptureTest = lazy(() => import('@/pages/CaptureTest').then(m => ({ default: m.CaptureTest })));
const LocationTest = lazy(() => import('@/pages/LocationTest').then(m => ({ default: m.LocationTest })));
const MapTest = lazy(() => import('@/pages/MapTest').then(m => ({ default: m.MapTest })));

const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center font-mono text-xs uppercase text-blue-400 tracking-widest animate-pulse">
    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping mr-2"></span>
    Synchronizing telemetry...
  </div>
);

export function AppRouter() {
  const setupPath = import.meta.env.VITE_SETUP_ROUTE || "/hidden-super-admin-setup-42";

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<AuthFlow />} />
          <Route path="/register" element={<ClientRegistration />} />
          {/* Obfuscated Setup */}
          <Route path={setupPath} element={<SuperAdminSetup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Test Routes */}
          <Route path="/capture" element={<CaptureTest />} />
          <Route path="/location" element={<LocationTest />} />
          <Route path="/map" element={<MapTest />} />

          {/* Portal Base Routing */}
          <Route path="/" element={<BaseLayout />}>
            <Route index element={<RoleSelector />} />

            {/* Protected Routes */}
            <Route
              path="super-admin"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                  <SuperAdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminPortal />
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
              path="claim/:dropId"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <QRConfirmationScreen />
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
      </Suspense>
    </BrowserRouter>
  );
}
