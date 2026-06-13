import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

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

      const response = await ai.models.generateContent({
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
        model: "gemini-3.5-flash"
      });

    } catch (err: any) {
      console.error("[Copilot Error] Exception occurred calling Gemini API:", err);
      res.status(500).json({
        error: "TACTICAL ERROR",
        details: err.message || String(err)
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
