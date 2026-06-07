import { EpicModal } from '@/components/ui/EpicModal';

export interface Transaction {
  id: string;
  drop_id: string;
  amount: number;
  status: 'pending' | 'granted' | 'declined';
  qr_code?: string;
  gps_lat?: number;
  gps_lng?: number;
  photo_url?: string;
  video_url?: string;
  created_at?: string;
}

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onGrant: (id: string) => void;
  onDecline: (id: string) => void;
}

export function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  onGrant,
  onDecline,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <EpicModal isOpen={isOpen} onClose={onClose} title="Transaction Verification" size="lg">
      <div className="space-y-6 text-slate-100">
        {/* Transaction Info */}
        <div>
          <p className="text-sm text-slate-400">Amount</p>
          <p className="text-2xl font-bold">₱{transaction.amount}</p>
        </div>

        {/* Verification Media */}
        <div className="grid grid-cols-2 gap-4">
          {transaction.qr_code && (
            <div>
              <p className="text-sm font-medium mb-1 text-slate-300">QR Code</p>
              <img src={transaction.qr_code} alt="QR Code" className="rounded-lg border border-slate-700" />
            </div>
          )}

          {transaction.photo_url && (
            <div>
              <p className="text-sm font-medium mb-1 text-slate-300">Photo Proof</p>
              <img src={transaction.photo_url} alt="Photo" className="rounded-lg border border-slate-700" />
            </div>
          )}
        </div>

        {transaction.video_url && (
          <div>
            <p className="text-sm font-medium mb-1 text-slate-300">Video Proof</p>
            <video controls className="w-full rounded-lg border border-slate-700">
              <source src={transaction.video_url} />
            </video>
          </div>
        )}

        {/* GPS Location */}
        {transaction.gps_lat && transaction.gps_lng && (
          <div>
            <p className="text-sm font-medium mb-1 text-slate-300">Pinned Location</p>
            <p className="text-sm bg-slate-800 p-3 rounded-lg border border-slate-700">
              Lat: {transaction.gps_lat} <br />
              Lng: {transaction.gps_lng}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {transaction.status === 'pending' && (
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={() => onDecline(transaction.id)}
              className="flex-1 py-3 rounded-xl border border-red-500/50 text-red-500 font-medium hover:bg-red-500/10 transition"
            >
              Decline
            </button>
            <button
              onClick={() => onGrant(transaction.id)}
              className="flex-1 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-500 transition"
            >
              Grant Transaction
            </button>
          </div>
        )}
      </div>
    </EpicModal>
  );
}
