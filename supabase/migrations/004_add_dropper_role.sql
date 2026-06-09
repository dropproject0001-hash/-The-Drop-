-- supabase/migrations/004_add_dropper_role.sql
-- Formalizing the 'dropper' role for field operators.

-- 1. Add 'dropper' to user_role enum
-- Note: Altering type is fine in Supabase, but we must handle it correctly.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'dropper';

-- 2. Update locations RLS to only allow operators (admin, super_admin, dropper) to broadcast
DROP POLICY IF EXISTS "own location rows" ON locations;

CREATE POLICY "operators can broadcast location"
ON locations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  (public.my_role() IN ('super_admin', 'admin', 'dropper'))
);

CREATE POLICY "own location read"
ON locations
FOR SELECT
USING (auth.uid() = user_id);
