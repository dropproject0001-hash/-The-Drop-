-- supabase/migrations/20260614000001_secure_messages_rls.sql

-- Drop the old exploitable policy
DROP POLICY IF EXISTS "room participants" ON public.messages;

-- Create secure policy for messages
CREATE POLICY "room participants secure" ON public.messages
FOR ALL
USING (
  room_id LIKE 'drop_%' AND
  EXISTS (
    SELECT 1 FROM public.drops
    WHERE drops.id::text = substring(messages.room_id from 6)
      AND (drops.created_by = auth.uid() OR drops.assigned_to = auth.uid())
  )
);
