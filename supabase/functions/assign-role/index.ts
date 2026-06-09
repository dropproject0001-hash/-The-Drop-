import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  const { userId, newRole, requestedBy } = await req.json();

  // Security check: Only super_admin can assign roles
  const { data: requester } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', requestedBy)
    .single();

  if (requester?.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
  }

  // Update role
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, message: `Role updated to ${newRole}` }));
});
