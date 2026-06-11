# PRE-DEPLOYMENT CHECKLIST
## The Drop (Droppin Ops) — Final Preparation

**Purpose:** Ensure the system is stable, secure, and ready for real field operations.

---

### 🔴 CRITICAL (Must Complete Before Testing)

| # | Task | Details | Effort |
|---|------|---------|--------|
| 1 | **Fix Environment Variables** | Create/update `.env.local` with correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Restart dev server. | Very Low |
| 2 | **Replace Remaining `alert()` Calls** | Search codebase for `alert(` and replace with `useToast()`. Priority files: `CreateDropScreen.tsx`, error handlers, and admin components. | Low |
| 3 | **Apply Database Trigger** | Run `prevent_invalid_drop_status()` trigger in Supabase SQL Editor. | Very Low |
| 4 | **Add ErrorBoundary** | Wrap `DropMap.tsx`, `SuperAdminLiveDashboard`, and main routes with `ErrorBoundary` component. | Low |
| 5 | **Secure Role PINs** | Move PIN verification to fetch from Supabase `app_settings` table instead of environment variables. | Medium |

---

### 🟠 HIGH PRIORITY (Strongly Recommended)

| # | Task | Details | Effort |
|---|------|---------|--------|
| 6 | **Deploy & Schedule Auto-Expiration** | Deploy `expire-drops` Edge Function and schedule it (every 6 hours recommended). | Medium |
| 7 | **Integrate Sentry** | Add Sentry for production error monitoring and crash reporting. | Medium |
| 8 | **Test Realtime Fallback** | Verify `useLiveLocations` correctly switches to polling when WebSocket fails. | Low |
| 9 | **Test Offline Queue** | Test `LocationBroadcastService` offline queuing + auto-flush on reconnect. | Low |
| 10 | **Apply Consistent Loading States** | Use `LoadingSpinner` and `EmptyState` components in `DropperPanel`, Admin views, and map loading. | Low–Medium |

---

### 🟡 RECOMMENDED BEFORE FIELD TESTING

- [ ] Verify **6-digit PIN protection** works on Super Admin, Admin, and Dropper role selection.
- [ ] Test full **Dropper flow**: Assign drop → Start tracking → Claim with proof.
- [ ] Test **Admin bulk actions** and status transitions with optimistic UI.
- [ ] Confirm **Battery-aware GPS throttling** works when battery is low.
- [ ] Hide `LocationDebugPanel` in production (only enable via `localStorage` flag).
- [ ] Review RLS policies on `drops` and `locations` tables.

---

### Quick Verification Commands

```bash
# Check for remaining alerts
grep -r "alert(" src/ --include="*.tsx" --include="*.ts"

# Build check
npm run build

# Type check
npm run lint
```

---

### Notes

- Focus on **Critical** items first — they have the highest impact on stability and security.
- Most items in this checklist can be completed within **1–2 days** of focused work.
- After completing the Critical section, the app should be stable enough for internal testing.

---

**Last Updated:** June 11, 2026
