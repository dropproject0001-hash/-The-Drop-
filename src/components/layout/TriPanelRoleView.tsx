import { SuperAdminPanel } from '@/components/panels/SuperAdminPanel';
import { DropperPanel } from '@/components/panels/DropperPanel';
import { ClientPanel } from '@/components/panels/ClientPanel';

export function TriPanelRoleView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-full min-h-[max(calc(100vh-64px),800px)] bg-transparent">
      <SuperAdminPanel />
      <DropperPanel />
      <ClientPanel />
    </div>
  );
}

