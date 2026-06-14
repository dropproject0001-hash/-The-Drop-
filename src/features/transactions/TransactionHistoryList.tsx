import { useState, useEffect } from 'react';
import { supabase, isMock } from '@/lib/supabase';
import { Transaction, TransactionDetailModal } from './TransactionDetailModal';

export function TransactionHistoryList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions();

    if (isMock) return;

    const channel = supabase
      .channel('pickups-history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pickups' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newT = mapPickupToTransaction(payload.new);
          setTransactions(prev => [newT, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedT = mapPickupToTransaction(payload.new);
          setTransactions(prev => prev.map(t => t.id === updatedT.id ? updatedT : t));
          setSelectedTransaction(current => current?.id === updatedT.id ? updatedT : current);
        } else if (payload.eventType === 'DELETE') {
          setTransactions(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const mapPickupToTransaction = (p: any): Transaction => ({
    id: p.id,
    drop_id: p.drop_id,
    amount: (p as any).amount || 0,
    status: (p as any).status || 'granted',
    created_at: p.confirmed_at || p.created_at,
    gps_lat: p.scan_lat,
    gps_lng: p.scan_lng,
  });

  const fetchTransactions = async () => {
    setLoading(true);
    
    if (isMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTransactions([
        {
          id: 't-1',
          drop_id: 'mock-drop-1',
          amount: 5000,
          status: 'pending',
          created_at: new Date().toISOString(),
          gps_lat: 15.4845,
          gps_lng: 120.9712,
          photo_url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 't-2',
          drop_id: 'mock-drop-2',
          amount: 15500,
          status: 'granted',
          created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
          gps_lat: 15.4872,
          gps_lng: 120.9752,
          photo_url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80'
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pickups')
        .select('*, drops(*)')
        .order('confirmed_at', { ascending: false });

      if (error) throw error;
      setTransactions(data.map(mapPickupToTransaction));
    } catch (err) {
      console.error('Error fetching transactions (pickups):', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async (id: string) => {
    console.log('Granting transaction:', id);
  };

  const handleDecline = async (id: string) => {
    console.log('Declining transaction:', id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6 text-white">Transaction History</h2>
      
      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-slate-400 bg-slate-800/50 rounded-xl">No transactions found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
              <tr>
                <th scope="col" className="px-4 py-3 rounded-tl-lg">Drop ID</th>
                <th scope="col" className="px-4 py-3">Amount</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 font-mono text-xs">{t.drop_id?.slice(0, 8) || 'N/A'}</td>
                  <td className="px-4 py-3 font-medium text-white">₱{t.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-opacity-20 ${
                      t.status === 'granted' ? 'bg-green-500 text-green-400' :
                      t.status === 'declined' ? 'bg-red-500 text-red-400' :
                      'bg-yellow-500 text-yellow-400'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {t.created_at ? new Date(t.created_at).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedTransaction(t)}
                      className="text-primary hover:text-primary/80 transition font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onGrant={handleGrant}
        onDecline={handleDecline}
      />
    </div>
  );
}
