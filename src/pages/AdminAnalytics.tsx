import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);

      const { data: drops } = await supabase
        .from('drops')
        .select('created_at, status');

      if (!drops) return ;
        
      // Trend data (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const trendData = last7Days.map(date => ({
        name: date.split('-')[2],
        drops: drops.filter(d => d.created_at.startsWith(date)).length
      }));

      // Time to claim calculation
      const claimedDrops = drops.filter(d => d.status === 'claimed');
      // Note: Re-fetching specifically for updated_at if not available
      const { data: claimedWithTime } = await supabase
        .from('drops')
        .select('created_at, updated_at')
        .eq('status', 'claimed');

      let avgTime = 0;
      if (claimedWithTime && claimedWithTime.length > 0) {
        const times = claimedWithTime.map(d => {
          const created = new Date(d.created_at).getTime();
          const claimed = new Date(d.updated_at).getTime();
          return (claimed - created) / (1000 * 60 * 60); // hours
        });
        avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      }

      const statusData = [
        { name: 'Active', value: drops.filter(d => d.status === 'active').length },
        { name: 'Claimed', value: drops.filter(d => d.status === 'claimed').length },
        { name: 'Expired', value: drops.filter(d => d.status === 'expired').length },
      ];

      setStats({
        averageTimeToClaim: avgTime.toFixed(1),
        statusBreakdown: statusData,
        trendData: trendData,
        totalDrops: drops.length,
      });

      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading || !stats) {
    return <div className="p-6 text-white text-xs font-mono">LOADING_ANALYTICS...</div>;
  }

  return (
    <div className="p-6 space-y-8 text-white">
      <h1 className="text-2xl font-mono tracking-widest text-[#106011]">DROP_ANALYTICS</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <div className="text-xs text-zinc-400 font-mono">TOTAL_DROPS</div>
          <div className="text-4xl font-black mt-2 text-white">{stats.totalDrops}</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <div className="text-xs text-zinc-400 font-mono">AVG_CLAIM_TIME</div>
          <div className="text-4xl font-black mt-2 text-emerald-500">{stats.averageTimeToClaim} <span className="text-lg">HRS</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-mono tracking-widest mb-6 text-emerald-600 text-xs uppercase">Drops by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={stats.statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#27272a' }} />
                <Bar dataKey="value" fill="#10b981" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-mono tracking-widest mb-6 text-emerald-600 text-xs uppercase">7-Day Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <LineChart data={stats.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#27272a' }} />
                <Line type="monotone" dataKey="drops" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
