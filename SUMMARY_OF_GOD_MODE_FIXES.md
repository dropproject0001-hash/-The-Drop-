# THE DROP — God Mode Deep Review Fixes
**Date:** June 13, 2026

## 🔴 CRITICAL Fixes Completed

### CRIT-1 — Hardcoded AES encryption key
- **Action:** Removed static key from `src/lib/crypto.ts`.
- **Solution:** Implemented `VITE_ENCRYPTION_KEY` environment variable with validation in `src/lib/env.ts` and `src/lib/validateEnv.ts`.

### CRIT-2 — OTP codes stored in plaintext
- **Action:** Migrated `otp_codes` table to store `code_hash` instead of plaintext.
- **Solution:** Edge functions now use SHA-256 to hash OTPs before storage and comparison.

### CRIT-3 — No brute-force protection on verify-otp
- **Action:** Added `attempts` and `max_attempts` tracking to `otp_codes`.
- **Solution:** `verify-otp` edge function now increments attempts on failure and locks out after 5 attempts. OTP lifetime reduced to 2 minutes.

### CRIT-4 — useEdgeFunctions.ts sends anon key
- **Action:** Refactored hook to use `supabase.functions.invoke()`.
- **Solution:** Correctly attaches user JWT for authenticated edge function calls.

## 🟠 HIGH Fixes Completed

### HIGH-1 — Duplicate IndexedDB outbox
- **Action:** Consolidated `LocationBroadcastService` to use `LocationOutbox`.
- **Solution:** Eliminated database divergence and ensured consistent offline sync.

### HIGH-3 — Wrong drop status query
- **Action:** Corrected `SuperAdminDashboard.tsx` to query for 'claimed' status.

### HIGH-5 — Agent location always resolves to null
- **Action:** Fixed `DropExecutionScreen.tsx` to correctly resolve the current dropper's latest location.

### HIGH-6 — No phone number format validation
- **Action:** Added E.164 validation to `send-otp` edge function and client-side forms.

## 🟡 MEDIUM Fixes Completed

### MED-4 — Database Enums type missing dropper
- **Action:** Updated `src/types/database.ts` to include `dropper` role in all relevant enums and table types.

---
*God Mode Executed.*
