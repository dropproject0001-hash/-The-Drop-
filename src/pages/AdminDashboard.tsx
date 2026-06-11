import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminDropsList from '@/pages/AdminDropsList';
import { useToast } from '@/components/ui/ToastContainer';
import type { Drop, Profile } from '@/types/domain';

export default function AdminDashboard() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [droppers, setDroppers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: dropsData } = await supabase
        .from('drops')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['dropper', 'admin']);

      setDrops(dropsData || []);
      setDroppers(usersData || []);
    } catch (err) {
      showToast('Failed to load data', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDrops = drops.filter(d => {
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      d.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-mono tracking-widest text-[#106011]">ADMIN DASHBOARD</h1>
        <p className="text-zinc-400 text-sm">Overview & Management</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search drops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white"
        />
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="claimed">Claimed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Drops List */}
      <AdminDropsList 
        drops={filteredDrops}
        droppers={droppers}
        onRefresh={fetchData}
      />
    </div>
  );
}
