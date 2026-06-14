## 2026-06-13 - [Privilege Escalation via Profile Role Update]
**Vulnerability:** Users could update their own 'role' column in the 'profiles' table. A trigger on this table automatically synced the role change to the user's Auth metadata, granting them elevated permissions (e.g., super_admin) in subsequent JWTs.
**Learning:** Combining permissive RLS policies on tables that trigger SECURITY DEFINER functions for Auth metadata updates creates a significant privilege escalation risk.
**Prevention:** Use BEFORE UPDATE triggers to restrict changes to sensitive columns (like 'role') to highly privileged accounts or service roles only. Always split 'ALL' RLS policies into granular actions.
