import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { RoleSelector } from '@/components/layout/RoleSelector';
import { SuperAdminPanel } from '@/components/panels/SuperAdminPanel';
import { DropperPanel } from '@/components/panels/DropperPanel';
import { ClientPanel } from '@/components/panels/ClientPanel';
import LoginWithOTP from '@/pages/LoginWithOTP';

export function AppRouter() {
  console.log('AppRouter rendering');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BaseLayout />}>
          <Route index element={<RoleSelector />} />
          <Route path="super-admin" element={<SuperAdminPanel />} />
          <Route path="dropper" element={<DropperPanel />} />
          <Route path="client" element={<ClientPanel />} />
          <Route path="login-otp" element={<LoginWithOTP />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
