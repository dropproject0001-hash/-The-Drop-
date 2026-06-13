import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_URL') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

async function hashOTP(otp: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(otp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, purpose, appHash } = await req.json();

    if (!phone) {
      return new Response(JSON.stringify({ error: "Phone number is required" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!E164_REGEX.test(phone)) {
      return new Response(JSON.stringify({ error: "Invalid phone number format. Use E.164 (e.g. +639123456789)" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 1. Generate a cryptographically secure 6-digit OTP
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const otp = (array[0] % 900000 + 100000).toString(); // 6-digit code
    const codeHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString(); // Reduced to 2 minutes

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 2. Store OTP in database (hashed)
    const { error } = await supabase
      .from("otp_codes")
      .insert({
        phone,
        code_hash: codeHash,
        purpose,
        expires_at: expiresAt,
        used: false,
        attempts: 0,
        max_attempts: 5
      });

    if (error) {
      console.error("Error saving OTP:", error);
      return new Response(JSON.stringify({ error: "Failed to create OTP" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 3. Send SMS via Twilio
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromPhone) {
      // In development, if Twilio is missing, we log the OTP to console for testing
      console.log(`[DEV] Twilio missing. OTP for ${phone}: ${otp}`);
      return new Response(JSON.stringify({ success: true, message: "OTP generated (Dev Mode: Logged to console)" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const auth = btoa(`${accountSid}:${authToken}`);
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    let messageBody = `The Drop Security Code: ${otp}. Valid for 2 minutes.`;
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
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
