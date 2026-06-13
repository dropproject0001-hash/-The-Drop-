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

  try {
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

    const { data: otpRecord, error: otpError } = await query.maybeSingle();

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

    // 3. Check if profile exists, if not create it (auto-registration on first OTP success)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("phone", phone_number)
      .maybeSingle();

    let userId = profile?.id;

    if (!profile) {
      // Create a skeleton auth user if we want full Supabase Auth support.
      // However, without a password or official OTP provider, we'd need to create
      // a user with a random password.
      const dummyPassword = crypto.randomUUID();
      const email = `${phone_number.replace('+', '')}@mobile.internal`;

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: dummyPassword,
        phone: phone_number,
        email_confirm: true,
        user_metadata: { role: 'client' },
        app_metadata: { user_role: 'client' }
      });

      if (authError) {
        console.error("Auth user creation failed:", authError.message);
        // Fallback or handle error
      } else {
        userId = authUser.user.id;
        // Profile should be created by trigger or we do it manually
        const { error: insertError } = await supabase.from('profiles').upsert({
          id: userId,
          phone: phone_number,
          role: 'client',
          display_name: `Client ${phone_number.slice(-4)}`
        });
        if (insertError) console.error("Profile insert failed:", insertError.message);
      }
    }

    // 4. In a real world, we would return a custom JWT or sign the user in.
    // For now, we return success and the client side will handle session mocking or
    // we use the return data to help the client side "know" who it is.

    return new Response(JSON.stringify({
      success: true,
      message: "OTP verified successfully",
      user: { id: userId, phone: phone_number, role: 'client' }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
