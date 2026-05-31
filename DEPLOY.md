# Deploy TAXAI to Vercel — flattened, hard-to-break layout

Your build kept failing for ONE reason: the `src/` folder never reached GitHub,
so Vercel couldn't find `src/main.jsx`. This version REMOVES the `src` folder —
`main.jsx` and `TaxAI.jsx` now sit at the top level, so there is no subfolder to
lose.

After unzipping, the top level MUST look like this (all of it):

```
taxai-app/
├─ api/
│  └─ ai.js            (the AI key stays server-side here)
├─ public/
│  └─ README.md
├─ server/
│  └─ index.js
├─ main.jsx            ← was src/main.jsx (now at root)
├─ TaxAI.jsx           ← was src/TaxAI.jsx (now at root) — the whole app
├─ index.html          (already points to /main.jsx)
├─ package.json
├─ vercel.json
├─ vite.config.js
├─ .gitignore
└─ .env.example
```

The build only needs: `index.html`, `main.jsx`, `TaxAI.jsx`, `package.json`,
`vercel.json`, `vite.config.js`. If those six are at the top level, it builds.

---

## Upload to GitHub the reliable way (website)

Because there are now almost no subfolders, the website method is much safer:

1. On your repo page click **Add file → Upload files**.
2. Open the unzipped `taxai-app` folder, press Ctrl/Cmd+A to select EVERYTHING
   inside it (files AND the `api`, `public`, `server` folders), and drag it all
   into the GitHub box.
3. Wait until the list shows `main.jsx`, `TaxAI.jsx`, `index.html`,
   `package.json`, `vercel.json` — then click **Commit changes**.
4. CHECK: your repo's main page should now list `main.jsx` and `TaxAI.jsx`
   directly (not inside a `src` folder, not a `.zip`).

### Even more reliable: GitHub Desktop (https://desktop.github.com)
New repository → copy all unzipped contents into its folder → Commit → Publish.
It never drops files.

### Or skip GitHub entirely: Vercel CLI
In a terminal inside the folder: `npm i -g vercel` → `vercel` →
`vercel env add GEMINI_API_KEY` (paste key) → `vercel --prod`.

---

## In Vercel
1. **Add New → Project → Import** your repo (Vite is auto-detected).
2. **Environment Variables** → add `GEMINI_API_KEY` = your key from
   https://aistudio.google.com/apikey  (optional: `GEMINI_MODEL` = `gemini-2.5-pro`).
3. **Deploy**.

## Success looks like
The build log transforms **hundreds** of modules (not "2") and ends with
"Build Completed" + a `dist` folder. Then: open the app → SAF-T →
Load demo dataset → Rules tab → Generate rules.

## AI buttons error after deploy?
`GEMINI_API_KEY` missing/typo → fix in Vercel → Settings → Environment Variables
→ **Redeploy** (secrets load only during a build).
