import { User } from 'lucide-react';
import DropMap from '@/components/map/DropMap';
import { PortalNavbar } from '@/components/layout/PortalNavbar';

export function ClientPortal() {
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 space-y-8">
      <PortalNavbar 
        title="Client Home" 
        subtitle="Secure Pickup & Tracking" 
        icon={<User className="text-green-500" size={32} />} 
      />
      
      <main className="max-w-4xl mx-auto w-full space-y-8">
         <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-white">Your Drops</h2>
            <p className="text-slate-400 text-sm mb-6">Locate your active drops on the map below. Once near, confirm pickup.</p>
            <DropMap height="60vh" />
         </div>
      </main>
    </div>
  );
}
