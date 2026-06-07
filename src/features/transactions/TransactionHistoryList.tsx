import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Transaction, TransactionDetailModal } from './TransactionDetailModal';

export function TransactionHistoryList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions();

    // Subscribe to realtime updates for transactions
    const channel = supabase
      .channel('transactions-history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTransactions(prev => [payload.new as Transaction, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTransactions(prev => prev.map(t => t.id === payload.new.id ? (payload.new as Transaction) : t));
          // Update selected transaction if it's the one being modified
          setSelectedTransaction(current => current?.id === payload.new.id ? (payload.new as Transaction) : current);
        } else if (payload.eventType === 'DELETE') {
          setTransactions(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data as Transaction[] || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('transactions')
        .update({ status: 'granted' })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error granting transaction:', err);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('transactions')
        .update({ status: 'declined' })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error declining transaction:', err);
    }
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
