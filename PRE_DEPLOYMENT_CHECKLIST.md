# PRE-DEPLOYMENT CHECKLIST (Critical Only)

## Must Complete Before Any Testing

- [ ] Replace all remaining `alert()` calls with `useToast()`
- [ ] Add `<ErrorBoundary>` around the app (especially `DropMap` and dashboards)
- [ ] Move role PINs from `.env` to Supabase `app_settings` table
- [ ] Apply `prevent_invalid_drop_status()` database trigger
- [ ] Deploy `expire-drops` Edge Function + schedule it
- [ ] Verify correct Supabase keys in `.env.local` and restart dev server
- [ ] Hide `LocationDebugPanel` in production builds

## High Priority (Do Before Field Testing)

- [ ] Set up Sentry for error monitoring
- [ ] Test full Dropper flow (tracking → claim with proof)
- [ ] Test full Client flow (view drop → claim)
- [ ] Test realtime fallback + offline queue
- [ ] Test 6-digit PIN protection on sensitive roles
