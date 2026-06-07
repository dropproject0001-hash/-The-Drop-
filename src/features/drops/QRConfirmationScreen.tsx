/**
 * @file src/features/drops/QRConfirmationScreen.tsx
 *
 * FIX C-6: Html5QrcodeScanner instance is now stored in a ref and properly
 *           cleaned up in a useEffect cleanup function, covering both:
 *           - Component unmount while scanner is active
 *           - Multiple calls to startScanner without clearing the previous one
 */
import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEdgeFunctions } from '@/hooks/useEdgeFunctions';

interface QRConfirmationScreenProps {
  dropId: string;
}

export function QRConfirmationScreen({ dropId }: QRConfirmationScreenProps) {
  const [scannedCode, setScannedCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { confirmQR, loading } = useEdgeFunctions();

  // FIX C-6: Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.warn);
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanner = () => {
    // Prevent duplicate scanner instances
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.warn);
      scannerRef.current = null;
    }

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: 250 },
      /* verbose= */ false
    );
    scannerRef.current = scanner;
    setIsScanning(true);

    scanner.render(
      async (decodedText) => {
        // Stop scanner on successful decode
        try {
          await scanner.clear();
        } catch (_) { /* ignore clear errors */ }
        scannerRef.current = null;
        setIsScanning(false);
        setScannedCode(decodedText);

        try {
          const result = await confirmQR<{ message?: string }>(dropId, decodedText);
          alert(result.message ?? 'Drop confirmed successfully!');
        } catch (err: unknown) {
          alert('Confirmation failed: ' + (err instanceof Error ? err.message : String(err)));
        }
      },
      (err) => {
        // Decode errors are normal (every frame that isn't a QR code)
        console.debug('[QRScanner] decode error:', err);
      }
    );
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.clear().catch(console.warn);
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  return (
    <div className="p-4 bg-card rounded-2xl shadow-sm border border-slate-800 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4 text-white">Scan QR to Confirm Drop</h2>

      <div
        id="qr-reader"
        className="w-full max-w-sm mb-4 rounded-xl overflow-hidden bg-slate-900"
      />

      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={startScanner}
          className="flex-1 bg-primary hover:bg-primary/90 transition-colors text-white py-3 rounded-xl font-medium disabled:opacity-60"
          disabled={loading || isScanning}
        >
          {loading ? 'Confirming…' : 'Start QR Scanner'}
        </button>

        {isScanning && (
          <button
            onClick={stopScanner}
            className="flex-1 bg-slate-700 hover:bg-slate-600 transition-colors text-white py-3 rounded-xl font-medium"
          >
            Stop Scanner
          </button>
        )}
      </div>

      {scannedCode && (
        <p className="mt-4 text-sm text-green-500 font-mono break-all">
          Scanned: {scannedCode}
        </p>
      )}
    </div>
  );
}
