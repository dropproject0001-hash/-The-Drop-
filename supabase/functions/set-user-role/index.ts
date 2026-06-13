// supabase/functions/set-user-role/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create admin client (service role)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create client with user's JWT to verify their role
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    // 1. Get current user from JWT
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Verify caller is super_admin (from profiles table)
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || callerProfile?.role !== "super_admin") {
      return new Response(JSON.stringify({ error: "Forbidden: Only super_admin can change roles" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Parse request
    const { targetUserId, newRole } = await req.json();

    if (!targetUserId || !["super_admin", "admin", "client", "dropper"].includes(newRole)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Update role in profiles
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ role: newRole })
      .eq("id", targetUserId);

    if (updateError) throw updateError;

    // 5. Force refresh of JWT claims by updating app_metadata
    await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      app_metadata: { user_role: newRole },
    });

    // 6. Audit log
    await supabaseAdmin.from('activity_log').insert({
      actor_id: user.id,
      action: 'update_role',
      entity_type: 'profile',
      entity_id: targetUserId,
      meta: { new_role: newRole, previous_role: callerProfile?.role }
    });

    return new Response(
      JSON.stringify({ success: true, message: `Role updated to ${newRole}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("set-user-role error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
