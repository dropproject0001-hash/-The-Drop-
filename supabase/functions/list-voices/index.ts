// supabase/functions/list-voices/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { VoicesManager } from 'npm:edge-tts-universal'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Optional auth (recommended)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const voicesManager = new VoicesManager()
    const allVoices = await voicesManager.getAllVoices()

    // Filter & format useful voices (you can expand this)
    const formattedVoices = allVoices.map(v => ({
      name: v.name,
      locale: v.locale,
      gender: v.gender,
      voiceId: v.shortName || v.name,
      suggested: ['en-US', 'cs-CZ', 'fil-PH'].some(lang => v.locale.startsWith(lang)), // prioritize relevant languages
    }))

    return new Response(
      JSON.stringify({
        success: true,
        voices: formattedVoices,
        total: formattedVoices.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('List Voices Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch voices', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
