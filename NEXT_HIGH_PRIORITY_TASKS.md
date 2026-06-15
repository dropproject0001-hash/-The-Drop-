# NEXT_HIGH_PRIORITY_TASKS.md
## The Drop (Droppin Ops) — Remaining High-Priority Work

**Date:** June 11, 2026  
**Focus:** Only critical items needed before production/field testing.

---

### High Priority Tasks (Recommended Order)

| # | Task | Description | Estimated Effort | Priority | Status |
|---|------|-------------|------------------|----------|--------|
| 1 | **Replace remaining `alert()` calls** | Search the entire codebase for `alert(` and replace with `useToast()`. Focus on `CreateDropScreen.tsx`, error handlers, and admin flows. | Low (2–4 hours) | Critical | Done |
| 2 | **Apply Database Trigger** | Run `prevent_invalid_drop_status()` trigger in Supabase SQL Editor. This is the last line of defense for drop lifecycle integrity. | Low (15 mins) | Critical | Done |
| 3 | **Schedule Auto-Expiration Edge Function** | Deploy `expire-drops` function and set it to run every 6 hours using Supabase Cron or an external scheduler. | Medium (2–3 hours) | High | Skeleton Done |
| 4 | **Strengthen PIN System** | Move from environment variable to fetching PINs from a secure `app_settings` table in Supabase (already partially implemented). | Medium (3–4 hours) | High | Partial |
| 5 | **Add ErrorBoundary** | Wrap main routes (especially `DropMap` and dashboards) with the `ErrorBoundary` component to prevent full app crashes. | Low (1–2 hours) | High | Recommended |
| 6 | **Consistent Loading & Empty States** | Apply `LoadingSpinner` and `EmptyState` components across `DropperPanel`, Admin views, and map loading states. | Low–Medium (3–5 hours) | High | Partial |
| 7 | **Sentry Integration** | Add Sentry for production error monitoring and performance tracking. | Medium (4–6 hours) | High | Guidance Given |
| 8 | **Admin Dashboard Polish** | Add search, better filters, and improve bulk actions experience in `AdminDropsList.tsx`. | Medium (4–6 hours) | High | Partial |

---

### Quick Wins (Can be done in parallel)

- Update `.env.local` with correct Supabase keys and restart dev server (fixes "Invalid API key").
- Restart dev server after any `.env` changes.
- Test the 6-digit PIN flow on Super Admin / Admin / Dropper role selection.

---

### Not Recommended Right Now (Lower Priority)

- Battery Status API throttling (pattern already provided)
- Full unit tests
- Advanced geofencing
- Heavy UI animations

---

### Suggested Execution Order

1. **Today / Immediate**
   - Replace remaining `alert()` calls
   - Apply database trigger

2. **This Week**
   - Schedule Auto-Expiration function
   - Add `ErrorBoundary`
   - Strengthen PIN verification

3. **Before Field Testing**
   - Sentry integration
   - Consistent loading/empty states
   - Final Admin Dashboard polish

---

**Goal:** Reach a stable, testable state for real-world deployment in Mamburao operations.
