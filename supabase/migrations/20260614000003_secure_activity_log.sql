-- supabase/migrations/20260614000003_secure_activity_log.sql

-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "insert activity" ON public.activity_log;

-- Create a new policy that only allows service_role (Edge Functions) to insert
CREATE POLICY "service role inserts activity"
  ON public.activity_log
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Ensure super_admin can still read logs (already exists in 001_init.sql but being explicit)
DROP POLICY IF EXISTS "super_admin reads logs" ON public.activity_log;
CREATE POLICY "super_admin reads logs"
  ON public.activity_log
  FOR SELECT
  USING (auth.jwt() ->> 'user_role' = 'super_admin');
