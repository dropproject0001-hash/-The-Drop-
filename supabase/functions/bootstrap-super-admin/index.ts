import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { username, password, setupToken } = await req.json();

    // 1. Validate token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('setup_tokens')
      .select('*')
      .eq('token', setupToken)
      .eq('used', false)
      .single();

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ error: "Invalid or already used token" }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // Check expiry
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Token expired" }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. Create User
    const email = `${username}@internal.droppinops.local`;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, role: 'super_admin' },
      app_metadata: { user_role: 'super_admin' }
    });

    if (authError) throw authError;

    // 3. Upsert Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: authData.user.id,
        username, 
        role: 'super_admin',
        alias: username.toUpperCase(),
        display_name: username 
      }, { onConflict: 'id' });

    if (profileError) throw profileError;

    // 4. Mark token used
    await supabaseAdmin
      .from('setup_tokens')
      .update({ used: true })
      .eq('id', tokenData.id);

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error("[bootstrap-super-admin]", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
