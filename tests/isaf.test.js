// Filing-grade i.SAF: the VAT register built from the twin's own invoices must
// be valid VMI i.SAF that round-trips through parseISAF with VAT tying back.
import { describe, it, expect } from 'vitest';
import { FinTwin, seedSampleTwin, buildISafFromTwin, parseISAF } from '../TaxAI.jsx';

describe('i.SAF export from the twin', () => {
  it('round-trips through parseISAF with matching counts and VAT (one month)', () => {
    const twin = FinTwin.createTwin({ clientId: '305123458' });
    seedSampleTwin(twin);
    const period = '2026-01';
    const parsed = parseISAF(buildISafFromTwin(twin, period, { regNo: '305123458' }));
    expect(parsed._parseError).toBeFalsy();
    const inP = (k) => twin.listEntities('invoice').filter((i) => i.kind === k && String(i.date).slice(0, 7) === period);
    expect(parsed.sales.length).toBe(inP('sales').length);
    expect(parsed.purchases.length).toBe(inP('purchase').length);
    const tV = (k) => inP(k).reduce((s, i) => s + i.vat, 0);
    const iV = (arr) => arr.reduce((s, i) => s + (i.vat || 0), 0);
    expect(Math.abs(iV(parsed.sales) - tV('sales'))).toBeLessThan(0.02);
    expect(Math.abs(iV(parsed.purchases) - tV('purchase'))).toBeLessThan(0.02);
  });
  it('full export (period=null) includes every sales invoice', () => {
    const twin = FinTwin.createTwin({ clientId: 'X' });
    seedSampleTwin(twin);
    const parsed = parseISAF(buildISafFromTwin(twin, null));
    expect(parsed.sales.length).toBe(twin.listEntities('invoice').filter((i) => i.kind === 'sales').length);
  });
});
