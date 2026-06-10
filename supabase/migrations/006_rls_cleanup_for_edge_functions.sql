-- supabase/migrations/006_rls_cleanup_for_edge_functions.sql
-- Keep the policy but add clear comment
DROP POLICY IF EXISTS "operators can broadcast location" ON public.locations;

CREATE POLICY "operators can broadcast location"
ON public.locations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  public.my_role() IN ('super_admin', 'admin', 'dropper')
);

COMMENT ON POLICY "operators can broadcast location" ON public.locations IS 
'INSERT policy kept for defense-in-depth. Primary authorization now handled by broadcast-location Edge Function using service role.';
