import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { phone_number, otp_code } = await req.json();

  if (!phone_number || !otp_code) {
    return new Response("Phone number and OTP are required", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Find user by phone number
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("phone_number", phone_number)
    .single();

  if (error || !profile) {
    return new Response("Account not found", { status: 404 });
  }

  // Check if already verified
  if (profile.is_verified) {
    return new Response("Account already verified", { status: 400 });
  }

  // Check OTP validity
  const now = new Date();
  const otpExpired = profile.otp_expires_at && new Date(profile.otp_expires_at) < now;

  if (otpExpired || profile.otp_code !== otp_code) {
    return new Response("Invalid or expired OTP", { status: 400 });
  }

  // Generate random name
  const randomNames = ["Juan", "Maria", "Pedro", "Ana", "Jose", "Rosa", "Carlos", "Elena"];
  const randomName = randomNames[Math.floor(Math.random() * randomNames.length)] + 
                     " " + Math.floor(1000 + Math.random() * 9000);

  // Verify and update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      is_verified: true,
      otp_code: null,
      otp_expires_at: null,
      full_name: randomName,
    })
    .eq("id", profile.id);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({
    success: true,
    message: "Registration successful",
    full_name: randomName,
  }));
});
