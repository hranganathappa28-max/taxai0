// Concrete drop-in adapters: a generic HTTP transport for submitISaf and a
// Supabase (PostgREST) sync adapter — exercised against a mocked fetch.
import { describe, it, expect, afterEach } from 'vitest';
import { createHttpTransport, createSupabaseSyncAdapter, createSyncManager, submitISaf, FinTwin, seedSampleTwin, buildISafFromTwin } from '../TaxAI.jsx';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });
const isafXml = () => { const t = FinTwin.createTwin({ clientId: 'X' }); seedSampleTwin(t); return buildISafFromTwin(t, null, { regNo: 'X' }); };

describe('createHttpTransport', () => {
  it('POSTs the document; submitISaf maps a 2xx to accepted', async () => {
    const calls = [];
    globalThis.fetch = async (url, init) => { calls.push({ url, init }); return { status: 200, text: async () => 'AB OK' }; };
    const r = await submitISaf(isafXml(), { transport: createHttpTransport('https://vmi.example/isaf', { headers: { Authorization: 'Bearer t' } }) });
    expect(r.status).toBe('accepted');
    expect(calls[0].url).toBe('https://vmi.example/isaf');
    expect(calls[0].init.method).toBe('POST');
    expect(calls[0].init.headers.Authorization).toBe('Bearer t');
  });
  it('maps 5xx to a retryable failure', async () => {
    globalThis.fetch = async () => ({ status: 503, text: async () => 'busy' });
    const r = await createHttpTransport('https://x')('<x/>');
    expect(r.ok).toBe(false);
    expect(r.retryable).toBe(true);
  });
});

describe('createSupabaseSyncAdapter', () => {
  it('requires url and key', () => { expect(() => createSupabaseSyncAdapter({})).toThrow(); });
  it('push → pull round-trips a twin snapshot through PostgREST (mocked)', async () => {
    const db = {};
    globalThis.fetch = async (url, init) => {
      if (init && init.method === 'POST') { const rows = JSON.parse(init.body); db[rows[0].client_id] = rows[0].snapshot; return { ok: true, status: 201, json: async () => [] }; }
      const m = /client_id=eq\.([^&]+)/.exec(url); const id = m ? decodeURIComponent(m[1]) : '';
      return { ok: true, status: 200, json: async () => (db[id] ? [{ snapshot: db[id] }] : []) };
    };
    const sm = createSyncManager({ adapter: createSupabaseSyncAdapter({ url: 'https://p.supabase.co', key: 'anon' }) });
    const twin = FinTwin.createTwin({ clientId: 'acme' }); seedSampleTwin(twin);
    const before = twin.eventCount();
    expect((await sm.push('acme', twin)).ok).toBe(true);
    const snap = await sm.pull('acme');
    expect(snap).toBeTruthy();
    expect(FinTwin.restoreTwin(snap, FinTwin.createTwin).eventCount()).toBe(before);
  });
});
