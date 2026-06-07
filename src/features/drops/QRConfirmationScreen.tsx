import { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEdgeFunctions } from '@/hooks/useEdgeFunctions';

export function QRConfirmationScreen({ dropId }: { dropId: string }) {
  const [scannedCode, setScannedCode] = useState('');
  const { confirmQR, loading } = useEdgeFunctions();

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
    
    scanner.render(
      async (decodedText) => {
        scanner.clear();
        setScannedCode(decodedText);
        
        try {
          const result = await confirmQR<{message?: string}>(dropId, decodedText);
          alert(result.message || "Drop confirmed successfully!");
        } catch (error: any) {
          alert("Confirmation failed: " + error.message);
        }
      },
      (error) => console.warn(error)
    );
  };

  return (
    <div className="p-4 bg-card rounded-2xl shadow-sm border border-slate-800 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4 text-white">Scan QR to Confirm Drop</h2>
      
      <div id="qr-reader" className="w-full max-w-sm mb-4 rounded-xl overflow-hidden bg-slate-900"></div>
      
      <button 
        onClick={startScanner} 
        className="w-full max-w-sm bg-primary hover:bg-primary/90 transition-colors text-white py-3 rounded-xl font-medium"
        disabled={loading}
      >
        {loading ? 'Confirming...' : 'Start QR Scanner'}
      </button>

      {scannedCode && (
        <p className="mt-4 text-sm text-green-500 font-mono">Scanned: {scannedCode}</p>
      )}
    </div>
  );
}
