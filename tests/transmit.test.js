// Transmission + sync adapters: dry-run/local now, real endpoint/backend plug in.
import { describe, it, expect } from 'vitest';
import { FinTwin, seedSampleTwin, buildISafFromTwin, submitISaf, createSyncManager } from '../TaxAI.jsx';

const isafXml = (() => { const t = FinTwin.createTwin({ clientId: 'X' }); seedSampleTwin(t); return buildISafFromTwin(t, null, { regNo: 'X' }); })();

describe('submitISaf (VMI i.SAF transmission)', () => {
  it('dry-run validates and reports the summary (no endpoint)', async () => {
    const r = await submitISaf(isafXml);
    expect(r.status).toBe('validated');
    expect(r.dryRun).toBe(true);
    expect(r.summary.sales).toBeGreaterThan(0);
  });
  it('rejects invalid XML without an endpoint call', async () => {
    expect((await submitISaf('<nope/>')).status).toBe('rejected');
  });
  it('accepts via a transport (real-endpoint shape)', async () => {
    const r = await submitISaf(isafXml, { transport: async () => ({ ok: true, code: 'AB', message: 'Accepted' }) });
    expect(r.status).toBe('accepted');
    expect(r.code).toBe('AB');
  });
  it('retries a retryable failure then succeeds', async () => {
    let n = 0;
    const r = await submitISaf(isafXml, { baseDelayMs: 0, maxAttempts: 3, transport: async () => { n++; return n < 2 ? { ok: false, retryable: true } : { ok: true, code: 'AB' }; } });
    expect(r.status).toBe('accepted');
    expect(n).toBe(2);
  });
  it('stops on a non-retryable rejection', async () => {
    let n = 0;
    const r = await submitISaf(isafXml, { baseDelayMs: 0, transport: async () => { n++; return { ok: false, retryable: false, code: 'RE', message: 'Schema error' }; } });
    expect(r.status).toBe('rejected');
    expect(n).toBe(1);
  });
});

describe('createSyncManager (backend sync adapter)', () => {
  it('is local-only without an adapter', async () => {
    const sm = createSyncManager();
    expect(sm.enabled).toBe(false);
    expect((await sm.push('c', null)).ok).toBe(false);
  });
  it('round-trips a twin through an in-memory adapter (push → pull → restore)', async () => {
    const store = {};
    const sm = createSyncManager({ adapter: { push: async (id, snap) => { store[id] = snap; }, pull: async (id) => store[id] || null } });
    expect(sm.enabled).toBe(true);
    const twin = FinTwin.createTwin({ clientId: 'sync' }); seedSampleTwin(twin);
    const before = twin.eventCount();
    expect((await sm.push('sync', twin)).ok).toBe(true);
    const snap = await sm.pull('sync');
    expect(snap).toBeTruthy();
    const restored = FinTwin.restoreTwin(snap, FinTwin.createTwin);
    expect(restored.eventCount()).toBe(before);
  });
});
