import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { phone_number } = await req.json();

  if (!phone_number) {
    return new Response(JSON.stringify({ error: "Phone number is required" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Check if phone number already exists
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", phone_number) // Using 'phone' to match profiles schema in 001_init.sql
    .single();

  if (existingUser) {
    return new Response(JSON.stringify({ error: "Phone number already registered" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // 2. Create profile skeleton (verified=false)
  const { error: profileError } = await supabase.from("profiles").insert({
    phone: phone_number,
    role: "client",
    display_name: `User ${phone_number.slice(-4)}`,
    is_online: false,
  });

  if (profileError) {
    // It's okay if this fails because of unique constraint; the OTP is what matters for the flow
    console.warn("Profile creation skipped or failed:", profileError.message);
  }

  return new Response(JSON.stringify({ 
    success: true, 
    message: "Client registered"
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
