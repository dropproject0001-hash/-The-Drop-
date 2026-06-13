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

  // Extract client IP address for sliding window rate limit evaluation
  const clientIp = req.headers.get('cf-connecting-ip') || 
                   req.headers.get('x-real-ip') || 
                   req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                   'unknown';

  // 1. Perform rate limiting check (Max 5 attempts per 60 seconds per IP or phone number)
  const { data: isAllowed, error: rateError } = await supabase.rpc('check_and_log_rate_limit', {
    p_ip: clientIp,
    p_phone: phone_number,
    p_action: 'verify_otp',
    p_max_attempts: 5,
    p_window_seconds: 60
  });

  if (rateError) {
    console.error('Rate limiting database check failed:', rateError);
  }

  if (isAllowed === false) {
    return new Response(
      JSON.stringify({ error: "Too many verification attempts. Please wait 1 minute." }), 
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 2. Verify OTP using secure RPC
  const { data: rpcResult, error: rpcError } = await supabase.rpc('verify_secure_otp', {
    p_phone: phone_number,
    p_code: otp_code,
    p_purpose: purpose || 'general'
  });

  if (rpcError || !rpcResult || !rpcResult.success) {
    const errorMsg = rpcResult?.error || "Invalid or expired OTP";
    const attemptsRemaining = rpcResult?.attempts_remaining;
    const responseBody = {
      error: attemptsRemaining !== undefined && attemptsRemaining > 0
        ? `${errorMsg}. ${attemptsRemaining} attempts remaining.`
        : errorMsg,
      attempts_remaining: attemptsRemaining
    };

    return new Response(JSON.stringify(responseBody), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  // Return success
  return new Response(JSON.stringify({
    success: true,
    message: "OTP verified successfully",
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
