import React, { useState } from 'react';
import { locationBroadcastService } from '@/services/LocationBroadcastService';
import { useToast } from '@/components/ui/ToastContainer';
import type { Drop } from '@/types/domain';

interface DropperTrackingControlProps {
  drop: Drop;
  onTrackingChange?: (isTracking: boolean) => void;
}

export function DropperTrackingControl({ drop, onTrackingChange }: DropperTrackingControlProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleToggleTracking = async () => {
    setIsLoading(true);

    try {
      if (!isTracking) {
        // Start tracking for this specific drop
        await locationBroadcastService.startTracking({
          dropId: drop.id,
          onUpdate: (location) => {
            console.log(`[Dropper] Location broadcasted for drop ${drop.id}`, location);
          },
          onError: (error) => {
            console.error('[Dropper] Tracking error:', error);
            showToast('Failed to start location tracking. Please check GPS permissions.', { type: 'error' });
          },
        });
        setIsTracking(true);
        onTrackingChange?.(true);
        showToast(`Live tracking started for ${drop.title}`, { type: 'success' });
      } else {
        // Stop tracking
        locationBroadcastService.stopTracking();
        setIsTracking(false);
        onTrackingChange?.(false);
        showToast('Live tracking stopped', { type: 'info' });
      }
    } catch (err) {
      console.error('[DropperTrackingControl] Error:', err);
      showToast('Something went wrong while toggling tracking.', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleTracking}
      disabled={isLoading}
      className={`w-full py-3 rounded-xl font-mono text-sm tracking-widest transition flex items-center justify-center gap-2
        ${isTracking 
          ? 'bg-red-600 hover:bg-red-700 text-white' 
          : 'bg-emerald-600 hover:bg-emerald-700 text-black'
        } 
        disabled:opacity-60`}
    >
      {isLoading ? (
        'PROCESSING...'
      ) : isTracking ? (
        <>STOP LIVE TRACKING <span className="text-xs">●</span></>
      ) : (
        'START LIVE TRACKING FOR THIS DROP'
      )}
    </button>
  );
}
