# Multi-client sync backend (Supabase) — wiring guide

The app persists each client's twin locally (durable, per-browser). To share a
firm's clients across machines/users, point `createSyncManager` at a Supabase
project. No new bundle dependency — the adapter uses `fetch` against Supabase's
PostgREST API.

## 1. Create the table (Supabase → SQL editor)

```sql
-- One row per client; `snapshot` is twin.serialize() (the full event log).
create table if not exists public.twins (
  client_id   text primary key,
  snapshot    jsonb       not null,
  updated_at  timestamptz not null default now()
);

-- Lock to the firm's authenticated users (tighten to org/role as needed).
alter table public.twins enable row level security;
create policy "authenticated rw" on public.twins
  for all to authenticated using (true) with check (true);
```

## 2. Wire it (one line)

```js
import { createSyncManager, createSupabaseSyncAdapter, FinTwin } from './TaxAI.jsx';

const sync = createSyncManager({
  adapter: createSupabaseSyncAdapter({
    url: import.meta.env.VITE_SUPABASE_URL,   // https://<project>.supabase.co
    key: import.meta.env.VITE_SUPABASE_ANON_KEY,
  }),
});

// push the active client's twin after changes (debounced):
await sync.push(clientId, twin);

// pull + restore on load (e.g. when switching clients in bureau mode):
const snapshot = await sync.pull(clientId);
if (snapshot) twin = FinTwin.restoreTwin(snapshot, FinTwin.createTwin);
```

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel env vars. With no
adapter configured, `createSyncManager()` stays local-only (current behaviour).

## VMI / Peppol filing transport

The same pattern covers real filing — give `submitISaf` an HTTP transport:

```js
import { submitISaf, createHttpTransport, buildISafFromTwin } from './TaxAI.jsx';

const r = await submitISaf(buildISafFromTwin(twin, period, { regNo }), {
  transport: createHttpTransport('https://<your-vmi-gateway>/isaf', {
    headers: { Authorization: `Bearer ${token}` },
    // map your gateway's response to { ok, code, message, retryable }:
    mapResponse: (status, body) => ({ ok: status === 200, code: String(status), message: body, retryable: status >= 500 }),
  }),
  maxAttempts: 4,
});
```

Without a transport, `submitISaf` runs in dry-run (validates the i.SAF and
reports the verdict) — useful before you have credentials.
