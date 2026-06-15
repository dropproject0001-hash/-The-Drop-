-- supabase/migrations/20260614000003_unify_admin_roles_and_secure_chats.sql

-- Drop the old super_admin-only policies on public tables
DROP POLICY IF EXISTS "super_admin full access"  ON public.profiles;
DROP POLICY IF EXISTS "super_admin sees all"     ON public.locations;
DROP POLICY IF EXISTS "super_admin full drops"   ON public.drops;
DROP POLICY IF EXISTS "super_admin full pickups" ON public.pickups;
DROP POLICY IF EXISTS "super_admin full messages" ON public.messages;
DROP POLICY IF EXISTS "super_admin reads logs"    ON public.activity_log;

-- Re-create database policies to allow BOTH super_admin and admin roles (unified Admins with Global Full Control)
CREATE POLICY "admin full access profiles"  ON public.profiles   FOR ALL USING (public.my_role() IN ('super_admin', 'admin'));
CREATE POLICY "admin sees all locations"     ON public.locations  FOR ALL USING (public.my_role() IN ('super_admin', 'admin'));
CREATE POLICY "admin full drops"             ON public.drops      FOR ALL USING (public.my_role() IN ('super_admin', 'admin'));
CREATE POLICY "admin full pickups"           ON public.pickups    FOR ALL USING (public.my_role() IN ('super_admin', 'admin'));
CREATE POLICY "admin full messages"          ON public.messages   FOR ALL USING (public.my_role() IN ('super_admin', 'admin'));
CREATE POLICY "admin reads logs"             ON public.activity_log FOR SELECT USING (public.my_role() IN ('super_admin', 'admin'));

-- Update Bulletin policies to allow BOTH super_admin and admin roles
DROP POLICY IF EXISTS "Only super_admins can insert bulletins" ON public.bulletins;
DROP POLICY IF EXISTS "Only super_admins can update bulletins" ON public.bulletins;
DROP POLICY IF EXISTS "Only super_admins can delete bulletins" ON public.bulletins;

CREATE POLICY "Admins can insert bulletins" ON public.bulletins
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND profiles.role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "Admins can update bulletins" ON public.bulletins
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND profiles.role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "Admins can delete bulletins" ON public.bulletins
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND profiles.role IN ('super_admin', 'admin')
  )
);

-- Secure exclusive direct chat policy for 1-on-1 operational channels with Admins
DROP POLICY IF EXISTS "direct_chats_secure" ON public.messages;
CREATE POLICY "direct_chats_secure" ON public.messages
FOR ALL
USING (
  room_id LIKE 'admin_dropper_chat_%' AND (
    public.my_role() IN ('super_admin', 'admin') OR
    substring(room_id from 20) = auth.uid()::text
  )
);
