import { Outlet, Link } from 'react-router-dom';
import { GlobalModals } from '@/components/ui/GlobalModals';
import { Settings, Map as MapIcon, Package, MessageSquare, Activity, Users, ShieldAlert } from 'lucide-react';

export function BaseLayout() {
  return (
    <div className="min-h-screen bg-[--bg-primary] text-[--text-primary] flex font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-16 md:w-20 h-full border-r border-[--border-subtle] glass-nav flex flex-col items-center py-6 gap-8 z-50 shrink-0">
        <Link to="/" className="w-10 h-10 rounded-full bg-[--accent-primary]/20 flex items-center justify-center border border-[--accent-primary]/50 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:scale-105 transition-transform cursor-pointer">
          <ShieldAlert className="w-5 h-5 text-[--accent-primary]" />
        </Link>
        
        <nav className="flex-1 flex flex-col items-center gap-6 w-full">
          <NavItem icon={<MapIcon className="w-5 h-5" />} active tooltip="Live Map" />
          <NavItem icon={<Package className="w-5 h-5" />} tooltip="Inventory" />
          <NavItem icon={<MessageSquare className="w-5 h-5" />} tooltip="Comms" />
          <NavItem icon={<Users className="w-5 h-5" />} tooltip="Agents" />
          <NavItem icon={<Activity className="w-5 h-5" />} tooltip="Analytics" />
        </nav>
        
        <div className="mt-auto">
          <NavItem icon={<Settings className="w-5 h-5" />} tooltip="System" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[--border-subtle] glass-header shrink-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display font-bold tracking-tight text-[--accent-primary] uppercase tracking-widest drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">
              THE DROP SHOP
            </h1>
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[--border-subtle]">
              <span className="w-2 h-2 rounded-full bg-green-500 online-indicator shadow-[0_0_8px_#22c55e]"></span>
              <span className="text-xs font-mono text-[--accent-primary]">SYNDICATE UPLINK: STABLE</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm font-bold text-white">ORION_OVERSEER</span>
              <span className="text-[10px] font-mono text-[--text-secondary]">Super Admin Clearance</span>
            </div>
            <div className="w-8 h-8 rounded border border-[--border-subtle] bg-[--bg-secondary] overflow-hidden">
              <img src="/Appicon.png" alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto custom-scrollbar relative">
          <Outlet />
        </main>
      </div>

      <GlobalModals />
    </div>
  );
}

function NavItem({ icon, active, tooltip }: { icon: React.ReactNode, active?: boolean, tooltip: string }) {
  return (
    <button className={`relative group w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${active ? 'bg-[--accent-primary]/20 text-[--accent-primary] shadow-[inset_0_0_10px_rgba(34,197,94,0.2)] border border-[--accent-primary]/40' : 'text-[--text-secondary] hover:text-white hover:bg-white/5'}`}>
      {icon}
      {/* Tooltip */}
      <span className="absolute left-full ml-4 px-2 py-1 bg-[--bg-secondary] border border-[--border-subtle] text-xs font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {tooltip}
      </span>
    </button>
  );
}
