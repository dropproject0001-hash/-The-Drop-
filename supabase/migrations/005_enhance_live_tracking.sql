-- supabase/migrations/005_enhance_live_tracking.sql
-- Adds optional drop_id for future drop-specific tracking (Goods Eye precision)
-- Hardens RLS and adds helpful indexes

ALTER TABLE public.locations 
ADD COLUMN IF NOT EXISTS drop_id UUID REFERENCES public.drops(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_locations_drop_id ON public.locations(drop_id);
CREATE INDEX IF NOT EXISTS idx_locations_user_recorded ON public.locations(user_id, recorded_at DESC);

-- Allow operators to optionally tag location with a drop they are executing
DROP POLICY IF EXISTS "operators can broadcast location" ON public.locations;

CREATE POLICY "operators can broadcast location" ON public.locations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  (public.my_role() IN ('super_admin', 'admin', 'dropper'))
);

-- Super admins can still see everything
-- (existing policy remains)

COMMENT ON COLUMN public.locations.drop_id IS 'Optional link to a specific drop for precise "Goods Eye" tracking';
