# The Drop — Full Deep-Dive Audit Report
**Reviewed:** 2026-06-07  
**Codebase:** React 19 + TypeScript + Vite + Supabase + Firebase + Leaflet PWA  
**Location target:** Mamburao, Occidental Mindoro, PH

---

## Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 CRITICAL | 7 |
| 🟠 HIGH | 9 |
| 🟡 MEDIUM | 8 |
| 🔵 LOW / QoL | 6 |
| **TOTAL** | **30** |

---

## 🔴 CRITICAL BUGS

### C-1 — `env.ts` crashes the entire app on boot (no auth guard)
`validateEnv()` is called at module-import time. `supabase.ts` imports `env.ts`, and `supabase.ts` is imported inside `DropMap.tsx`. If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing the app throws at startup **before any UI renders** — no error boundary catches it.  
**Fix:** Wrap validateEnv() call in a try/catch; throw a user-visible error state from a boundary instead of killing the whole React tree.

### C-2 — `firebase-applet-config.json` has a real Firebase API key committed to source
`AIzaSyDGmSNHQas8gRtmBzpN1pDd4loMcCKOe-o` and all project identifiers are hardcoded in the repo. Anyone who clones this can use the Firebase project.  
**Fix:** Move to `VITE_FIREBASE_*` env vars; import.meta.env at runtime. Add `firebase-applet-config.json` to `.gitignore`.

### C-3 — Schema mismatch: Supabase DB vs TypeScript types vs Firestore blueprint
Three separate schema definitions exist and they contradict each other:
- `001_init.sql` defines roles as `('super_admin', 'admin', 'client')` and statuses as `('active', 'claimed', 'expired')`
- `database.ts` defines roles as `('tanod', 'admin', 'super_admin')` and statuses as `('active', 'pending', 'completed', 'cancelled')`
- `firebase-blueprint.json` uses roles `('super_admin', 'admin', 'client')` and statuses `('active', 'claimed', 'expired')`
- `RoleGuard.tsx` uses a fourth definition: `('tanod', 'admin', 'superadmin')` — note `superadmin` vs `super_admin`

This means:  
- `useProfile.ts`'s `isClient: profile?.role === 'tanod'` will **never match** what the DB stores as `'client'`
- `RoleGuard` allows `'superadmin'` but the DB emits `'super_admin'` — guard is permanently broken for super admins
- Drop status filters in DropMap use `'active'|'pending'|'completed'|'cancelled'` but the DB emits `'active'|'claimed'|'expired'`

### C-4 — `useProfile.ts` has no auth subscription — profile goes stale after sign-in/out
The hook fetches the profile once on mount with no `supabase.auth.onAuthStateChange` listener. If the user signs in after the component mounts, `profile` stays null forever. If they sign out, stale profile data persists.

### C-5 — `DropMap.tsx` broadcast inserts locations for ANY user regardless of role
`toggleLiveTracking` calls `supabase.from('locations').insert(...)` for any authenticated user, but the UI only shows the tracking button for admins/super_admins. A client/tanod user who calls the function directly (or via devtools) can insert location rows without restriction on the client side. (RLS on the DB side does protect this, but the client-side logic is misleading and wrong.)

### C-6 — `QRConfirmationScreen.tsx` — scanner instance is never cleaned up
`Html5QrcodeScanner` is instantiated inside `startScanner()` without any reference stored. Calling `startScanner` again (or unmounting the component) leaks the scanner instance; calling `scanner.clear()` on `decodedText` success doesn't cover error/unmount paths. Multiple scanner DOM elements can accumulate.

### C-7 — `service-worker.js` — `fetch` event handler returns `undefined` on cache-miss + network-fail (breaks offline)
In the catch block of the fetch handler, the function returns nothing (implicitly `undefined`). When a tile URL misses the cache AND the network fails, the browser receives no response object — this causes a **runtime error** and can break the entire fetch event pipeline.  
**Fix:** Return a proper fallback Response.

---

## 🟠 HIGH BUGS

### H-1 — `stores/index.ts` — `devtools` env check uses wrong API
`process.env.NODE_ENV` doesn't exist in a Vite (ESM) app. The correct check is `import.meta.env.DEV`. As written, devtools are **always disabled** (the expression evaluates to `undefined === 'development'` → `false`).

### H-2 — `DropMap.tsx` — Admin locations marker renders a `<div>` inside `<MapContainer>`, not a Leaflet child
```tsx
{isSuperAdmin && Object.entries(adminLocations).map(([uid, loc]) => (
   <div key={uid}>  {/* ← THIS IS WRONG */}
     <Marker ...>
```
A bare `<div>` is not a valid React-Leaflet child. The `<Marker>` must be a direct child or nested inside a Leaflet layer group. This silently breaks marker rendering for super admins.

### H-3 — `DropMap.tsx` — Leaflet default icon broken (classic webpack/vite issue)
No default icon fix is applied. The default Leaflet marker images rely on CSS url() references that Vite breaks during bundling. The `createIcon` function fixes custom markers but the `Marker` for `userLocation` has no icon prop — it will render as a broken image.

### H-4 — `DropMap.tsx` — No `useCallback`/`useMemo` on `createIcon` and `superAdminUserIcon`
`createIcon()` is called on every render, recreating `L.DivIcon` objects each time, causing all map markers to re-render. `superAdminUserIcon` is defined inline at component body level — a new object reference on every render.

