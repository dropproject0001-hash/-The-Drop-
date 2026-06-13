// supabase/functions/tts-speak/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { EdgeTTS } from 'npm:edge-tts-universal'
import * as hash from 'npm:object-hash'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const startTime = Date.now()
  let userId: string | null = null
  let logEntry: any = { status: 'success' }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  try {
    const { text, voice = 'en-US-EmmaMultilingualNeural', rate = '+0%', pitch = '+0Hz', volume = '+0%' } = await req.json()

    if (!text?.trim()) {
      throw new Error('Text is required')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    userId = user.id

    const requestHash = hash.MD5({ text: text.trim(), voice, rate, pitch, volume })
    const fileName = `${requestHash}.mp3`
    const bucket = 'tts-audio'

    // Cache check
    const { data: existing } = await supabase.storage.from(bucket).createSignedUrl(fileName, 3600)
    let audioUrl = existing?.signedUrl

    // Verify if the file actually exists in storage even if signedUrl is returned
    let exists = false;
    if (audioUrl) {
      const { data: fileExists } = await supabase.storage.from(bucket).list('', {
        search: fileName
      });
      exists = fileExists && fileExists.length > 0;
    }

    if (exists && audioUrl) {
      logEntry.cached = true
    } else {
      console.log(`🎙️ Generating new TTS for: ${text.substring(0, 60)}...`)
      const tts = new EdgeTTS()
      const result = await tts.synthesize(text, { voice, rate, pitch, volume })
      const audioBuffer = await result.audio.arrayBuffer()

      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, new Uint8Array(audioBuffer), {
        contentType: 'audio/mpeg', upsert: true
      })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
      }

      const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(fileName, 3600)
      audioUrl = signed?.signedUrl
      logEntry.cached = false
    }

    logEntry = {
      ...logEntry,
      user_id: userId,
      role: user.app_metadata?.user_role || user.user_metadata?.role || 'client',
      message: text,
      voice,
      duration_ms: Date.now() - startTime,
      status: 'success'
    }

    // Log to DB (using service role client)
    await supabase.from('tts_logs').insert(logEntry)

    return new Response(
      JSON.stringify({ success: true, audioUrl, cached: logEntry.cached, voice }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('TTS Error:', error)

    logEntry.status = 'failed'
    logEntry.error = error.message

    if (userId) {
      await supabase.from('tts_logs').insert({
        user_id: userId,
        message: 'TTS failed',
        status: 'failed',
        error: error.message
      })
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
