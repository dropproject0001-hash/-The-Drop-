import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores';
import { useToast } from '@/components/ui/ToastContainer';
import { CreateBulletinModal } from '../components/panels/CreateBulletinModal';

interface Analytics {
  totalUsers: number;
  totalDroppers: number;
  activeDrops: number;
  completedDrops: number;
}

type Role = 'super_admin' | 'dropper' | 'client';

interface User {
  id: string;
  email?: string;
  phone?: string;
  alias?: string | null;
  username?: string | null;
  role: Role;
  created_at: string;
}

export default function SuperAdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    totalDroppers: 0,
    activeDrops: 0,
    completedDrops: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<Role>('dropper');

  // Create Dropper State
  const [showCreateDropper, setShowCreateDropper] = useState(false);
  const [showCreateBulletin, setShowCreateBulletin] = useState(false);
  
  const [newDropperUsername, setNewDropperUsername] = useState('');
  const [newDropperPassword, setNewDropperPassword] = useState('');
  const [newDropperPhone, setNewDropperPhone] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  
  const currentProfile = useAuthStore(state => state.profile);
  const { showToast } = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);

    const [
      { count: totalUsers },
      { count: totalDroppers },
      { count: activeDrops },
      { count: completedDrops },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'dropper'),
      supabase.from('drops').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('drops').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    ]);

    setAnalytics({
      totalUsers: totalUsers || 0,
      totalDroppers: totalDroppers || 0,
      activeDrops: activeDrops || 0,
      completedDrops: completedDrops || 0,
    });
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data as User[]);
  };

  useEffect(() => {
    fetchAnalytics();
    fetchUsers();
  }, []);

  const updateUserRole = async () => {
    if (!selectedUser) return;

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', selectedUser.id);

    if (!error) {
      showToast('Role updated to ' + newRole, { type: 'success' });
      fetchUsers();
      setSelectedUser(null);
    } else {
      showToast('Failed to update role', { type: 'error' });
    }
  };

  const handleCreateDropper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile) {
      showToast('You must be logged in as Super Admin.', { type: 'error' });
      return;
    }
    setCreateLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-dropper', {
        body: {
          username: newDropperUsername,
          password: newDropperPassword,
          phone: newDropperPhone,
          requestedBy: currentProfile.id
        }
      });
      
      if (error) throw error;
      
      showToast('Dropper account created successfully!', { type: 'success' });
      setShowCreateDropper(false);
      setNewDropperUsername('');
      setNewDropperPassword('');
      setNewDropperPhone('');
      fetchUsers();
      fetchAnalytics();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to create dropper', { type: 'error' });
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">SUPER ADMIN DASHBOARD</h1>
          <p className="text-[#106011]">Droppin Ops — Command &amp; Control</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateDropper(true)}
            className="bg-[#106011] hover:bg-green-700 text-black font-mono font-bold tracking-widest uppercase px-6 py-3 rounded-xl transition"
          >
            Create Dropper
          </button>
          <button
            onClick={() => setShowCreateBulletin(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-bold tracking-widest uppercase px-6 py-3 rounded-xl transition"
          >
            Create Bulletin
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-sm text-zinc-400">Total Users</div>
          <div className="text-4xl font-bold mt-2">{analytics.totalUsers}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-sm text-zinc-400">Active Droppers</div>
          <div className="text-4xl font-bold mt-2 text-[#106011]">{analytics.totalDroppers}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-sm text-zinc-400">Active Drops</div>
          <div className="text-4xl font-bold mt-2 text-yellow-400">{analytics.activeDrops}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-sm text-zinc-400">Completed Drops</div>
          <div className="text-4xl font-bold mt-2 text-blue-400">{analytics.completedDrops}</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-semibold text-[#106011] font-mono tracking-widest uppercase text-sm">User Management</h3>
          <button onClick={fetchUsers} className="text-sm px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 transition rounded-lg font-mono tracking-widest uppercase">Refresh</button>
        </div>
        <table className="w-full">
          <thead className="bg-zinc-950">
            <tr>
              <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-[#106011]">User</th>
              <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-[#106011]">Phone</th>
              <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-[#106011]">Role</th>
              <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-[#106011]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-zinc-800/50 hover:bg-zinc-950/50 transition-colors">
                <td className="p-4 font-mono text-sm">{user.username || user.alias || user.email || 'N/A'}</td>
                <td className="p-4 font-mono text-sm text-slate-300">{user.phone || 'N/A'}</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest bg-zinc-800 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setNewRole(user.role);
                    }}
                    className="text-[#106011] hover:text-white transition-colors text-xs font-mono uppercase tracking-widest"
                  >
                    Change Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Change Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-zinc-950 border-2 border-[#106011] rounded-2xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(16,96,17,0.3)]">
            <h3 className="text-sm font-display font-black tracking-[0.15em] uppercase text-white mb-6">Change Role for<br/><span className="text-[#106011] text-xs font-mono">{selectedUser.email || selectedUser.phone}</span></h3>
            
            <select 
              value={newRole} 
              onChange={(e) => setNewRole(e.target.value as Role)}
              className="w-full bg-black border-2 border-[#106011] focus:outline-none rounded-xl p-3 mb-6 text-white font-mono uppercase tracking-widest text-sm"
            >
              <option value="super_admin">Super Admin</option>
              <option value="dropper">Dropper</option>
              <option value="client">Client</option>
            </select>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-3 rounded-xl border border-zinc-700 font-mono text-xs uppercase tracking-widest hover:bg-zinc-900 transition"
              >
                Cancel
              </button>
              <button 
                onClick={updateUserRole}
                className="flex-1 py-3 rounded-xl bg-[#106011] hover:bg-green-700 font-mono text-xs uppercase tracking-widest font-black transition text-black"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Dropper Modal */}
      {showCreateDropper && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-zinc-950 border-2 border-emerald-600 rounded-2xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(5,150,105,0.3)]">
            <h3 className="text-lg font-bold uppercase text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Create Dropper Account
            </h3>
            
            <form onSubmit={handleCreateDropper} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Username</label>
                <input 
                  required
                  type="text"
                  value={newDropperUsername}
                  onChange={e => setNewDropperUsername(e.target.value)}
                  className="w-full bg-black border border-zinc-700 focus:border-emerald-500 outline-none rounded-lg p-3 text-white font-mono text-sm"
                  placeholder="agent_echo"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Password</label>
                <input 
                  required
                  type="password"
                  value={newDropperPassword}
                  onChange={e => setNewDropperPassword(e.target.value)}
                  className="w-full bg-black border border-zinc-700 focus:border-emerald-500 outline-none rounded-lg p-3 text-white font-mono text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Mobile (Optional)</label>
                <input 
                  type="tel"
                  value={newDropperPhone}
                  onChange={e => setNewDropperPhone(e.target.value)}
                  className="w-full bg-black border border-zinc-700 focus:border-emerald-500 outline-none rounded-lg p-3 text-white font-mono text-sm"
                  placeholder="+1234567890"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowCreateDropper(false)}
                  className="flex-1 py-3 rounded-xl border border-zinc-700 font-mono text-xs uppercase tracking-widest hover:bg-zinc-900 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-mono text-xs uppercase tracking-widest font-black transition text-black disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Create Bulletin Modal */}
      <CreateBulletinModal 
        isOpen={showCreateBulletin} 
        onClose={() => setShowCreateBulletin(false)} 
      />
    </div>
  );
}
