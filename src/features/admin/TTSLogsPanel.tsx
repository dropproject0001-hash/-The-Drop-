// src/features/admin/TTSLogsPanel.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, RefreshCw } from 'lucide-react';

export default function TTSLogsPanel() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tts_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setLogs(data || []);
    setLoading(false);
  };

  const exportReport = async () => {
    const csv = [
      ['Timestamp', 'User ID', 'Role', 'Message', 'Voice', 'Cached', 'Status', 'Duration (ms)'],
      ...logs.map(log => [
        new Date(log.created_at).toISOString(),
        log.user_id,
        log.role,
        `"${log.message.replace(/"/g, '""')}"`,
        log.voice,
        log.cached ? 'Yes' : 'No',
        log.status,
        log.duration_ms || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tts-audit-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  useEffect(() => {
    fetchLogs();
    const channel = supabase.channel('tts-logs-sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tts_logs' }, fetchLogs)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="font-mono text-xl">TTS Audit Logs</h2>
        <div className="flex gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
          >
            <Download size={16} /> Export CSV Report
          </button>
        </div>
      </div>

      <div className="max-h-[500px] overflow-auto text-sm font-mono space-y-1 custom-scrollbar">
        {logs.length === 0 && !loading && (
          <div className="text-zinc-500 py-4 text-center">No TTS logs found.</div>
        )}
        {logs.map(log => (
          <div key={log.id} className="border-b border-zinc-900 py-3 flex justify-between items-start gap-4">
            <div className="flex-1">
              <span className="text-emerald-400 block sm:inline">{new Date(log.created_at).toLocaleString()}</span>{' '}
              <span className="text-zinc-500">[{log.role}]</span>{' '}
              <span className="text-zinc-200">{log.message}</span>
            </div>
            <div className="text-right text-xs whitespace-nowrap">
              {log.cached && <span className="text-amber-400 mr-2" title="Cached">♻️</span>}
              <span className={log.status === 'success' ? 'text-emerald-500' : 'text-rose-500'}>
                {log.status.toUpperCase()}
              </span>
              {log.duration_ms && <span className="text-zinc-600 ml-2">{log.duration_ms}ms</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