### H-5 — `CreateDropScreen.tsx` — lat/lng default to `0, 0` (Gulf of Guinea, not Mamburao)
The form state initialises `lat: 0, lng: 0`. There is no geolocation or map-click picker wired up. Every drop created without manual input is placed in the ocean off West Africa.

### H-6 — `useEdgeFunctions.ts` — `error` state is never reset between calls
`setError(null)` is called at the start of each `callFunction`, but `setError(err.message)` from a previous call persists across component renders if the consumer reads `error` before calling the next function. Multiple concurrent calls share a single `loading/error` state — the last-writer wins.

### H-7 — `GlobalModals.tsx` — passes all `options` as props to `EpicModal` including unknown keys
`{...options}` spread on `<EpicModal>` passes any arbitrary key stored in the modal store as a DOM prop, causing React unknown-prop warnings and potentially overriding critical props like `isOpen` or `onClose`.

### H-8 — `supabase/migrations/001_init.sql` — `my_role()` function reads from unverified JWT claim
```sql
SELECT (auth.jwt() ->> 'user_role')::user_role;
```
`user_role` is a custom claim. If Supabase custom claims are not set up via a trigger or Admin API, this always returns `NULL`, causing **all RLS policies to silently fail** (deny all non-super_admin access). The migration has no setup for populating this claim.

### H-9 — `OfflineMapDownloader.tsx` — duplicates tile-download logic from `DropMap.tsx` with same cache key
Both components use `caches.open('mamburao-map-tiles-v1')` and the same tile generation algorithm independently. If both are mounted simultaneously they double-fetch all tiles and race on cache writes. One component should be the source of truth.

---

## 🟡 MEDIUM BUGS

### M-1 — `EpicModal.tsx` — `motion/react` import doesn't exist; correct package is `framer-motion`
`import { motion, AnimatePresence } from 'motion/react'` — the `motion` npm package at v12 does re-export a `motion/react` subpath, so this is technically valid for `motion@12`, but the dependency in `package.json` is listed as `"motion": "^12.23.24"`. If the package resolves to a version where the subpath isn't available this will runtime-crash. Should be verified and locked.

### M-2 — `ConfirmationModal.tsx` — prop types are `any`
All props typed as `any`. No type safety, no prop validation. Errors in callers will be silent.

### M-3 — `stores/index.ts` — `LocationBroadcast` imported but never used
Dead import inflates bundle.

### M-4 — `DropMap.tsx` — `@ts-ignore` comments suppress real type errors on `<Marker position=...>`
Two `@ts-ignore` suppressions hide legitimate TypeScript issues with `react-leaflet` `position` prop types. These should be fixed properly.

### M-5 — `DropMap.tsx` — `handleMarkerClick` is inline, recreated every render
Should be wrapped in `useCallback`.

### M-6 — `useProfile.ts` — returns `isClient` with comment `// or client depending on schema`
This comment reveals uncertainty about the schema. Combined with C-3, this confirms the data model is inconsistent. The return value of `isClient` is wrong.

### M-7 — `index.html` — title is `"My Google AI Studio App"` — placeholder not updated
Should be `"DropPin Ops"` or the project's real name.

### M-8 — `CreateDropScreen.tsx` — `assigned_to: userId` hardcodes self-assignment
Drops are always assigned to the creator. The assignee picker is completely absent. This defeats the entire multi-user drop assignment model.

---

## 🔵 LOW / QoL

### L-1 — `tsconfig.json` — `noEmit: true` but no `strict: true`
TypeScript strict mode is off. Enables silent null/undefined bugs.

### L-2 — Missing `ErrorBoundary` anywhere in the component tree
Any throw during render/effects crashes the entire app with a blank screen.

### L-3 — `public/service-worker.js` — no `activate` event with `clients.claim()`
New service worker won't take control of existing tabs until a reload. The tile cache may not be used on first load.

### L-4 — `metadata.json` — `name` and `description` are empty strings
Deployment metadata incomplete.

### L-5 — No `React.lazy` or code splitting
All features are eagerly loaded. QR scanner (html5-qrcode) is a heavy library loaded even when not needed.

### L-6 — `firestore.rules` — `getUserRole()` makes one Firestore `get()` per rule evaluation
For compound checks like `isSuperAdmin() || isAdmin()`, two sequential `get()` calls happen per request. Should use custom claims for performance.

---

## Files Requiring Full Replacement

1. `src/lib/env.ts` — C-1
2. `src/lib/firebase.ts` — C-2
3. `src/lib/supabase.ts` — (safe, no changes)
4. `src/types/database.ts` — C-3 (align to SQL schema)
5. `src/types/domain.ts` — C-3
6. `src/stores/index.ts` — H-1, M-3
7. `src/hooks/useProfile.ts` — C-3, C-4, M-6
8. `src/hooks/useEdgeFunctions.ts` — H-6
9. `src/components/layout/RoleGuard.tsx` — C-3
10. `src/components/map/DropMap.tsx` — C-5, H-2, H-3, H-4, M-4, M-5
11. `src/components/ui/GlobalModals.tsx` — H-7
12. `src/components/ui/ConfirmationModal.tsx` — M-2
13. `src/features/drops/CreateDropScreen.tsx` — H-5, M-8
14. `src/features/drops/QRConfirmationScreen.tsx` — C-6
15. `public/service-worker.js` — C-7, L-3
16. `index.html` — M-7
17. `supabase/migrations/001_init.sql` — H-8 (add claim trigger)
18. `.env.example` — C-2
19. `src/app/App.tsx` — L-2 (add ErrorBoundary)
