-- Fix HIGH-4: Secure room_id format and RLS policy
-- Requires room_id to be 'drop_{drop_id}' and verifies participant via drops table

DROP POLICY IF EXISTS "room participants" ON public.messages;

CREATE POLICY "room participants" ON public.messages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.drops d
    WHERE messages.room_id = 'drop_' || d.id::text
    AND (d.created_by = auth.uid() OR d.assigned_to = auth.uid())
  )
);

-- Ensure room_id matches the pattern
ALTER TABLE public.messages ADD CONSTRAINT room_id_format_check
CHECK (room_id ~ '^drop_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
