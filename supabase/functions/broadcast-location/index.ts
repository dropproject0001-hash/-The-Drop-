// supabase/functions/broadcast-location/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LocationPayload {
  lat: number;
  lng: number;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  altitude?: number | null;
  drop_id?: string | null;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const STRICT_GOODS_EYE = Deno.env.get("STRICT_GOODS_EYE") === "true";
    const RATE_LIMIT_MS = parseInt(Deno.env.get("RATE_LIMIT_MS") || "4000");

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    // === Auth + Role Validation ===
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["super_admin", "admin", "dropper"].includes(profile.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: LocationPayload = await req.json();

    // === RATE LIMITING ===
    const { data: lastLoc } = await supabaseAdmin
      .from("locations")
      .select("recorded_at")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastLoc?.recorded_at) {
      const diff = Date.now() - new Date(lastLoc.recorded_at).getTime();
      if (diff < RATE_LIMIT_MS) {
        const retryAfter = Math.ceil((RATE_LIMIT_MS - diff) / 1000);
        return new Response(JSON.stringify({ error: "Rate limit exceeded", retry_after_seconds: retryAfter }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": retryAfter.toString() },
        });
      }
    }

    // === STRICT GOODS EYE MODE ===
    if (STRICT_GOODS_EYE && !payload.drop_id) {
      return new Response(JSON.stringify({ error: "drop_id is mandatory in STRICT_GOODS_EYE mode" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.drop_id) {
      const { data: drop } = await supabaseAdmin
        .from("drops")
        .select("created_by, assigned_to, status")
        .eq("id", payload.drop_id)
        .single();

      if (!drop) {
        return new Response(JSON.stringify({ error: "Drop not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (STRICT_GOODS_EYE && drop.status !== "active") {
        return new Response(JSON.stringify({ error: "Drop must be active" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const canBroadcast =
        profile.role === "super_admin" ||
        drop.created_by === user.id ||
        drop.assigned_to === user.id;

      if (!canBroadcast) {
        return new Response(JSON.stringify({ error: "Not authorized for this drop" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // === INSERT LOCATION ===
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("locations")
      .insert({
        user_id: user.id,
        lat: payload.lat,
        lng: payload.lng,
        accuracy: payload.accuracy ?? null,
        heading: payload.heading ?? null,
        speed: payload.speed ?? null,
        altitude: payload.altitude ?? null,
        drop_id: payload.drop_id ?? null,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // === ACTIVITY LOGGING ===
    await supabaseAdmin.from("activity_log").insert({
      actor_id: user.id,
      action: "location_broadcast",
      entity_type: "location",
      entity_id: String(inserted.id),
      meta: {
        drop_id: payload.drop_id,
        lat: payload.lat,
        lng: payload.lng,
        accuracy: payload.accuracy,
        strict_mode: STRICT_GOODS_EYE,
      },
    });

    return new Response(JSON.stringify({ success: true, location: inserted }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[broadcast-location] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
