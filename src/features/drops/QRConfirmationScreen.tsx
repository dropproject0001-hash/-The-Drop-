import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { captureService } from '@/services/CaptureService';
import { locationBroadcastService } from '@/services/LocationBroadcastService';
import { useAuthStore } from '@/stores';
import { useToast } from '@/components/ui/ToastContainer';
import { CheckCircle, Camera, Video } from 'lucide-react';

export default function QRConfirmationScreen() {
  const { dropId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { showToast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [proof, setProof] = useState<any>(null);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Attempt to get current location for the claim
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn('Geolocation denied or unavailable for QR claim.')
      );
    }

    return () => {
      // Cleanup Object URLs on unmount
      captureService.clearAllUrls();
    };
  }, []);

  const handleCaptureProof = async (type: 'photo' | 'video') => {
    try {
      if (type === 'photo') {
        const result = await captureService.takePhoto();
        setProof(result);
        showToast('Photo captured successfully', { type: 'success' });
      } else {
        // Video capture logic...
        showToast('Video recording started', { type: 'info' });
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to capture proof', { type: 'error' });
    }
  };

  const handleClaimDrop = async () => {
    if (!dropId || !profile) return;

    setIsProcessing(true);

    try {
      // Record location (FIX MED-3: Use null if coords unavailable)
      try {
        if (coords) {
          await locationBroadcastService.broadcast({
            lat: coords.lat,
            lng: coords.lng,
            drop_id: dropId,
          });
        }
      } catch {
        showToast('Could not record location telemetry', { type: 'warning' });
      }

      // Update drop status
      const { error } = await supabase
        .from('drops')
        .update({ status: 'claimed', updated_at: new Date().toISOString() })
        .eq('id', dropId)
        .eq('assigned_to', profile.id);

      if (error) throw error;

      showToast('Drop claimed successfully!', { type: 'success' });

      setTimeout(() => navigate('/client'), 1200);
    } catch (err: any) {
      showToast(err.message || 'Failed to claim drop', { type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-mono tracking-widest mb-6 text-[#106011]">CLAIM DROP</h1>

      <div className="space-y-4">
        {/* Proof capture */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
          <div className="font-mono text-sm mb-3 text-zinc-400">PROOF OF DELIVERY</div>
          {!proof ? (
            <div className="flex gap-3">
              <button
                onClick={() => handleCaptureProof('photo')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl"
              >
                <Camera size={18} /> PHOTO
              </button>
              <button
                onClick={() => handleCaptureProof('video')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl"
              >
                <Video size={18} /> VIDEO
              </button>
            </div>
          ) : (
            <div className="text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle size={16} /> Proof captured successfully
            </div>
          )}
        </div>

        <button
          onClick={handleClaimDrop}
          disabled={isProcessing}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 rounded-2xl font-mono tracking-widest text-lg transition mt-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          {isProcessing ? 'CLAIMING DROP...' : 'CONFIRM & CLAIM DROP'}
        </button>
      </div>
    </div>
  );
}
