## 2026-06-14 - [MapMarker Memoization & SSR Safety]
**Learning:** Optimizing Leaflet components with `React.memo` requires a custom comparison that includes the `children` prop if they render into Portals, ensuring the UI stays in sync. Additionally, Leaflet icon initializations (`L.divIcon`) must be inside `useMemo` rather than module scope to remain SSR-safe and avoid ReferenceErrors for `window` during server-side evaluation or testing.
**Action:** Always include `children` in custom `memo` comparisons for portal-based components and use `useMemo` for Leaflet object stability.
