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

  const { phone, purpose, appHash } = await req.json();

  if (!phone) {
    return new Response(JSON.stringify({ error: "Phone number is required" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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

  // 1. Perform rate limiting check (Max 3 attempts per 10 minutes per IP or phone number)
  const { data: isAllowed, error: rateError } = await supabase.rpc('check_and_log_rate_limit', {
    p_ip: clientIp,
    p_phone: phone,
    p_action: 'send_otp',
    p_max_attempts: 3,
    p_window_seconds: 600
  });

  if (rateError) {
    console.error('Rate limiting database check failed:', rateError);
  }

  if (isAllowed === false) {
    return new Response(
      JSON.stringify({ error: "Too many OTP requests. Please wait 10 minutes." }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 2. Generate a cryptographically secure 6-digit OTP
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const otp = (array[0] % 900000 + 100000).toString(); // 6-digit code
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

  // 3. Store OTP in database securely using RPC
  const { error: otpError } = await supabase.rpc('create_secure_otp', {
    p_phone: phone,
    p_code: otp,
    p_purpose: purpose || 'general',
    p_expires_at: expiresAt
  });

  if (otpError) {
    console.error("Error saving OTP:", otpError);
    return new Response(JSON.stringify({ error: "Failed to create OTP" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // 4. Send SMS via Twilio
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromPhone) {
    // In dev, we might not have Twilio. We should log the OTP for testing.
    console.log(`[DEV] OTP for ${phone}: ${otp}`);
    return new Response(JSON.stringify({ success: true, message: "OTP generated (Twilio not configured)" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const auth = btoa(`${accountSid}:${authToken}`);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  let messageBody = `The Drop Security Code: ${otp}. Valid for 5 minutes.`;
  if (appHash && appHash.trim().length > 0) {
    messageBody += `\n${appHash}`;
  }

  const body = new URLSearchParams({
    To: phone,
    From: fromPhone,
    Body: messageBody
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Twilio Error:", errorData);
    return new Response(JSON.stringify({ error: "Failed to send SMS", details: errorData }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ success: true, message: "OTP sent" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
