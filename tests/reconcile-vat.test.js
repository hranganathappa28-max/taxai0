// reconcileISAF's summary.vat is the headline net-VAT position — the figure VMI
// cross-checks against the FR0600 return. The twin-ledger tests cover discrepancy
// detection; these pin the AGGREGATION arithmetic and the net-position gate.
import { describe, it, expect } from 'vitest';
import { reconcileISAF } from '../TaxAI.jsx';

const decl = (invoiceNo, vat, taxable) => ({ invoiceNo, vat, taxable, counterpartyVat: 'LT100000000', cancelled: false });
const book = (invoiceNo, taxPayable, netTotal) => ({ invoiceNo, counterpartyVat: 'LT100000000', documentTotals: { taxPayable, netTotal } });

describe('reconcileISAF — VAT-position aggregation (summary.vat)', () => {
  it('sums output/input VAT on each side and derives the net position', () => {
    const isaf = { header: {}, sales: [decl('S1', 210, 1000), decl('S2', 90, 900)], purchases: [decl('P1', 100, 500)] };
    const saft = { sales: { items: [book('S1', 210, 1000), book('S2', 90, 900)] }, purchases: { items: [book('P1', 100, 500)] } };
    const v = reconcileISAF(isaf, saft).summary.vat;
    expect(v.outputISAF).toBe(300);
    expect(v.inputISAF).toBe(100);
    expect(v.netISAF).toBe(200);
    expect(v.outputSAFT).toBe(300);
    expect(v.inputSAFT).toBe(100);
    expect(v.netSAFT).toBe(200);
    expect(v.netDelta).toBe(0);
  });

  it('does NOT raise a net-position finding when i.SAF and the ledger agree', () => {
    const isaf = { header: {}, sales: [decl('S1', 210, 1000)], purchases: [] };
    const saft = { sales: { items: [book('S1', 210, 1000)] }, purchases: { items: [] } };
    expect(reconcileISAF(isaf, saft).findings.some((f) => f.id === 'ISAF-NET-POSITION')).toBe(false);
  });

  it('raises ISAF-NET-POSITION (Reject) and reports the deltas when net positions diverge', () => {
    const isaf = { header: {}, sales: [decl('S1', 260, 1000)], purchases: [] }; // €50 over-declared output VAT
    const saft = { sales: { items: [book('S1', 210, 1000)] }, purchases: { items: [] } };
    const recon = reconcileISAF(isaf, saft);
    expect(recon.summary.vat.outputDelta).toBe(50);
    expect(recon.summary.vat.netDelta).toBe(50);
    expect(recon.findings.find((f) => f.id === 'ISAF-NET-POSITION')?.severity).toBe('Reject');
  });

  it('bySeverity tallies are consistent with the findings list', () => {
    const isaf = { header: {}, sales: [decl('S1', 260, 1000)], purchases: [] };
    const saft = { sales: { items: [book('S1', 210, 1000)] }, purchases: { items: [] } };
    const recon = reconcileISAF(isaf, saft);
    expect(recon.bySeverity.Reject).toBe(recon.findings.filter((f) => f.severity === 'Reject').length);
    expect(recon.bySeverity.Warn).toBe(recon.findings.filter((f) => f.severity === 'Warn').length);
  });
});
