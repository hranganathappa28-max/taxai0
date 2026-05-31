# TAXAI — Forensic Tax Intelligence (Lithuania)

A Palantir-themed, production-ready web application: a deterministic 300-rule
SAF-T compliance engine, seven forensic intelligence engines, an enterprise
financial-audit layer, 18 official-source AI agents, and a cinematic
black-and-white landing page — all in one React app.

The UI is fully black-and-white ("Palantir" aesthetic): black canvas, white
accents, Newsreader serif display, Archivo sans, JetBrains Mono, film-grain and
scanline overlays. Every button is wired and functional.

---

## Quick start (local)

```bash
# 1. install
npm install

# 2. set your AI key (server-side only — never shipped to the browser)
cp .env.example .env
#   then edit .env and paste your Gemini key into GEMINI_API_KEY

# 3. run the API proxy + the app together
npm start
#   → app:    http://localhost:5173
#   → proxy:  http://localhost:8787  (Vite proxies /api/* to it)
```

`npm start` runs both the Vite dev server and the AI proxy (via `concurrently`).
To run them separately: `npm run server` and `npm run dev`.

---

## How it's wired

```
Browser (React app)
   │  POST /api/ai   ← no API key in the browser
   ▼
Vite dev proxy  →  server/index.js  (holds GEMINI_API_KEY)
                        │
                        ▼
              Google Gemini API
```

- `src/TaxAI.jsx` — the entire application (landing page + platform).
  `export default App` shows the landing first; "Enter the Platform" mounts the
  full `TAXAI` app. Clicking the sidebar logo returns to the landing.
- `src/main.jsx` — React entry, mounts `<App/>`.
- `server/index.js` — AI proxy. Holds the key, adds per-IP rate limiting
  (20 req/min), forwards to Gemini. Exposes `/api/health`.

---

## Adaptive Rules · AI (company-specific, beyond the 300)

After the deterministic **300 rules** run, an AI agent generates **additional,
industry-specific rules tailored to the uploaded company** — surfacing tax-risk,
fraud/error-risk, and financial-health insights the generic 300 don't cover.
These appear in the **Rules** tab, in a clearly separated **"Adaptive Rules ·
AI"** section directly below the 300-rule catalog (the tab label shows `Rules ·
300 +N` once generated).

How it works (same philosophy as the rest of the app — *deterministic engine,
AI interprets*):

1. **Metric registry (deterministic).** `buildMetricRegistry()` computes ~55
   named, grounded metrics from the SAF-T data — cost-structure shares (fuel,
   payroll, subcontractor, materials…), asset/fleet intensity, customer/supplier
   concentration, cross-border share, cash-payment share, UoM signals, VAT
   recovery, margins, DSO/DPO, etc. — plus a keyword **sector scan** (Logistics,
   Construction, Retail, Manufacturing, IT, Hospitality, Real-estate, …).
2. **Rule design (AI).** The **Adaptive Rule Architect** agent (Gemini) receives
   the metric registry, the detected sector, the company facts, and the titles
   of the existing 300 rules (to avoid duplication). It returns **strict JSON**:
   8–14 bespoke rules, each with a machine-checkable `condition` that may
   reference **only** registry metric keys.
3. **Scoring (deterministic).** A small **safe evaluator** (`evalCondition`, no
   `eval`) scores each proposed rule against the metrics:
   `condition TRUE → FLAGGED`, `FALSE → CLEAR`, `metric missing → N/A`, with the
   observed value shown as evidence. PASS/FAIL is therefore reproducible and
   grounded in real figures — never an ungrounded LLM judgement.

The 300-rule guarantees are untouched; this is a strictly additive overlay.
Key functions: `buildMetricRegistry`, `evalCondition`, `evaluateGeneratedRule`,
`sanitizeGeneratedRules`, `runPersonalizedRules` (all in `src/TaxAI.jsx`).

---

## Production build & deploy

### Build the static front end
```bash
npm run build      # outputs to dist/
```

### Deploy options

**A) Single host (front end + proxy together)** — e.g. Render, Railway, Fly,
a VPS, or any Node host:
1. Set the env var `GEMINI_API_KEY` in your host's dashboard / secrets.
2. Serve `dist/` as static files and run `node server/index.js`.
3. Point your reverse proxy so `/api/*` → the Node server and everything else →
   `dist/`. (Nginx example below.)

**B) Static host + serverless function** — e.g. Vercel / Netlify:
1. Deploy `dist/` to the static host.
2. Recreate `server/index.js` as a serverless function at `/api/ai`
   (the logic is ~40 lines and host-agnostic). Set `GEMINI_API_KEY` as a
   project secret.

### Nginx example (option A)
```nginx
server {
  listen 80;
  server_name taxai.example.com;

  root /var/www/taxai/dist;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:8787;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
  location / {
    try_files $uri /index.html;   # SPA fallback
  }
}
```

---

## Security notes (read before going live)

- **The API key is server-side only.** It was removed from the client; the app
  calls `/api/ai`. Do not reintroduce a client-side key.
- **Lock CORS** in production: set `CORS_ORIGIN=https://your-domain` in `.env`.
- **Rate limiting** is a basic in-memory limiter; for multi-instance deploys put
  a real limiter / WAF in front.
- **GDPR**: the app processes accounting data. Host in the EU, add your DPA,
  and review the in-app disclaimer text for your jurisdiction.

## Accuracy notes
- Deterministic engines (300 SAF-T rules, KPIs, Benford, graph, temporal,
  risk score) are reproducible computations — they do **not** use the AI.
- The AI layer **interprets** the deterministic output; it never invents the
  numbers. Treat AI legal citations as "verify before filing".
- Not yet benchmarked against a labelled corpus of VMI-rejected files; this is
  decision-support, not a substitute for a licensed advisor or an official audit.

---

© 2026 TAXAI · Vilnius, Lithuania
