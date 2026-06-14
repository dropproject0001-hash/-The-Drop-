## 2026-06-13 - [Leaflet Marker Optimization]
**Learning:** Creating `L.divIcon` inside the React render cycle causes unnecessary object creation and can lead to Leaflet re-instantiating markers, which is expensive when combined with complex Framer Motion portals.
**Action:** Always define static Leaflet icons or use `useMemo` for dynamic icons to ensure reference stability.
