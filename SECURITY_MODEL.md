# Security Model — The Drop (Droppin Ops)

## Overview

The Drop uses a **defense-in-depth** security architecture. The primary security gate is the **Edge Function**, while **Row Level Security (RLS)** acts as a secondary safety net.

### Core Principle

> **Never trust the client.** All sensitive operations go through server-side validation first.

---

## How Edge Functions + RLS Work Together

### 1. Edge Function Layer (Primary Security)

**File:** `supabase/functions/broadcast-location/index.ts`

- Authenticates the user using their JWT
- Validates role (`super_admin`, `admin`, or `dropper`)
- Enforces **rate limiting** (default 4 seconds between broadcasts)
- Validates `drop_id` ownership when `STRICT_GOODS_EYE=true`
- Uses the **Service Role** key to insert data (bypasses RLS)

This is the **main gate** for location broadcasting, drop claiming, and other sensitive actions.

### 2. Row Level Security (RLS) — Defense in Depth

RLS policies exist on all major tables (`locations`, `drops`, `profiles`, etc.).

**Key Helper:**
```sql
CREATE FUNCTION my_role() ...
```

**How it works:**
- Most policies check `public.my_role()`
- The role is injected into the JWT via a trigger (`sync_role_to_jwt`)
- Even if someone bypasses the Edge Function, RLS still restricts what they can do

**Example Policy (locations):**
```sql
CREATE POLICY "operators can insert own location"
ON public.locations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND public.my_role() IN ('super_admin', 'admin', 'dropper')
);
```

### 3. Additional Security Layers

| Layer                    | Purpose                              | Status     |
|--------------------------|--------------------------------------|------------|
| 6-digit PIN              | Extra protection for sensitive roles | Implemented |
| Role-Based UI            | `RoleGuard` + helper hooks           | Implemented |
| Optimistic UI + Toasts   | Better UX + error visibility         | Implemented |
| Rate Limiting            | Prevents abuse in Edge Function      | Implemented |
| Activity Logging         | Audit trail for important actions    | Implemented |

---

## Summary

| Component           | Responsibility                     | Trust Level |
|---------------------|------------------------------------|-------------|
| **Client (React)**  | UI + User interaction              | Untrusted   |
| **Edge Functions**  | Business logic + validation        | Trusted     |
| **RLS Policies**    | Final database-level enforcement   | Trusted     |
| **Service Role**    | Used only inside Edge Functions    | Highly Trusted |

**Rule of Thumb:**  
If something can be done from the browser without going through an Edge Function, it should be heavily restricted by RLS.
