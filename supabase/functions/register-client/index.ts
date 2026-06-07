import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { phone_number } = await req.json();

  if (!phone_number) {
    return new Response("Phone number is required", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Check if phone number already exists
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone_number", phone_number)
    .single();

  if (existingUser) {
    return new Response("Phone number already registered", { status: 400 });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Create profile with OTP
  const { error } = await supabase.from("profiles").insert({
    phone_number,
    role: "client",
    otp_code: otp,
    otp_expires_at: expiresAt.toISOString(),
    is_verified: false,
    suspended: false,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // In production: Send OTP via SMS (Twilio, etc.)
  // For now we return OTP in response (for testing)
  return new Response(JSON.stringify({ 
    success: true, 
    message: "OTP sent", 
    otp: otp // Remove this in production
  }));
});
