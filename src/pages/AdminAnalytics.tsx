import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);

      // Get all claimed drops with timestamps
      const { data: claimedDrops } = await supabase
        .from('drops')
        .select('created_at, updated_at')
        .eq('status', 'claimed');

      let avgTime = 0;
      if (claimedDrops && claimedDrops.length > 0) {
        const times = claimedDrops.map(d => {
          const created = new Date(d.created_at).getTime();
          const claimed = new Date(d.updated_at).getTime();
          return (claimed - created) / (1000 * 60 * 60); // hours
        });
        avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      }

      // Count by status
      const { data: statusCounts } = await supabase
        .from('drops')
        .select('status');

      const statusData = [
        { name: 'Active', value: statusCounts?.filter(d => d.status === 'active').length || 0 },
        { name: 'Claimed', value: statusCounts?.filter(d => d.status === 'claimed').length || 0 },
        { name: 'Expired', value: statusCounts?.filter(d => d.status === 'expired').length || 0 },
      ];

      setStats({
        averageTimeToClaim: avgTime.toFixed(1),
        statusBreakdown: statusData,
        totalDrops: statusCounts?.length || 0,
      });

      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading || !stats) {
    return <div className="p-6">Loading analytics...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-mono tracking-widest text-[#106011]">DROP ANALYTICS</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <div className="text-sm text-zinc-400">Total Drops</div>
          <div className="text-4xl font-bold mt-2">{stats.totalDrops}</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <div className="text-sm text-zinc-400">Avg Time to Claim</div>
          <div className="text-4xl font-bold mt-2">{stats.averageTimeToClaim} hrs</div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
        <h3 className="font-mono tracking-widest mb-4 text-[#106011]">DROPS BY STATUS</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.statusBreakdown}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
