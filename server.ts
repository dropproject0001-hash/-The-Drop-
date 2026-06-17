import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { listVoices, EdgeTTS } from "edge-tts-universal";
import objectHash from "object-hash";

// Ensure process.env.GEMINI_API_KEY is available
const apiKey = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Robust model caller with auto-retries and fallback strategy to handle high load / unavailable errors on specific preview models
async function robustGenerateContent(params: any, retries = 2, delayMs = 500): Promise<{ response: any; usedModel: string }> {
  const primaryModel = params.model || "gemini-3.5-flash";
  const modelsToTry = [
    primaryModel,
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ];

  // Keep unique models only, preserving order
  const modelsQueue = Array.from(new Set(modelsToTry));
  let lastError: any = null;

  for (const modelCandidate of modelsQueue) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🤖 [robustGenerateContent] Querying Gemini model="${modelCandidate}" (attempt ${attempt + 1}/${retries + 1})...`);
        const result = await ai.models.generateContent({
          ...params,
          model: modelCandidate,
        });
        console.log(`✅ [robustGenerateContent] Success with model="${modelCandidate}" on attempt ${attempt + 1}`);
        return {
          response: result,
          usedModel: modelCandidate
        };
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const code = err?.status || err?.code || err?.statusCode || 500;
        console.warn(`⚠️ [robustGenerateContent] Failed with model="${modelCandidate}" on attempt ${attempt + 1}. Error: ${msg}. Status/Code: ${code}`);

        // Check if the current model is overloaded, unavailable, or rate limited (high demand)
        const msgLower = msg.toLowerCase();
        const isOverloadedOrUnavailable =
          code === 503 ||
          code === 429 ||
          msgLower.includes("503") ||
          msgLower.includes("429") ||
          msgLower.includes("unavailable") ||
          msgLower.includes("high demand") ||
          msgLower.includes("overloaded") ||
          msgLower.includes("exhausted") ||
          msgLower.includes("rate limit") ||
          msgLower.includes("limit exceeded") ||
          msgLower.includes("spikes in demand");

        if (isOverloadedOrUnavailable) {
          console.warn(`🚀 [robustGenerateContent] Model "${modelCandidate}" is overloaded or unavailable. Skipping further retries for this model and rotating immediately to the next candidate model in the queue...`);
          break; // break the attempt loop to move on to the next modelCandidate in modelsQueue immediately
        }

        if (attempt < retries) {
          const currentDelay = delayMs * Math.pow(1.5, attempt);
          console.log(`⏳ [robustGenerateContent] Waiting ${currentDelay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
        }
      }
    }
  }

  throw lastError || new Error("All Gemini models and retry attempts exhausted.");
}

