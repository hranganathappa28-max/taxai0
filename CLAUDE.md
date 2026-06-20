# TAXAI — project notes for Claude Code

Forensic tax-intelligence app for Lithuania (VAT/SAF-T/i.SAF/FR0600, e-invoicing, a financial "twin"). Single large app module **`TaxAI.jsx`** with deterministic engines + React UI; tests live in **`tests/*.test.js`** (Vitest). No TypeScript, no lint config.

## Commands
- `npm test` — run the deterministic test suite (Vitest, `vitest run`).
- `npm run build` — Vite build; since there's no TypeScript, this is the syntax/import/compile gate.
- `npm run dev` — local dev server.

## Conventions
- Engines are pure and deterministic; lock behaviour with tests. Many UI strings are bilingual (English / Lithuanian via `lang === 'lt'`).
- Match the surrounding style (naming, comment density, idiom). Prefer reusing helpers over adding parallel ones; avoid new dependencies.
- Tax-critical math (VAT position, FR0600 boxes, risk score) must have deterministic tests. **Never** weaken, skip, or delete a test to make the suite pass — fix the code.

## Builder–Checker loop
This repo has a two-agent loop (see `.claude/agents/builder.md`, `.claude/agents/checker.md`, and the `/buildloop` command in `.claude/commands/buildloop.md`). The **builder** writes and fixes code; the **checker** independently runs `npm test` + `npm run build` and reports failures as `file:line - what broke - which check`. The `/buildloop <task>` orchestrator cycles builder → checker until green or a stop rule fires.

(Naming note: a separate `/loop` exists in some environments for recurring intervals — this build-test-fix loop is `/buildloop` to avoid the collision. Rename the command file if you prefer `/loop`.)

## Loop stop rules

The team loops until one of these is true:

- **All green:** every check passes. Stop and report success **with the checker's final output as proof**.
- **5 cycles used:** stop. Report what still fails and what was tried.
- **Same failure twice in a row:** stop. The builder is guessing, not fixing — escalate to me.
- **A fix makes a previously passing check fail:** stop. Something is being broken to fix something else — escalate to me.

Never report success without checker output from the final cycle. Never weaken or delete a check to reach all green.
