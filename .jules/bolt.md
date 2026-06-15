## 2026-06-13 - [Initial Assessment]
**Learning:** The codebase uses React Leaflet with custom Framer Motion markers. `MapMarker` components are recreated/re-rendered frequently, especially on maps with many entities. `L.divIcon` is often recreated inside the render cycle.
**Action:** Use `React.memo` for expensive map components and ensure Leaflet objects (icons, etc.) are defined outside the component or memoized.
