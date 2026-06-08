# The Drop — Fix Apply Order & Deployment Guide

## Step 1 — Secrets & Environment (FIRST, before anything else)

1. **Rotate the exposed Firebase API key.**  
   The key `AIzaSyDGmSNHQas8gRtmBzpN1pDd4loMcCKOe-o` was committed to the repo. Rotate it immediately in the Firebase Console → Project Settings → API Keys.

2. **Add `firebase-applet-config.json` to `.gitignore`.**

3. **Create `.env.local`** (never committed) using `.env.example` as a template.  
   Fill in all `VITE_FIREBASE_*` and `VITE_SUPABASE_*` values.

---

## Step 2 — Database Migration (Supabase)

Run the **updated** `supabase/migrations/001_init.sql` against your Supabase project.

**If the database already exists and has data:**
- The `sync_role_to_jwt` trigger will backfill JWT claims on next profile update.
- To immediately backfill all existing users, run:
  ```sql
  UPDATE profiles SET role = role; -- triggers on_profile_role_change for all rows
  ```
- ⚠️ The `user_role` enum in the existing DB must be `('super_admin', 'admin', 'client')`.  
  If your DB has `'tanod'` rows, migrate them to `'client'` first:
  ```sql
  UPDATE profiles SET role = 'client' WHERE role = 'tanod';
  ```

---

## Step 3 — Apply Source File Fixes (in this order)

| Order | File | Bugs Fixed |
|-------|------|-----------|
| 1 | `src/lib/env.ts` | C-1 |
| 2 | `src/lib/firebase.ts` | C-2 |
| 3 | `src/lib/supabase.ts` | (support for C-1) |
| 4 | `src/types/database.ts` | C-3 |
| 5 | `src/types/domain.ts` | C-3 |
| 6 | `src/stores/modalStore.ts` | H-7 (types) |
| 7 | `src/stores/index.ts` | H-1, M-3 |
| 8 | `src/hooks/useProfile.ts` | C-3, C-4, M-6 |
| 9 | `src/hooks/useEdgeFunctions.ts` | H-6 |
| 10 | `src/components/layout/RoleGuard.tsx` | C-3 |
| 11 | `src/components/ui/ConfirmationModal.tsx` | M-2 |
| 12 | `src/components/ui/GlobalModals.tsx` | H-7 |
| 13 | `src/components/map/DropMap.tsx` | H-2, H-3, H-4, C-5, M-4, M-5, C-3 |
| 14 | `src/features/drops/CreateDropScreen.tsx` | H-5, M-8 |
| 15 | `src/features/drops/QRConfirmationScreen.tsx` | C-6 |
| 16 | `src/app/App.tsx` | L-2, C-1 |
| 17 | `public/service-worker.js` | C-7, L-3 |
| 18 | `index.html` | M-7 |
| 19 | `.env.example` | C-2 |

---

## Step 4 — Verify

```bash
npm run lint        # TypeScript errors
npm run build       # Full build check
npm run dev         # Dev server
```

Expected outcomes after applying fixes:
- App renders a `MissingEnvBanner` (not a blank crash) if env vars are absent
- Map markers all render correctly (no broken images)
- Super admin live-tracking button works and markers appear without wrapper error
- Drop status filter chips show `active`, `claimed`, `expired` (not `pending`/`completed`)
- RLS policies grant access to non-super_admin users (once JWT claims trigger runs)
- QR scanner cleans up properly on unmount
- Service worker takes control immediately on first load

---

## Remaining Recommendations (post-fix)

- Enable `strict: true` in `tsconfig.json` (L-1)
- Add `React.lazy()` code-splitting for `QRConfirmationScreen` (L-5)
- Replace the `assignedTo` text field in `CreateDropScreen` with a proper user-picker (M-8)
- Consolidate duplicate tile-download logic — use `OfflineMapDownloader` as the single source (H-9)
- Add Firestore custom claims via Cloud Functions for performance (L-6)
- Fill in `metadata.json` name and description (L-4)
