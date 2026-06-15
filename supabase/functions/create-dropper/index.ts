import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 1. Verify Requester is Super Admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { data: profile, error: profileCheckError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileCheckError || profile?.role !== 'super_admin') {
      console.error(`[Auth] Unauthorized attempt by user ${user.id} with role ${profile?.role}`)
      return new Response(JSON.stringify({ error: 'RESTRICTED_ACCESS: SUPER_ADMIN_ONLY' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    const { username, password, phone, role } = await req.json()
    const email = `${username}@internal.droppinops.local`

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`[CreateUser] Initializing ${role} account: ${username} (${email})`)

    // 2. Check if user already exists in Auth
    let targetUserId: string | null = null;
    const { data: { users: existingUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) throw listError;

    const existingUser = existingUsers?.find(u => u.email === email);

    if (existingUser) {
      console.log(`[CreateUser] User already exists in Auth: ${existingUser.id}. Checking profile...`);
      targetUserId = existingUser.id;
    } else {
      // 3. Create the User in Auth
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username, role }
      });

      if (createError) {
        console.error(`[CreateUser] Auth creation failed:`, createError.message);
        return new Response(JSON.stringify({ error: `AUTH_FAILURE: ${createError.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }
      targetUserId = authData.user.id;
    }

    // 4. Upsert Profile (Ensure record exists and has correct role)
    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: targetUserId,
        username: username,
        role: role,
        phone: phone || null,
        display_name: username,
        is_online: false
      }, { onConflict: 'id' });

    if (upsertError) {
      console.error(`[CreateUser] Profile upsert failed:`, upsertError);
      return new Response(JSON.stringify({ error: `PROFILE_FAILURE: ${upsertError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 5. Log activity
    await supabaseAdmin.from('activity_log').insert({
      actor_id: user.id,
      action: 'create_account',
      entity_type: 'profile',
      entity_id: targetUserId,
      meta: { username, role, email }
    });

    return new Response(JSON.stringify({ success: true, userId: targetUserId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error(`[CreateUser] Critical Exception:`, error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
