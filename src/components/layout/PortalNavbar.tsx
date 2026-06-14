import { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { supabase, isMock } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import { UserRole } from '@/types/domain';

interface PortalNavbarProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
}

export function PortalNavbar({ title, subtitle, icon }: PortalNavbarProps) {
  const { profile } = useAuthStore();

  const handleLogout = async () => {
    if (isMock) {
      useAuthStore.getState().clear();
    } else {
      await supabase.auth.signOut();
    }
  };

  const roleColors: Record<UserRole, string> = {
    super_admin: 'text-red-400',
    admin: 'text-blue-400',
    client: 'text-green-400',
    dropper: 'text-emerald-400',
  };

  const currentRoleColor = profile?.role ? roleColors[profile.role] : 'text-slate-400';

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          {icon}
          {title}
        </h1>
        <p className="text-slate-400 mt-1 pl-11">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
         <div className="text-right hidden sm:block">
           <p className="text-sm font-bold text-white">{profile?.display_name || 'Anonymous'}</p>
           <p className={`text-xs uppercase tracking-wider ${currentRoleColor}`}>
             {profile?.role?.replace('_', ' ') || 'Guest'}
           </p>
         </div>
         <button 
           onClick={handleLogout}
           className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition text-sm font-medium text-slate-200"
         >
           <LogOut size={16} /> Logout
         </button>
      </div>
    </header>
  );
}
