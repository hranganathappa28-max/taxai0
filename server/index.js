// ════════════════════════════════════════════════════════════════════
// TAXAI · AI PROXY SERVER
// Holds GEMINI_API_KEY server-side so it never reaches the browser.
// The client posts to /api/ai with the Gemini request body; this forwards
// it to Google with the key attached, then streams back the response.
//
// Run:  GEMINI_API_KEY=your_key node server/index.js
// (or set it in a .env / your host's secret manager)
// ════════════════════════════════════════════════════════════════════
import http from "node:http";

const PORT = process.env.PORT || 8787;
const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";
const UPSTREAM = (k) => `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${k}`;

// --- very small in-memory rate limiter (per IP) ---
const WINDOW_MS = 60_000, MAX_REQ = 20;
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now); hits.set(ip, arr);
  return arr.length > MAX_REQ;
}

function send(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.url === "/api/health") return send(res, 200, { ok: true, model: MODEL, keyConfigured: !!KEY });
  if (req.method !== "POST" || req.url !== "/api/ai") return send(res, 404, { error: "Not found" });

  if (!KEY) return send(res, 500, { error: "GEMINI_API_KEY not configured on the server" });

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  if (limited(ip)) return send(res, 429, { error: "Rate limit exceeded — try again shortly" });

  let raw = "";
  req.on("data", (c) => { raw += c; if (raw.length > 8_000_000) req.destroy(); });
  req.on("end", async () => {
    let payload;
    try { payload = JSON.parse(raw); } catch { return send(res, 400, { error: "Invalid JSON" }); }
    try {
      const upstream = await fetch(UPSTREAM(KEY), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await upstream.text();
      res.writeHead(upstream.status, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
      });
      res.end(text);
    } catch (e) {
      send(res, 502, { error: "Upstream AI request failed: " + (e?.message || "unknown") });
    }
  });
});

server.listen(PORT, () => {
  console.log(`TAXAI AI proxy listening on :${PORT}`);
  if (!KEY) console.warn("⚠  GEMINI_API_KEY is not set — /api/ai will return 500 until you set it.");
});
