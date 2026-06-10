# REALTIME_LOCATION_SYSTEM.md - The Drop (v1.0)

## 1. Architectural Overview
The realtime location system is designed for **tactical reliability** in field operations, gracefully degrading from high-bandwidth WebSockets to low-intensity HTTP polling when network conditions in Mamburao are unstable.

- **Frontend Core**: `LocationBroadcastService.ts` (singleton for tracking consistency).
- **Backend Hub**: Supabase Edge Function `broadcast-location` (Strict Role-Based Access Control).
- **Fallback Engine**: `useLiveLocations.ts` (WebSocket → Automatic HTTP Polling → Adaptive Battery-Saving Polling).
- **Persistence**: Dexie.js (IndexDB) for offline outbox.

## 2. Component Directory
- `src/services/LocationBroadcastService.ts`: Primary tracking singleton.
- `src/hooks/realtime/useLiveLocations.ts`: Realtime subscription hook with fallback logic.
- `src/components/map/DropMap.tsx`: Tactical map UI (Marker clusters, pulsing live markers).
- `src/components/ui/ConnectionStatusBadge.tsx`: System-state indicator (LIVE/POLLING/OFFLINE).
- `src/stores/locationBroadcastStore.ts`: Reactive state container for telemetry health.

## 3. Operations & Configuration

### Environment Requirements
Ensure the following are defined for operational parity:
- `STRICT_GOODS_EYE`: (boolean) Enable/disable strict ownership validation.
- `LOCATION_BROADCAST_INTERVAL`: (ms) Throttle interval (default: 8000).

### Debugging
The system includes a persistent debug overlay. Enable it via:
```javascript
// Run in browser console
localStorage.setItem('show_location_debug', 'true'); location.reload();
```

### Fallback Logic
The system automatically handles failures:
1. **Realtime**: Default state (Supabase Realtime WebSocket).
2. **Polling Fallback**: Triggered on WebSocket failure; uses adaptive intervals (8s → 12s → 18s+ to preserve battery).
3. **Offline Queue**: Handled by `LocationOutbox` (IndexedDB) for seamless recovery upon reconnect.

## 4. Troubleshooting Checklist
- [ ] **Markers not pulsing?** Ensure `DropMap` has the `live-pulse` CSS keyframes imported.
- [ ] **Realtime failing instantly?** Check the Network tab for `401 Unauthorized` on WS upgrade (check JWT/Session validity).
- [ ] **Rate Limiting?** If receiving 429 errors from Edge Function, check `RATE_LIMIT_MS` in edge function configuration.
- [ ] **Map Crashes?** Wrapped all main map views in `ErrorBoundary` (use this if Leaflet hangs).
