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

  const { phone_number, otp_code, purpose } = await req.json();

  if (!phone_number || !otp_code) {
    return new Response(JSON.stringify({ error: "Phone number and OTP are required" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Find valid OTP
  let query = supabase
    .from("otp_codes")
    .select("*")
    .eq("phone", phone_number)
    .eq("code", otp_code)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString());

  if (purpose) {
    query = query.eq("purpose", purpose);
  }

  const { data: otpRecord, error: otpError } = await query.single();

  if (otpError || !otpRecord) {
    return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // 2. Mark OTP as used
  const { error: updateError } = await supabase
    .from("otp_codes")
    .update({ used: true })
    .eq("id", otpRecord.id);

  if (updateError) {
    return new Response(JSON.stringify({ error: "Failed to verify OTP" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // 3. Return success
  return new Response(JSON.stringify({
    success: true,
    message: "OTP verified successfully",
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
