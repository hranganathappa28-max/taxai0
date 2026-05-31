// ════════════════════════════════════════════════════════════════════
// TAXAI · AI PROXY — Vercel serverless function
// Lives at /api/ai automatically (Vercel maps the /api folder to routes).
// Holds GEMINI_API_KEY server-side so it never reaches the browser.
//
// Set the key in Vercel:  Project → Settings → Environment Variables
//   GEMINI_API_KEY = your_key
// (optional) GEMINI_MODEL = gemini-2.5-pro
// ════════════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  // CORS (same-origin on Vercel, but harmless to set)
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(404).json({ error: "Not found" });

  const KEY = process.env.GEMINI_API_KEY;
  const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";
  if (!KEY) return res.status(500).json({ error: "GEMINI_API_KEY not configured in Vercel env vars" });

  try {
    // Vercel parses JSON bodies automatically; fall back to manual parse just in case.
    const payload = typeof req.body === "object" && req.body ? req.body : JSON.parse(req.body || "{}");
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", "application/json");
    return res.send(text);
  } catch (e) {
    return res.status(502).json({ error: "Upstream AI request failed: " + (e?.message || "unknown") });
  }
}
