import React, { useState, useEffect } from 'react';
import { locationBroadcastService } from '@/services/LocationBroadcastService';
import { useToast } from '@/components/ui/ToastContainer';
import { useAuth } from '@/app/providers/AuthContext';
import { Shield, Radio, Lock } from 'lucide-react';
import type { Drop } from '@/types/domain';

interface DropperTrackingControlProps {
  drop?: Drop;
  onTrackingChange?: (isTracking: boolean) => void;
}

export function DropperTrackingControl({ drop, onTrackingChange }: DropperTrackingControlProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { profile } = useAuth();

  // Rule: No permission to turn off tracking unless boss unlocked it
  const isLocked = profile?.tracking_locked ?? true;

  useEffect(() => {
    setIsTracking(locationBroadcastService.isCurrentlyBroadcasting());
  }, []);

  const handleToggleTracking = async () => {
    if (isTracking && isLocked) {
      showToast('TRACKING ENFORCED BY HQ. ACCESS DENIED.', { type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      if (!isTracking) {
        await locationBroadcastService.startTracking({
          dropId: drop?.id,
          onUpdate: (location) => {
            console.log(`[Dropper] Telemetry broadcasted`, location);
          },
          onError: (error) => {
            console.error('[Dropper] Tracking error:', error);
            showToast('GPS SIGNAL LOST. CHECK SENSOR PERMISSIONS.', { type: 'error' });
          },
        });
        setIsTracking(true);
        onTrackingChange?.(true);
        showToast(`LIVE TELEMETRY ESTABLISHED`, { type: 'success' });
      } else {
        locationBroadcastService.stopTracking();
        setIsTracking(false);
        onTrackingChange?.(false);
        showToast('TELEMETRY TERMINATED', { type: 'info' });
      }
    } catch (err) {
      console.error('[DropperTrackingControl] Error:', err);
      showToast('SYSTEM FAILURE DURING TOGGLE.', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleToggleTracking}
        disabled={isLoading || (isTracking && isLocked)}
        className={`w-full py-4 rounded-2xl font-mono text-xs font-black tracking-[0.2em] transition-all flex items-center justify-center gap-3 border-2
          ${isTracking
            ? 'bg-red-950/40 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
            : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-500 shadow-[0_0_15px_rgba(16,96,17,0.2)]'
          }
          disabled:opacity-50 disabled:cursor-not-allowed group`}
      >
        {isLoading ? (
          'SYNCHRONIZING...'
        ) : isTracking ? (
          <>
            <Radio className="w-4 h-4 animate-pulse" />
            LIVE TELEMETRY: ACTIVE
            {isLocked && <Lock className="w-3 h-3 ml-2 opacity-60" />}
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
            INITIATE LIVE BROADCAST
          </>
        )}
      </button>

      {isTracking && isLocked && (
        <p className="text-[9px] font-mono text-red-500/60 uppercase tracking-widest text-center">
          ● TRANSMISSION LOCKED BY HQ PROTOCOL
        </p>
      )}
    </div>
  );
}
