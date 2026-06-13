import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get("APP_URL") || '*',
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ✅ SECURE: Use caller's JWT from Authorization header
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const { data: { user: caller }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Verify caller is actually super_admin or admin (from app_metadata for security)
    let isAuthorized = caller.app_metadata?.user_role === 'super_admin' || caller.app_metadata?.user_role === 'admin';

    if (!isAuthorized) {
      // Fallback check in profiles if metadata is missing
      const { data: callerProfile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', caller.id)
        .single();

      if (callerProfile?.role === 'super_admin' || callerProfile?.role === 'admin') {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Forbidden: Insufficient privileges" }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { username, password, phone, role = 'dropper' } = await req.json();

    if (!phone) {
      return new Response(JSON.stringify({ error: "Phone number is required for tactical mobile authentication" }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!["super_admin", "admin", "client", "dropper"].includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if phone already exists in auth.users
    // (We use maybeSingle in profiles but admin.listUsers or similar for auth is better but profile is usually synced)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (existingProfile) {
      return new Response(JSON.stringify({ error: "Phone number already registered in profiles" }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Provision account with Phone Auth as primary
    // Note: email is kept as a fallback/proxy but phone is the goal.
    const email = `${username}@internal.droppinops.local`;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      phone,
      phone_confirm: true, // Mark phone as confirmed to enable immediate OTP login
      email_confirm: true,
      user_metadata: { username, full_name: username },
      app_metadata: { user_role: role }
    });

    if (authError) throw authError;

    // Upsert profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: authData.user.id,
        username, 
        role,
        alias: username.toUpperCase(),
        display_name: username,
        phone: phone // Sync phone to profiles for RLS lookups
      }, { onConflict: 'id' });

    if (profileError) throw profileError;

    // Audit log
    await supabaseAdmin.from('activity_log').insert({
      actor_id: caller.id,
      action: 'create_account',
      entity_type: 'profile',
      entity_id: authData.user.id,
      meta: { username, role, email, phone }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      user: authData.user,
      message: `${role.toUpperCase()} account provisioned successfully. Target: ${phone}`
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error("[create-dropper]", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
