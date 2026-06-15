-- supabase/migrations/20260615000000_segregate_dropper_and_client_chats.sql

-- 1. Tidy up the old unified direct chat policy
DROP POLICY IF EXISTS "direct_chats_secure" ON public.messages;
DROP POLICY IF EXISTS "direct_dropper_chats_secure" ON public.messages;
DROP POLICY IF EXISTS "direct_client_chats_secure" ON public.messages;

-- 2. Strict policy for Dropper Chat Rooms (prefixed with 'admin_dropper_chat_')
-- Only Admins/Super Admins or the specific Dropper mapped to this room can view or append messages
CREATE POLICY "direct_dropper_chats_secure" ON public.messages
FOR ALL
USING (
  room_id LIKE 'admin_dropper_chat_%' AND (
    public.my_role() IN ('super_admin', 'admin') OR
    (public.my_role() = 'dropper' AND substring(room_id from 20) = auth.uid()::text)
  )
);

-- 3. Strict policy for Client/Buyer Chat Rooms (prefixed with 'admin_client_chat_')
-- Only Admins/Super Admins or the specific Client mapped to this room can view or append messages
CREATE POLICY "direct_client_chats_secure" ON public.messages
FOR ALL
USING (
  room_id LIKE 'admin_client_chat_%' AND (
    public.my_role() IN ('super_admin', 'admin') OR
    (public.my_role() = 'client' AND substring(room_id from 19) = auth.uid()::text)
  )
);
