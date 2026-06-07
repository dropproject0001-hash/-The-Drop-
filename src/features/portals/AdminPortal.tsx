import { Navigation } from 'lucide-react';
import { DropMap } from '@/components/map/DropMap';
import { PortalNavbar } from '@/components/layout/PortalNavbar';

export function AdminPortal() {
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 space-y-8">
      <PortalNavbar 
        title="Dropper Station" 
        subtitle="Field Operations & Delivery Map" 
        icon={<Navigation className="text-blue-500" size={32} />} 
      />
      
      <main className="max-w-6xl mx-auto w-full">
         <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
             <h2 className="text-xl font-bold text-white mb-4">Active Deployments</h2>
             <DropMap height="70vh" />
         </div>
      </main>
    </div>
  );
}
