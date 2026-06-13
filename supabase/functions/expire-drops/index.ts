import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_URL') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const now = new Date().toISOString();

  // 1. Expire drops
  const { data: expiredDrops, error: dropError } = await supabase
    .from('drops')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('expires_at', now)
    .select('id');

  if (dropError) {
    console.error('Error expiring drops:', dropError);
    return new Response(JSON.stringify({ error: dropError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 2. Clean up old/used OTP codes (FIX MED-6)
  // Prune anything older than 24 hours OR already used
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { error: otpError } = await supabase
    .from('otp_codes')
    .delete()
    .or(`used.eq.true,expires_at.lt.${yesterday}`);

  if (otpError) {
    console.error('Error pruning OTP codes:', otpError);
  }

  return new Response(JSON.stringify({ 
    success: true, 
    expired_count: expiredDrops?.length || 0,
    otp_cleanup: !otpError
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
