# FINAL FIX PRIORITY LIST
## The Drop (Droppin Ops) — June 11, 2026

### 🔴 CRITICAL (Fix Immediately)

| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| 1 | `demo_role` localStorage bypass still active in production | `RoleContext.tsx`, `AuthFlow.tsx` | Low |
| 2 | Missing `/claim/:dropId` route | `AppRouter.tsx` | Very Low |
| 3 | `EncryptedChat.tsx` uses hardcoded key + wrong schema | `EncryptedChat.tsx` | Medium |
| 4 | `admin` role has no functional portal | `AdminPortal.tsx` | Medium |

### 🟠 HIGH (Before Field Testing)

| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| 5 | `CreateDropPanel.tsx` writes directly to DB | `CreateDropPanel.tsx` | Medium |
| 6 | `AuthFlow.tsx` is too large and complex | `AuthFlow.tsx` | High |
| 7 | Remaining `alert()` calls | Multiple files | Low |
| 8 | No ErrorBoundary on critical screens | `App.tsx` | Low |

### 🟡 MEDIUM (Before Production)

| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| 9 | Duplicate animation libraries (`motion` + `framer-motion`) | `package.json` | Low |
| 10 | No code splitting for heavy components | `QRConfirmationScreen`, `LocationTest` | Medium |
| 11 | TypeScript strict mode is disabled | `tsconfig.json` | Medium |
| 12 | `CreateDropScreen.tsx` still defaults to 0,0 coordinates | `CreateDropScreen.tsx` | Low |

### Recommended Order

1. Fix `demo_role` bypass + add `/claim` route (Today)
2. Fix `EncryptedChat.tsx` (Today/Tomorrow)
3. Build proper `AdminPortal` (Tomorrow)
4. Replace remaining `alert()` calls
5. Refactor `AuthFlow.tsx`
6. Add ErrorBoundary + Sentry
7. Schedule auto-expiration + apply DB trigger

**Estimated Time to Production-Ready:** 4–6 focused days
