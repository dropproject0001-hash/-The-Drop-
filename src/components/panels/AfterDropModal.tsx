import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function AfterDropModal({ drop, onClose }: { drop: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-6">
      <div className="bg-zinc-950 border border-emerald-600 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center gap-4">
        <h3 className="text-emerald-500 font-mono tracking-widest uppercase">Drop Initialized</h3>
        <p className="text-zinc-400 text-xs font-mono text-center">Scan to validate drop payload</p>
        
        <div className="bg-white p-4 rounded-xl">
          <QRCodeSVG value={JSON.stringify({ dropId: drop.id, title: drop.title })} size={200} />
        </div>
        
        <button 
          onClick={onClose}
          className="w-full bg-emerald-600 text-black py-3 rounded-lg font-mono text-xs uppercase tracking-widest font-black transition hover:bg-emerald-700"
        >
          ACKNOWLEDGE
        </button>
      </div>
    </div>
  );
}
