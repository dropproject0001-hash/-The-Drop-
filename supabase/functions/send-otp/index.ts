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

  const { phone, purpose } = await req.json();

  if (!phone) {
    return new Response(JSON.stringify({ error: "Phone number is required" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // 1. Generate a cryptographically secure 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 2. Store OTP in database
  const { error } = await supabase
    .from("otp_codes")
    .insert({
      phone,
      code: otp,
      purpose,
      expires_at: expiresAt,
      used: false
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
    return new Response(JSON.stringify({ error: "Missing Twilio credentials configuration" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const auth = btoa(`${accountSid}:${authToken}`);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const body = new URLSearchParams({
    To: phone,
    From: fromPhone,
    Body: `The Drop Security Code: ${otp}. Valid for 5 minutes.`
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
