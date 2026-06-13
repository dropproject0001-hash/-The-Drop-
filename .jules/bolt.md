## 2026-06-13 - [Icon Cache & Component Memoization in Maps]
**Learning:** React Leaflet markers that use `L.divIcon` create new DOM elements and Leaflet objects on every render if not cached. When combined with high-frequency updates (e.g., GPS tracking at 1Hz or faster), this leads to significant GC pressure and UI jank.
**Action:** Always cache `L.divIcon` instances for reusable marker types and wrap map marker components in `React.memo` to skip redundant reconciliation when coordinates or status haven't changed.
