-- 20260613000002_tactical_rls_fixes.sql
-- Refined RLS policies for 'dropper' role and cross-role visibility.

-- 1. Drops: Allow 'dropper' to see drops assigned to them
CREATE POLICY "dropper assigned drops"
ON public.drops
FOR SELECT
USING (public.my_role() = 'dropper' AND assigned_to = auth.uid());

-- 2. Drops: Allow 'dropper' to update drops assigned to them (e.g., status updates during tracking)
CREATE POLICY "dropper update own drops"
ON public.drops
FOR UPDATE
USING (public.my_role() = 'dropper' AND assigned_to = auth.uid());

-- 3. Profiles: Allow 'dropper' and 'admin' to see creators of drops
CREATE POLICY "visibility of drop creators"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.drops
    WHERE public.drops.created_by = public.profiles.id
    AND (public.drops.assigned_to = auth.uid() OR public.my_role() IN ('admin', 'super_admin'))
  )
);

-- 4. Activity Log: Allow 'dropper' to insert their own logs
CREATE POLICY "dropper insert activity"
ON public.activity_log
FOR INSERT
WITH CHECK (auth.uid() = actor_id AND public.my_role() = 'dropper');

COMMENT ON TABLE public.drops IS 'Security: Droppers can only see and update their assigned drops. Admins and Super Admins have broader access.';
