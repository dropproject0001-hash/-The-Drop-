import { useState, useEffect } from 'react';
import { Users, Shield, Terminal, ShoppingCart, Search, Filter, MoreVertical, Ban, Trash2, Edit2, CheckCircle2, X, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/ToastContainer';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  username: string | null;
  role: 'super_admin' | 'admin' | 'dropper' | 'client';
  alias: string | null;
  display_name: string | null;
  phone: string | null;
  status: 'active' | 'suspended';
  is_online: boolean;
  last_seen: string;
  created_at: string;
}

export function UserRosterView() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [filter, setFilter] = useState<'all' | 'admin' | 'dropper' | 'client'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;
      setUsers(data as Profile[] || []);
    } catch (err: any) {
      console.error('[Roster] Fetch Error:', err);
      showToast('Failed to load user roster', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: Profile['role']) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast(`User role updated to ${newRole}`, { type: 'success' });
    } catch (err: any) {
      showToast(err.message || 'Update failed', { type: 'error' });
    }
  };

  const handleStatusUpdate = async (userId: string, newStatus: Profile['status']) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      showToast(`User status updated to ${newStatus}`, { type: 'success' });
    } catch (err: any) {
      showToast(err.message || 'Update failed', { type: 'error' });
    }
  };

  const handleDeleteAccount = async (user: Profile) => {
    const confirm = window.confirm(`DANGER: Permanently delete operative ${user.username || user.id}? This action cannot be undone.`);
    if (!confirm) return;

    try {
      // In a real app, this would call an Edge Function to delete from Auth too
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) throw error;
      
      setUsers(prev => prev.filter(u => u.id !== user.id));
      showToast(`Record for ${user.username} purged from system`, { type: 'success' });
    } catch (err: any) {
      showToast(err.message || 'Delete failed', { type: 'error' });
    }
  };

  const filteredUsers = users.filter(u => {
    const roleMatch = filter === 'all' || u.role === filter;
    const searchMatch = !search || 
      u.username?.toLowerCase().includes(search.toLowerCase()) || 
      u.alias?.toLowerCase().includes(search.toLowerCase()) ||
      u.id.includes(search);
    return roleMatch && searchMatch;
  });

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'JUST_NOW';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}M_AGO`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}H_AGO`;
    const days = Math.floor(hours / 24);
    return `${days}D_AGO`;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin': 
        return { color: 'border-red-600 bg-red-950/20 text-red-500', icon: <Shield size={10} />, label: 'SYSTEM_ROOT' };
      case 'admin': 
        return { color: 'border-blue-600 bg-blue-950/20 text-blue-400', icon: <Shield size={10} />, label: 'ADMIN_NODE' };
      case 'dropper': 
        return { color: 'border-[#106011] bg-[#106011]/20 text-emerald-400', icon: <Terminal size={10} />, label: 'DROPPER' };
      case 'client': 
        return { color: 'border-amber-600 bg-amber-950/20 text-amber-500', icon: <ShoppingCart size={10} />, label: 'CLIENT' };
      default: 
        return { color: 'border-zinc-700 bg-zinc-900 text-zinc-400', icon: <Users size={10} />, label: 'UNKNOWN' };
    }
  };

  return (
    <div className="p-6 text-[#106011] space-y-6 select-none h-[calc(100vh-80px)] overflow-hidden flex flex-col">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#106011]/30 pb-6 relative z-10">
        <div>
          <span className="text-[9px] font-mono tracking-[0.25em] bg-[#106011]/15 px-2.5 py-1 rounded border border-[#106011]/30 uppercase font-black">
            Secured Personnel Ledger
          </span>
          <h2 className="text-2xl font-display font-black tracking-[0.15em] uppercase text-white drop-shadow-[0_0_12px_rgba(16,96,17,0.85)] mt-2">
            ACCOUNT ROSTER DB
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 group-focus-within:text-emerald-400 transition-colors" />
            <input 
              placeholder="SEARCH AGENT / ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/60 border-2 border-[#106011]/30 focus:border-[#106011] rounded-xl pl-10 pr-4 py-2 font-mono text-xs text-white uppercase tracking-widest outline-none transition-all placeholder:text-emerald-950 animate-glow"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-black/40 border-2 border-[#106011]/30 rounded-xl">
            {(['all', 'admin', 'dropper', 'client'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[9px] font-black tracking-widest uppercase transition-all ${
                  filter === f 
                    ? 'bg-[#106011] text-black shadow-[0_0_10px_rgba(16,96,17,0.5)]' 
                    : 'text-emerald-600 hover:text-emerald-400 hover:bg-[#106011]/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button 
            onClick={fetchUsers}
            className="p-2.5 bg-[#106011]/10 border-2 border-[#106011]/40 rounded-xl text-emerald-500 hover:bg-[#106011]/20 hover:border-[#106011] transition-all shadow-sm"
            title="Refresh Ledger"
          >
            <Users size={16} />
          </button>

          <button 
            onClick={() => navigate('/create-dropper')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-[#106011]/20 border-2 border-[#106011] rounded-xl text-[9px] font-mono font-black tracking-[0.2em] text-white hover:bg-[#106011]/40 transition-all shadow-[0_0_15px_rgba(16,96,17,0.3)]"
          >
            <UserPlus size={14} />
            INITIALIZE NODE
          </button>
        </div>
      </div>

      {/* Main Roster List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-12 h-12 border-4 border-[#106011]/20 border-t-[#0ad111] rounded-full animate-spin shadow-[0_0_15px_rgba(10,209,17,0.3)]"></div>
            <span className="font-mono text-xs text-[#106011] animate-pulse uppercase tracking-[0.3em]">Querying Database...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#106011]/20 rounded-2xl">
            <Ban size={48} className="text-emerald-950/40 mb-3" />
            <span className="font-mono text-xs text-emerald-950 uppercase tracking-[0.2em]">No records found matching criteria</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((user) => {
                const badge = getRoleBadge(user.role);
                const isOnline = user.is_online;
                
                return (
                  <motion.div
                    key={user.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-black/80 border-2 border-[#106011]/40 hover:border-[#106011] hover:shadow-[0_0_25px_rgba(16,96,17,0.2)] rounded-2xl p-5 transition-all relative overflow-hidden"
                  >
                    {/* HUD Decorations */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#106011]/30 group-hover:border-[#106011] transition-colors rounded-tl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#106011]/30 group-hover:border-[#106011] transition-colors rounded-br-lg"></div>

                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center p-0.5 ${badge.color}`}>
                          <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-display font-black text-xs">
                            {user.username?.substring(0, 2).toUpperCase() || '??'}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <h3 className="text-white font-display font-black tracking-widest text-sm uppercase truncate max-w-[120px]">
                               {user.username || 'ANONYMOUS'}
                             </h3>
                             {isOnline ? (
                               <motion.div 
                                 animate={{ opacity: [0.4, 1, 0.4] }}
                                 transition={{ duration: 2, repeat: Infinity }}
                                 className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" 
                               />
                             ) : user.status === 'suspended' ? (
                               <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_#dc2626]" />
                             ) : null}
                          </div>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[8px] font-mono font-black tracking-widest uppercase mt-1 ${badge.color}`}>
                            {badge.icon}
                            {badge.label}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-tighter">NODE_ID: {user.id.substring(0, 8)}...</span>
                        <div className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${
                          user.status === 'suspended' ? 'border-red-900 text-red-500 bg-red-950/20' :
                          isOnline ? 'border-emerald-900 text-emerald-500' : 'border-zinc-700 text-zinc-500'
                        }`}>
                          {user.status === 'suspended' ? 'NODE_LOCKED' : isOnline ? 'UPLINK_LIVE' : 'OFFLINE'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-[#106011]/10 pt-4">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-zinc-600 uppercase">ALIAS/CODENAME</span>
                        <span className="text-white tracking-widest">{user.alias || 'NOT_SET'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-zinc-600 uppercase">PHONE_UPLINK</span>
                        <span className="text-white tracking-widest">{user.phone || 'NO_COMMS'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono">
                         <span className="text-zinc-600 uppercase">LAST_SEEN</span>
                         <span className={`tracking-widest ${isOnline ? 'text-emerald-500' : 'text-white'}`}>
                           {isOnline ? 'SYNCHRONIZED' : getTimeAgo(user.last_seen)}
                         </span>
                      </div>
                    </div>

                    {/* Action Overlay */}
                    <div className="mt-5 flex gap-2">
                      <button 
                        onClick={() => handleRoleUpdate(user.id, user.role === 'dropper' ? 'admin' : 'dropper')}
                        disabled={user.role === 'super_admin'}
                        className={`flex-1 h-8 rounded-lg border flex items-center justify-center gap-2 font-mono text-[9px] font-black uppercase tracking-widest transition-all ${
                          user.role === 'super_admin' 
                            ? 'opacity-20 cursor-not-allowed' 
                            : 'border-[#106011]/40 text-[#106011] hover:bg-[#106011]/20'
                        }`}
                      >
                        <Shield size={12} />
                        LEVEL SHIFT
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(user.id, user.status === 'active' ? 'suspended' : 'active')}
                        disabled={user.role === 'super_admin'}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                          user.role === 'super_admin' ? 'opacity-20 cursor-not-allowed' :
                          user.status === 'active' 
                            ? 'border-red-900/40 text-red-900 hover:border-red-600 hover:text-red-500 shadow-[inset_0_0_10px_rgba(220,38,38,0.05)]' 
                            : 'border-emerald-600 text-emerald-500 hover:bg-emerald-600 hover:text-black'
                        }`}
                        title={user.status === 'active' ? 'Suspend Node' : 'Restore Node'}
                      >
                        {user.status === 'active' ? <Ban size={12} /> : <CheckCircle2 size={12} />}
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(user)}
                        disabled={user.role === 'super_admin'}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                          user.role === 'super_admin'
                            ? 'opacity-20 cursor-not-allowed'
                            : 'border-red-900/40 text-red-500 hover:bg-red-900/20 hover:border-red-600'
                        }`}
                        title="Purge Record"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Scanline effect on hover */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-b from-transparent via-[#106011]/5 to-transparent h-20 -top-20 pointer-events-none group-hover:block hidden"
                      animate={{ top: ['0%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="h-8 border-t border-[#106011]/30 flex items-center justify-between px-2 opacity-50">
        <div className="flex gap-4 text-[7px] font-mono tracking-widest uppercase">
          <span>Total Nodes: {users.length}</span>
          <span className="text-emerald-500">Live: {users.filter(u => u.is_online).length}</span>
          <span className="text-red-500">Suspended: {users.filter(u => u.status === 'suspended').length}</span>
        </div>
        <span className="text-[7px] font-mono tracking-widest uppercase">Encrypted Personnel Buffer v4.2.0</span>
      </div>
    </div>
  );
}
