import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, password, phone, role = 'dropper', requestedBy } = await req.json();

    // Security check: Only super_admin can create users
    const { data: requester } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', requestedBy)
      .single();

    if (requester?.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: "Unauthorized: Only Super Admin can create accounts" }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 1. Create the user in Auth
    // Note: We use username as part of email or just create with phone if possible.
    // For simplicity with Supabase, we usually use email. 
    // If user wants manual username, we can't easily do it without email unless we use a dummy domain.
    const email = `${username}@droppinops.com`;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      phone: phone || undefined,
      email_confirm: true,
      user_metadata: { username, role }
    });

    if (authError) throw authError;

    // 2. The profile might be created by a trigger, but let's ensure it has the right role and username
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        username, 
        role,
        alias: username.toUpperCase()
      })
      .eq('id', authData.user.id);

    if (profileError) throw profileError;

    return new Response(JSON.stringify({ 
      success: true, 
      user: authData.user,
      message: `${role.toUpperCase()} account created successfully for @${username}` 
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
