## 2026-06-13 - [Performance] Optimization of Hot-Path Sorting and Leaflet Icon Churn

**Learning:**
1. Using `new Date().getTime()` inside a sort function for ISO strings (like `recorded_at`) is extremely expensive (O(n log n) with object instantiation). Since ISO strings are lexicographically sortable, direct string comparison (`b > a ? 1 : -1`) is ~15x faster and avoids garbage collection pressure.
2. In React-Leaflet, calling functions that return new Leaflet icon objects (e.g., `L.divIcon`) during render causes unnecessary Leaflet internal state updates and potentially redundant DOM churn, even if the properties are the same.

**Action:**
- Always use direct string comparison for ISO timestamp sorting in performance-critical hooks.
- Move Leaflet icon definitions outside of React component render cycles or memoize them if they depend on props.
