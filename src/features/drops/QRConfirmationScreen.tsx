/**
 * @file src/features/drops/QRConfirmationScreen.tsx
 *
 * Modified to support:
 * 1. Mock connection bypass for preview modes (allows confirming drops without a physical camera or QR printed code)
 * 2. Real-time updates of local Zustand stores.
 * 3. Celebratory canvas-confetti discharges on successful pickups.
 */
import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEdgeFunctions } from '@/hooks/useEdgeFunctions';
import { supabase } from '@/lib/supabase';
import { useDropStore } from '@/stores';
import confetti from 'canvas-confetti';
import type { Drop } from '@/types/domain';

interface QRConfirmationScreenProps {
  dropId: string;
  onSuccess?: () => void;
}

export function QRConfirmationScreen({ dropId, onSuccess }: QRConfirmationScreenProps) {
  const [scannedCode, setScannedCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { confirmQR, loading } = useEdgeFunctions();

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.warn);
        scannerRef.current = null;
      }
    };
  }, []);

  const triggerPickupConfetti = () => {
    // 3 successive bursts of emerald/gold confetti
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22C55E', '#10B981', '#F59E0B']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22C55E', '#10B981', '#F59E0B']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleMockConfirmation = () => {
    const store = useDropStore.getState();
    const foundDrop = store.drops.find(d => d.id === dropId);
    
    if (foundDrop) {
      const updated: Drop = { ...foundDrop, status: 'claimed', updated_at: new Date().toISOString() };
      store.updateDrop(updated);
      
      triggerPickupConfetti();
      alert('🔒 SECURITY DECRPYTION COMPLETED!\nMock QR Confirmation authenticated. Materials unlocked.');
      if (onSuccess) onSuccess();
    } else {
      alert('Error: Drop not found in local coordinates.');
    }
  };

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

        const envMeta = (import.meta as any).env || {};
        const isMock = (supabase as any).supabaseUrl?.includes('mock') || envMeta.VITE_SUPABASE_URL?.includes('mock');

        if (isMock) {
          handleMockConfirmation();
          return;
        }

        try {
          const result = await confirmQR<{ message?: string }>(dropId, decodedText);
          
          // Confetti on real success
          triggerPickupConfetti();
          alert(result.message ?? 'Drop confirmed successfully!');
          if (onSuccess) onSuccess();
        } catch (err: unknown) {
          alert('Confirmation failed: ' + (err instanceof Error ? err.message : String(err)));
        }
      },
      (err) => {
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

  const envMeta = (import.meta as any).env || {};
  const isMockEnv = (supabase as any).supabaseUrl?.includes('mock') || envMeta.VITE_SUPABASE_URL?.includes('mock');

  return (
    <div className="p-4 bg-emerald-950/20 backdrop-blur-xl rounded-2xl border border-emerald-950/20 flex flex-col items-center">
      <h2 className="text-sm font-extrabold uppercase font-display mb-1 text-white tracking-widest">
        QR Secure Decryption
      </h2>
      <p className="text-[10px] text-slate-400 mb-4 text-center max-w-xs">
        Scan the cryptographic QR badge embedded on the tactical drop container to authorize cargo unlocking.
      </p>

      {/* Camera box */}
      <div
        id="qr-reader"
        className="w-full max-w-sm mb-4 rounded-xl overflow-hidden bg-black/60 border border-green-950/40"
      />

      <div className="flex flex-col gap-2 w-full max-w-sm">
        <div className="flex gap-2">
          <button
            onClick={startScanner}
            className="flex-1 bg-gradient-to-r from-green-700 to-emerald-500 hover:opacity-90 transition p-3 rounded-xl font-bold text-xs text-white uppercase tracking-wider disabled:opacity-60 cursor-pointer"
            disabled={loading || isScanning}
          >
            {loading ? 'Decrypting…' : 'Start Camera Stream'}
          </button>

          {isScanning && (
            <button
              onClick={stopScanner}
              className="bg-slate-800 hover:bg-slate-700 transition px-4 py-3 rounded-xl font-bold text-xs text-white uppercase tracking-wider cursor-pointer"
            >
              Stop
            </button>
          )}
        </div>

        {/* Developer simulation bypass */}
        {isMockEnv && (
          <button
            onClick={handleMockConfirmation}
            className="w-full mt-2 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800/30 text-[#22C55E] p-3 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer"
          >
            Bypass Camera (Simulate Mock QR)
          </button>
        )}
      </div>

      {scannedCode && (
        <p className="mt-4 text-[10px] text-green-400 font-mono break-all bg-black/40 px-3 py-1.5 rounded-lg border border-green-950/40 w-full text-center">
          DECODED PIN: {scannedCode}
        </p>
      )}
    </div>
  );
}
