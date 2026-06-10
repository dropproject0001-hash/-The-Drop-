import { create } from 'zustand';
import { locationBroadcastService } from '@/services/LocationBroadcastService';

export const useLocationBroadcastStore = create((set) => ({
  queueSize: locationBroadcastService.queueSize,
  isOnline: locationBroadcastService.isOnline,
  isBroadcasting: locationBroadcastService.isCurrentlyBroadcasting(),
  refresh: () => set({
      queueSize: locationBroadcastService.queueSize,
      isOnline: locationBroadcastService.isOnline,
      isBroadcasting: locationBroadcastService.isCurrentlyBroadcasting(),
  }),
}));
