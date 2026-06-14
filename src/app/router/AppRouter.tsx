import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BaseLayout } from '@/components/layout/BaseLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { RoleRouter } from "./RoleRouter";
const AuthFlow = React.lazy(() => import('@/pages/AuthFlow'));
const ClientRegistration = React.lazy(() => import('@/pages/ClientRegistration'));
const SuperAdminSetup = React.lazy(() => import('@/pages/SuperAdminSetup'));
const Unauthorized = React.lazy(() => import('@/pages/Unauthorized'));
const SuperAdminDashboard = React.lazy(() => import('@/pages/SuperAdminDashboard'));

const SuperAdminPanel = React.lazy(() => import('@/components/panels/SuperAdminPanel').then(m => ({ default: m.SuperAdminPanel })));
const DropperPanel = React.lazy(() => import('@/components/panels/DropperPanel').then(m => ({ default: m.DropperPanel })));
const ClientPanel = React.lazy(() => import('@/components/panels/ClientPanel').then(m => ({ default: m.ClientPanel })));
const QRConfirmationScreen = React.lazy(() => import('@/features/drops/QRConfirmationScreen'));
const CreateDropper = React.lazy(() => import('@/pages/CreateDropper'));
const LoginWithOTP = React.lazy(() => import('@/pages/LoginWithOTP'));
const CaptureTest = React.lazy(() => import('@/pages/CaptureTest').then(m => ({ default: m.CaptureTest })));
const LocationTest = React.lazy(() => import('@/pages/LocationTest').then(m => ({ default: m.LocationTest })));
const MapTest = React.lazy(() => import('@/pages/MapTest').then(m => ({ default: m.MapTest })));

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <LoadingSpinner size="lg" text="ESTABLISHING TACTICAL UPLINK..." />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<AuthFlow />} />
          <Route path="/register" element={<ClientRegistration />} />

          {/* Setup (Admin Only path) */}
          <Route path={import.meta.env.VITE_SETUP_ROUTE || "/hidden-super-admin-setup-42"} element={<SuperAdminSetup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Test Routes (Dev Only) */}
          {import.meta.env.DEV && (
            <>
              <Route path="/capture" element={<CaptureTest />} />
              <Route path="/location" element={<LocationTest />} />
              <Route path="/map" element={<MapTest />} />
              <Route path="/login-otp" element={<LoginWithOTP />} />
            </>
          )}

          {/* Portal Base Routing */}
          <Route path="/" element={<BaseLayout />}>
            <Route index element={<RoleRouter />} />
            
            {/* Boss Portals */}
            <Route 
              path="super-admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Dropper Portals */}
            <Route 
              path="dropper" 
              element={
                <ProtectedRoute allowedRoles={['dropper']}>
                  <DropperPanel />
                </ProtectedRoute>
              } 
            />

            {/* Client Portals */}
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

            {/* Management */}
            <Route 
              path="create-dropper" 
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                  <CreateDropper />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
