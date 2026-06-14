import { create } from 'zustand';
import { locationBroadcastService } from '@/services/LocationBroadcastService';

export const useLocationBroadcastStore = create((set) => ({
  isOnline: locationBroadcastService.isOnline,
  isBroadcasting: locationBroadcastService.isCurrentlyBroadcasting(),
  refresh: () => set({
      isOnline: locationBroadcastService.isOnline,
      isBroadcasting: locationBroadcastService.isCurrentlyBroadcasting(),
  }),
}));
