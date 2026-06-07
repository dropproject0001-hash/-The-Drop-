import { ShieldAlert } from 'lucide-react';
import { DropMap } from '@/components/map/DropMap';
import { SuperAdminAccountManagement } from '@/features/admin/SuperAdminAccountManagement';
import { TransactionHistoryList } from '@/features/transactions/TransactionHistoryList';
import { PortalNavbar } from '@/components/layout/PortalNavbar';

export function SuperAdminPortal() {
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 space-y-8">
      <PortalNavbar 
        title="Super Admin Portal" 
        subtitle="Command Center & Overhead View" 
        icon={<ShieldAlert className="text-red-500" size={32} />} 
      />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
             <h2 className="text-xl font-bold text-white mb-4">Live Drone View</h2>
             <DropMap height="600px" />
          </div>
          <TransactionHistoryList />
        </div>
        <div className="space-y-8">
          <SuperAdminAccountManagement />
        </div>
      </div>
    </div>
  );
}
