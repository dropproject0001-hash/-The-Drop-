## 2026-06-13 - [Initial Assessment]
**Learning:** The codebase uses React Leaflet with custom Framer Motion markers. `MapMarker` components are recreated/re-rendered frequently, especially on maps with many entities. `L.divIcon` is often recreated inside the render cycle.
**Action:** Use `React.memo` for expensive map components and ensure Leaflet objects (icons, etc.) are defined outside the component or memoized.

## 2026-06-13 - [State Reference Stability for Geolocation]
**Learning:** Frequent geolocation heartbeats create new array references ([lat, lng]) even when coordinates are identical. In React, this triggers cascading re-renders across the map and its children (Markers, Popups, Overlays) because shallow equality checks fail.
**Action:** Use functional state updates with explicit coordinate comparisons to maintain the same object/array reference if values haven't changed.