// ✅ Initialize Unified Supabase Admin Client for Local Secure Gateway
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request body parsing
  app.use(express.json());

  // Tactical Chat co-pilot API route
  app.post("/api/copilot/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: "Missing 'message' content" });
        return;
      }

      if (!apiKey) {
        // Return a helpful local debug fallback if GEMINI_API_KEY is not configured yet
        res.json({
          response: "[TACTICAL OVERLORD offline] Gemini API key is missing. Please add GEMINI_API_KEY to your settings secrets to connect to secure satellite telemetry.",
          error: "API_KEY_UNAVAILABLE"
        });
        return;
      }

      const systemInstruction = `
You are the Tactical AI co-pilot of "The Drop (Droppin Ops v1.0)". You interface directly with covert tactical field operators.
Your callsign is OVERLORD COM.
Your personality is highly operational, responsive, secure, concise, and cyberpunk.
Always follow these rules:
1. Speak professionally, calmly, and authoritatively. Use tactical military or cybersecurity phrasing.
2. Keep your answers extremely short and concise (under 25-35 words or 2-3 brief punchy lines maximum) so they are perfectly optimized for Text-To-Speech (TTS) readout.
3. Be helpful regarding drop dynamics, coordinates, field safety, GPS telemetry, signal preservation, or general status queries.
4. Avoid verbose flowery paragraphs. Use direct statements.
      `.trim();

      // Prepare contents list, incorporating short history if provided
      const contents: any[] = [];
      if (Array.isArray(history)) {
        for (const item of history) {
          if (item.role && item.text) {
            contents.push({
              role: item.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: item.text }]
            });
          }
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const { response, usedModel } = await robustGenerateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.75,
        }
      });

      const generatedText = response.text || "Report received. Signal clear.";

      res.json({
        response: generatedText,
        model: usedModel
      });

    } catch (err: any) {
      console.error("[Copilot Error] Exception occurred calling Gemini API:", err);
      res.status(500).json({
        error: "TACTICAL ERROR",
        details: err.message || String(err)
      });
    }
  });

  // Authenticate user via bearer token in local gateway
  const getAuthenticatedUser = async (authorizationHeader?: string) => {
    console.log(`🔑 [getAuthenticatedUser] Verifying bearer token... Header present: ${!!authorizationHeader}`);
    if (!supabaseAdmin) {
      console.error("❌ [getAuthenticatedUser] Database configuration (supabaseAdmin) is missing on backend");
      throw new Error("Database configuration missing on backend");
    }
    if (!authorizationHeader) {
      console.error("❌ [getAuthenticatedUser] Unauthorized: Missing authorization header");
      throw new Error("Unauthorized: Missing authorization header");
    }
    const token = authorizationHeader.replace("Bearer ", "");
    try {
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (userError) {
        console.error("❌ [getAuthenticatedUser] getUser failed with error:", userError.message, userError);
        throw new Error(`Unauthorized: Invalid token (${userError.message})`);
      }
      if (!user) {
        console.error("❌ [getAuthenticatedUser] getUser returned null user object");
        throw new Error("Unauthorized: Invalid token (empty user response)");
      }
      console.log(`👤 [getAuthenticatedUser] Successfully authenticated user: ID=${user.id}, Email=${user.email}`);
      return user;
    } catch (err: any) {
      console.error("❌ [getAuthenticatedUser] Unexpected exception inside getUser:", err.message || err);
      throw err;
    }
  };

  // ✅ Secure Gateway for Supabase Custom Functions
  app.post("/api/supabase-functions/:functionName", async (req, res) => {
    const { functionName } = req.params;
    const startTime = Date.now();
    console.log(`📡 [TACTICAL NODE] Gateway request for function: "${functionName}"`);

    if (!supabaseAdmin) {
      console.error("❌ [TACTICAL NODE] Supabase admin client not initialized. VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
      res.status(500).json({ error: "Supabase integration not configured on hosting container." });
      return;
    }

    try {
      const authHeader = req.headers.authorization;

      switch (functionName) {
        case "create-dropper": {
          console.log("📝 [create-dropper] Request received! Authenticating caller...");
          const user = await getAuthenticatedUser(authHeader);
          
          console.log(`📝 [create-dropper] Loading profile for caller ID=${user.id}...`);
          const { data: profile, error: fetchProfileError } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (fetchProfileError) {
            console.error("❌ [create-dropper] Failed to fetch caller profile:", fetchProfileError.message, fetchProfileError);
            res.status(403).json({ error: "Forbidden: Could not load caller permissions profile." });
            return;
          }

          if (!profile || profile.role !== "super_admin") {
            console.warn(`⚠️ [create-dropper] Access Denied! User ID=${user.id} has role="${profile?.role}", expected "super_admin"`);
            res.status(403).json({ error: "Forbidden: Only Super Admin can register new agents." });
            return;
          }

          const { username, password, phone, role = "dropper" } = req.body;
          console.log(`📝 [create-dropper] Validating creation params: username=@${username}, role=${role}, phone=${phone || 'none'}`);
          if (!username || !password) {
            console.error("❌ [create-dropper] Validation failed: missing username or password");
            res.status(400).json({ error: "Username and password are required" });
            return;
          }

          const email = `${username}@internal.droppinops.local`;
          
          // Check if profile already exists for name to avoid duplicated profile rows
          console.log(`📝 [create-dropper] Checking if display_name=@${username} already exists in profiles...`);
          const { data: existingProfile, error: existingProfileErr } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("display_name", username)
            .maybeSingle();

          if (existingProfileErr) {
            console.error("❌ [create-dropper] Profile lookup error:", existingProfileErr.message, existingProfileErr);
          }

          let authData;
          if (existingProfile) {
            console.log(`📝 [create-dropper] Found existing profile ID=${existingProfile.id} matching username=@${username}. Linking...`);
            const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(existingProfile.id);
            if (getUserError) {
              console.error("❌ [create-dropper] Existing auth user lookup failed:", getUserError.message, getUserError);
            } else if (existingUser) {
              authData = { user: existingUser.user };
              console.log(`📝 [create-dropper] Adopted existing auth user ID=${authData.user.id}`);
            }
          }

          if (!authData) {
            console.log(`📝 [create-dropper] Creating new auth user in Supabase Auth: email=${email}, role=${role}`);
            const { data: newAuthData, error: authError } = await supabaseAdmin.auth.admin.createUser({
              email,
              password,
              phone: phone || undefined,
              email_confirm: true,
              user_metadata: { username, role },
              app_metadata: { user_role: role }
            });
            if (authError) {
              console.error("❌ [create-dropper] supabaseAdmin.auth.admin.createUser failed:", authError.message, authError);
              throw authError;
            }
            authData = newAuthData;
            console.log(`✅ [create-dropper] Auth user created successfully. ID=${authData.user.id}`);
          }

          // Force create / update corresponding profile record
          console.log(`📝 [create-dropper] Upserting profiles row: ID=${authData.user.id}, display_name=${username}, role=${role}`);
          const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .upsert({
              id: authData.user.id,
              role,
              display_name: username,
              phone: phone || null,
            }, { onConflict: "id" });

          if (profileError) {
            console.error("❌ [create-dropper] profiles upsert query failed:", profileError.message, profileError);
            throw profileError;
          }
          console.log(`✅ [create-dropper] Profile row successfully upserted.`);

          // Add secure audit log trace
          console.log("📝 [create-dropper] Inserting activity audit log trace...");
          const { error: logError } = await supabaseAdmin.from("activity_log").insert({
            actor_id: user.id,
            action: "create_account",
            entity_type: "profile",
            entity_id: authData.user.id,
            meta: { username, role, email }
          });
          if (logError) {
            console.error("❌ [create-dropper] activity_log insert failed (non-blocking):", logError.message, logError);
          }

          console.log(`🎉 [create-dropper] All steps completed successfully for user @${username}`);
          res.json({
            success: true,
            user: authData.user,
            message: `${role.toUpperCase()} account created successfully for @${username}`
          });
          break;
        }

        case "set-user-role": {
          const user = await getAuthenticatedUser(authHeader);
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (!profile || profile.role !== "super_admin") {
            res.status(403).json({ error: "Forbidden: Only super_admin can change roles" });
            return;
          }

          const { targetUserId, newRole } = req.body;
          if (!targetUserId || !["super_admin", "admin", "client", "dropper"].includes(newRole)) {
            res.status(400).json({ error: "Invalid target user ID or role specification." });
            return;
          }

          const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ role: newRole })
            .eq("id", targetUserId);

          if (updateError) throw updateError;

          await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
            app_metadata: { user_role: newRole },
          });

          await supabaseAdmin.from("activity_log").insert({
            actor_id: user.id,
            action: "update_role",
            entity_type: "profile",
            entity_id: targetUserId,
            meta: { new_role: newRole, previous_role: profile.role }
          });

          res.json({ success: true, message: `Role updated to ${newRole}` });
          break;
        }

        case "bootstrap-super-admin": {
          const { username, password, setupToken } = req.body;
          if (!username || !password || !setupToken) {
            res.status(400).json({ error: "Username, password and setup token are required." });
            return;
          }

          const { data: tokenData, error: tokenError } = await supabaseAdmin
            .from("setup_tokens")
            .select("*")
            .eq("token", setupToken)
            .eq("used", false)
            .single();

          if (tokenError || !tokenData) {
            res.status(403).json({ error: "Invalid or already used token" });
            return;
          }

          if (new Date(tokenData.expires_at) < new Date()) {
            res.status(403).json({ error: "Setup token expired" });
            return;
          }

          const email = `${username}@internal.droppinops.local`;
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { username, role: "super_admin" },
            app_metadata: { user_role: "super_admin" }
          });

          if (authError) throw authError;

          const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .upsert({ 
              id: authData.user.id,
              role: "super_admin",
              display_name: username 
            }, { onConflict: "id" });

          if (profileError) throw profileError;

          await supabaseAdmin
            .from("setup_tokens")
            .update({ used: true })
            .eq("id", tokenData.id);

          await supabaseAdmin.from("activity_log").insert({
            actor_id: authData.user.id,
            action: "bootstrap_super_admin",
            entity_type: "profile",
            entity_id: authData.user.id,
            meta: { username }
          });

          res.json({ success: true, message: "Super Admin bootstrapped successfully!" });
          break;
        }

        case "send-otp": {
          const { phone, purpose, appHash } = req.body;
          if (!phone) {
            res.status(400).json({ error: "Phone number is required" });
            return;
          }

          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

          const { error } = await supabaseAdmin
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
            res.status(500).json({ error: "Failed to create OTP record in gateway" });
            return;
          }

          const accountSid = process.env.TWILIO_ACCOUNT_SID;
          const authToken = process.env.TWILIO_AUTH_TOKEN;
          const fromPhone = process.env.TWILIO_PHONE_NUMBER;

          let messageBody = `The Drop Security Code: ${otp}. Valid for 5 minutes.`;
          if (appHash && appHash.trim().length > 0) {
            messageBody += `\n${appHash}`;
          }

          if (!accountSid || !authToken || !fromPhone) {
            console.log(`[Local Fallback OTP SMS] Send to ${phone}: ${messageBody}`);
            res.json({ 
              success: true, 
              message: "OTP generated successfully (sandbox mode: code printed to server logs)",
              sandbox_code_visual: otp
            });
            return;
          }

          const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
          const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

          const twilioBody = new URLSearchParams({
            To: phone,
            From: fromPhone,
            Body: messageBody
          });

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Authorization": `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: twilioBody.toString()
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Twilio Gateway Error:", errorData);
            res.status(500).json({ error: "Failed to send SMS via Twilio", details: errorData });
            return;
          }

          res.json({ success: true, message: "OTP sent successfully via Twilio carrier." });
          break;
        }

        case "verify-otp": {
          const { phone_number, otp_code, purpose } = req.body;
          if (!phone_number || !otp_code) {
            res.status(400).json({ error: "Phone number and OTP are required" });
            return;
          }

          const clientIp = req.ip || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'unknown';

          const { data: isAllowed, error: rateError } = await supabaseAdmin.rpc("check_and_log_rate_limit", {
            p_ip: String(clientIp),
            p_phone: phone_number,
            p_action: "verify_otp",
            p_max_attempts: 5,
            p_window_seconds: 60
          });

          if (rateError) {
            console.error("Rate limiting database check failed:", rateError);
          }

          if (isAllowed === false) {
            res.status(429).json({ error: "Too many verification attempts. Please wait 1 minute." });
            return;
          }

          const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc("verify_secure_otp", {
            p_phone: phone_number,
            p_code: otp_code,
            p_purpose: purpose || "general"
          });

          if (rpcError || !rpcResult || !rpcResult.success) {
            const errorMsg = rpcResult?.error || "Invalid or expired OTP";
            const attemptsRemaining = rpcResult?.attempts_remaining;
            res.status(400).json({
              error: attemptsRemaining !== undefined && attemptsRemaining > 0
                ? `${errorMsg}. ${attemptsRemaining} attempts remaining.`
                : errorMsg,
              attempts_remaining: attemptsRemaining
            });
            return;
          }

          res.json({ success: true, message: "OTP verified successfully" });
          break;
        }

        case "register-client": {
          const { phone_number, alias } = req.body;
          if (!phone_number) {
            res.status(400).json({ error: "Phone number is required." });
            return;
          }

          const { data: existingUser } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("phone", phone_number)
            .maybeSingle();

          if (existingUser) {
            res.json({ success: true, message: "Phone number already registered. Proceeding to OTP." });
            return;
          }

          res.json({ success: true, message: "Registration initiated" });
          break;
        }

        case "broadcast-location": {
          const user = await getAuthenticatedUser(authHeader);
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (!profile || !["super_admin", "admin", "dropper"].includes(profile.role)) {
            res.status(403).json({ error: "Forbidden: Telemetry broadcast blocked." });
            return;
          }

          const payload = req.body;
          const STRICT_GOODS_EYE = process.env.STRICT_GOODS_EYE === "true";
          const RATE_LIMIT_MS = parseInt(process.env.RATE_LIMIT_MS || "4000");

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
              res.status(429).json({ error: "Rate limit exceeded", retry_after_seconds: retryAfter });
              return;
            }
          }

          if (STRICT_GOODS_EYE && !payload.drop_id) {
            // Return 200 instead of 400 so the client's outbox queue deletes it instead of retrying endlessly
            res.status(200).json({ success: false, ignored: true, message: "drop_id is mandatory for agents in STRICT_GOODS_EYE mode" });
            return;
          }

          if (payload.drop_id) {
            const { data: drop } = await supabaseAdmin
              .from("drops")
              .select("created_by, assigned_to, status")
              .eq("id", payload.drop_id)
              .single();

            if (!drop) {
              // Return 200 to clear bad payloads gracefully
              res.status(200).json({ success: false, ignored: true, message: "Drop not found" });
              return;
            }

            if (STRICT_GOODS_EYE && drop.status !== "active") {
              // Return 200 to prevent endless offline retries from the client outbox
              res.status(200).json({ success: false, ignored: true, message: "Drop must be active and is no longer valid" });
              return;
            }

            const canBroadcast =
              profile.role === "super_admin" ||
              drop.created_by === user.id ||
              drop.assigned_to === user.id;

            if (!canBroadcast) {
              // Return 200 to clear bad payloads gracefully
              res.status(200).json({ success: false, ignored: true, message: "Not authorized for this drop" });
              return;
            }
          }

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

          res.json({ success: true, location: inserted });
          break;
        }

        case "list-voices": {
          const user = await getAuthenticatedUser(authHeader);
          const allVoices: any = await listVoices();

          const formattedVoices = allVoices.map((v: any) => ({
            name: v.Name,
            locale: v.Locale,
            gender: v.Gender,
            voiceId: v.ShortName || v.Name,
            suggested: ["en-US", "cs-CZ", "fil-PH"].some(lang => v.Locale.startsWith(lang)),
          }));

          res.json({
            success: true,
            voices: formattedVoices,
            total: formattedVoices.length,
          });
          break;
        }

        case "tts-speak": {
          const user = await getAuthenticatedUser(authHeader);
          
          const { text, voice = "en-US-EmmaMultilingualNeural", rate = "+0%", pitch = "+0Hz", volume = "+0%" } = req.body;
          if (!text?.trim()) {
            res.status(400).json({ error: "Text content is required for speech synthesis" });
            return;
          }

          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          const requestHash = objectHash.MD5({ text: text.trim(), voice, rate, pitch, volume });
          const fileName = `${requestHash}.mp3`;
          const bucket = "tts-audio";

          const { data: existing } = await supabaseAdmin.storage.from(bucket).createSignedUrl(fileName, 3600);
          let audioUrl = existing?.signedUrl;

          let exists = false;
          if (audioUrl) {
            const { data: fileExists } = await supabaseAdmin.storage.from(bucket).list("", {
              search: fileName
            });
            exists = fileExists && fileExists.length > 0;
          }

          let cached = false;
          if (exists && audioUrl) {
            cached = true;
          } else {
            console.log(`🎙️ Generating new TTS for: ${text.substring(0, 60)}...`);
            const tts = new EdgeTTS(text, voice, { rate, pitch, volume });
            const result = await tts.synthesize();
            const audioBuffer = await result.audio.arrayBuffer();

            const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(fileName, Buffer.from(audioBuffer), {
              contentType: "audio/mpeg", upsert: true
            });

            if (uploadError) {
              console.error("Storage upload error:", uploadError);
            }

            const { data: signed } = await supabaseAdmin.storage.from(bucket).createSignedUrl(fileName, 3600);
            audioUrl = signed?.signedUrl;
            cached = false;
          }

          // Log transaction
          const logEntry = {
            user_id: user.id,
            role: profile?.role || "client",
            message: text,
            voice,
            duration_ms: Date.now() - startTime,
            status: "success",
            cached
          };

          await supabaseAdmin.from("tts_logs").insert(logEntry);

          res.json({ success: true, audioUrl, cached, voice });
          break;
        }

        default:
          res.status(404).json({ error: `Function "${functionName}" is not registered on secure local gateway.` });
      }
    } catch (err: any) {
      console.error(`❌ [Gateway error] Exception calling "${functionName}":`, err);
      res.status(500).json({
        error: "INTERNAL GATEWAY EXCEPTION",
        details: err?.message || String(err)
      });
    }
  });

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support Express v5 / SPA catch-all routing
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Drop Server] Tactical operations server started online at: http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Host Server Failure] Critical exception in startServer:", err);
});
