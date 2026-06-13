import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_URL') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    const { phone_number, otp_code, purpose } = await req.json();

    if (!phone_number || !otp_code) {
      return new Response(JSON.stringify({ error: "Phone number and OTP are required" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const codeHash = await hashOTP(otp_code);

    // 1. Find the most recent active OTP for this phone and purpose
    let query = supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", phone_number)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (purpose) {
      query = query.eq("purpose", purpose);
    }

    const { data: otpRecords, error: otpError } = await query;

    if (otpError || !otpRecords || otpRecords.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const otpRecord = otpRecords[0];

    // Check if max attempts reached
    if (otpRecord.attempts >= otpRecord.max_attempts) {
      // Mark as used/invalid if too many attempts
      await supabase.from("otp_codes").update({ used: true }).eq("id", otpRecord.id);
      return new Response(JSON.stringify({ error: "Too many failed attempts. Please request a new code." }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. Verify hash
    if (otpRecord.code_hash !== codeHash) {
      // Increment attempts
      await supabase.rpc('increment_otp_attempts', { otp_id: otpRecord.id });
      return new Response(JSON.stringify({ error: "Invalid OTP code" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 3. Mark OTP as used
    const { error: updateError } = await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpRecord.id);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to verify OTP" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 4. Return success
    return new Response(JSON.stringify({
      success: true,
      message: "OTP verified successfully",
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
