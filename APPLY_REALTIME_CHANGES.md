# APPLY_REALTIME_CHANGES.md

## 1. Pulsing Live Markers — Patch for `DropMap.tsx`

**A. Add state near your other `useState` declarations:**
```tsx
const [recentlyUpdatedUsers, setRecentlyUpdatedUsers] = useState<Set<string>>(new Set());
```

**B. Add this `useEffect` (after `useLiveLocations`):**
```tsx
// === LIVE PULSING INDICATOR ===
useEffect(() => {
  if (!liveAdminLocations) return;

  const updated = new Set<string>();

  Object.entries(liveAdminLocations).forEach(([userId, locs]) => {
    if (locs.length > 0) {
      const latest = locs[0];
      const ageMs = Date.now() - new Date(latest.recorded_at).getTime();
      if (ageMs < 8000) { updated.add(userId); }
    }
  });

  if (updated.size > 0) {
    setRecentlyUpdatedUsers(updated);
    const timer = setTimeout(() => setRecentlyUpdatedUsers(new Set()), 6500);
    return () => clearTimeout(timer);
  }
}, [liveAdminLocations]);
```

**C. Update Marker rendering inside `Object.entries(adminLocations).map(...)`:**
```tsx
const isLive = recentlyUpdatedUsers.has(uid);
// ... inside <Marker ...>
<Popup>
  <div className="text-center text-slate-900">
    <div className="flex items-center justify-center gap-2 font-semibold">
      AGENT LIVE
      {isLive && <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />}
    </div>
  </div>
</Popup>
```

## 2. Store: `src/stores/locationBroadcastStore.ts`
*(Create this file to make telemetry state reactive)*
```tsx
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
```
