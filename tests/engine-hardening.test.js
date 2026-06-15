// Engine-hardening tests — lock in the correctness/robustness fixes to the
// E-Auditor ML layer and the E-Accountant tax engines so they can't regress.
import { describe, it, expect } from 'vitest';
import { MLIntel, TaxCalc, FinTwin, findingConfidence } from '../TaxAI.jsx';
const { vatLooksStandard } = FinTwin;

// A small but realistic parsed SAF-T fixture (balanced GL + sales + purchases).
function saftFixture() {
  const transactions = [];
  for (let i = 0; i < 60; i++) {
    const amt = 100 + ((i * 37) % 400);
    transactions.push({
      transactionID: 'T' + i, transactionDate: '2026-03-' + String((i % 27) + 1).padStart(2, '0'),
      lines: [
        { recordID: 'L' + i + 'd', debitAmount: amt, taxInfo: { taxPercentage: 21 } },
        { recordID: 'L' + i + 'c', creditAmount: amt },
      ],
    });
  }
  transactions.push({ transactionID: 'TX1', transactionDate: '2026-03-15', lines: [{ recordID: 'LX', debitAmount: 999999 }] }); // outlier
  const sales = { items: [] }, purchases = { items: [] };
  for (let i = 0; i < 30; i++) {
    const net = 1000 + i * 11, pnet = 500 + i * 7;
    sales.items.push({ invoiceNo: 'S' + i, invoiceDate: '2026-03-' + String((i % 27) + 1).padStart(2, '0'), customerID: 'C' + (i % 6), glTransactionID: 'T' + i, documentTotals: { netTotal: net, taxPayable: net * 0.21, grossTotal: net * 1.21 }, lines: [{}] });
    purchases.items.push({ invoiceNo: 'P' + i, invoiceDate: '2026-03-' + String((i % 27) + 1).padStart(2, '0'), supplierID: 'V' + (i % 6), documentTotals: { netTotal: pnet, taxPayable: pnet * 0.21, grossTotal: pnet * 1.21 }, lines: [{}] });
  }
  return { header: {}, transactions, sales, purchases };
}

describe('MLIntel determinism (audit reproducibility)', () => {
  it('glAnomalyScore (isolation forest) is identical across runs', () => {
    const p = saftFixture();
    const a = MLIntel.glAnomalyScore(p, 'en');
    const b = MLIntel.glAnomalyScore(p, 'en');
    expect(a.length).toBeGreaterThan(0);
    expect(a).toEqual(b); // was non-deterministic (Math.random) before the fix
  });
  it('invoiceAnomalyScore (autoencoder) is identical across runs, score in [0,1]', () => {
    const p = saftFixture();
    const a = MLIntel.invoiceAnomalyScore(p, 'en');
    const b = MLIntel.invoiceAnomalyScore(p, 'en');
    expect(a.length).toBeGreaterThan(0);
    expect(a).toEqual(b);
    for (const r of a) { expect(r.score).toBeGreaterThanOrEqual(0); expect(r.score).toBeLessThanOrEqual(1); }
  });
  it('simulateExposure is seed-stable', () => {
    const items = [{ pUpheld: 0.7, impactLow: 100, impactHigh: 200 }, { pUpheld: 0.5, impactLow: 50, impactHigh: 150 }];
    const a = MLIntel.simulateExposure(items, { runs: 3000 });
    const b = MLIntel.simulateExposure(items, { runs: 3000 });
    expect(a.mean).toBe(b.mean);
    expect(a.p90).toBe(b.p90);
  });
  it('crossPeriodReview never yields a non-finite z (no ±Infinity)', () => {
    const hist = [{ metrics: { revenue: 100 } }, { metrics: { revenue: 100 } }, { metrics: { revenue: 100 } }, { metrics: { revenue: 100 } }];
    const r = MLIntel.crossPeriodReview(hist, { metrics: { revenue: 9000 } });
    expect(r.length).toBeGreaterThan(0);
    for (const row of r) expect(Number.isFinite(row.z)).toBe(true);
  });
  it('crossPeriodReview treats <4 priors as insufficient data (normal)', () => {
    const r = MLIntel.crossPeriodReview([{ metrics: { revenue: 100 } }], { metrics: { revenue: 9000 } });
    expect(r[0].verdict).toBe('normal');
  });
});

describe('TaxCalc.grossToNet — 2026 LT payroll (chat advisor path)', () => {
  it('computes NPD on GROSS: full €747 at/below MMA, exhausted at high gross', () => {
    expect(TaxCalc.grossToNet(900).npd).toBeCloseTo(747, 0);
    expect(TaxCalc.grossToNet(1153).npd).toBeCloseTo(747, 0);
    expect(TaxCalc.grossToNet(3000).npd).toBeLessThan(5);
  });
  it('net < gross and employer cost > gross', () => {
    const r = TaxCalc.grossToNet(2000);
    expect(r.net).toBeGreaterThan(0);
    expect(r.net).toBeLessThan(2000);
    expect(r.totalCost).toBeGreaterThan(2000);
  });
  it('agrees with the canonical createPayrollEngine within a cent', () => {
    const eng = FinTwin.createPayrollEngine();
    for (const g of [1000, 1153, 1500, 2000, 2700, 5000]) {
      const a = TaxCalc.grossToNet(g), b = eng.calcEmployee({ gross: g });
      expect(Math.abs(a.net - b.net)).toBeLessThanOrEqual(0.02);
      expect(Math.abs(a.npd - b.npd)).toBeLessThanOrEqual(0.02);
      expect(Math.abs(a.gpm - b.gpm)).toBeLessThanOrEqual(0.02);
    }
  });
});

describe('vatLooksStandard — period-aware (9% abolished 2026-01-01)', () => {
  it('accepts the 21% standard rate', () => {
    expect(vatLooksStandard(1000, 210)).toBe(true);
    expect(vatLooksStandard(1000, 210, '2026-03-01')).toBe(true);
  });
  it('rejects 9% for 2026 docs but accepts it pre-2026', () => {
    expect(vatLooksStandard(1000, 90, '2026-03-01')).toBe(false);
    expect(vatLooksStandard(1000, 90, '2025-12-01')).toBe(true);
  });
  it('uses a relative tolerance so large invoices are not mislabeled', () => {
    expect(vatLooksStandard(1000000, 210000.5)).toBe(true);
  });
});

describe('findingConfidence is evidence-aware (not a flat lookup)', () => {
  it('more corroborating evidence does not lower confidence', () => {
    const few = findingConfidence({ rule_id: 'R', ruleMeta: { family: 'DUBL' }, severity: 'High', evidence: ['a'] });
    const many = findingConfidence({ rule_id: 'R', ruleMeta: { family: 'DUBL' }, severity: 'High', evidence: ['a', 'b', 'c', 'd', 'e', 'f'] });
    expect(many.score).toBeGreaterThanOrEqual(few.score);
  });
  it('a signal with a large measured deviation scores higher than a bare signal', () => {
    const bare = findingConfidence({ rule_id: 'S', ruleMeta: { kind: 'signal' }, severity: 'Medium', evidence: ['x'] });
    const sharp = findingConfidence({ rule_id: 'S', ruleMeta: { kind: 'signal' }, severity: 'Medium', evidence: ['x', 'y', 'z'], z: 4 });
    expect(sharp.score).toBeGreaterThan(bare.score);
  });
  it('still clamps to the 40–99 band', () => {
    const c = findingConfidence({ rule_id: 'S', ruleMeta: { kind: 'signal' }, severity: 'Critical', evidence: Array(50).fill('x'), z: 99 });
    expect(c.score).toBeGreaterThanOrEqual(40);
    expect(c.score).toBeLessThanOrEqual(99);
  });
});

describe('FinTwin ledger integrity', () => {
  it('trialBalance exposes a numeric difference and balances', () => {
    const twin = FinTwin.createTwin({ clientId: 'test' });
    const tb = twin.trialBalance();
    expect(typeof tb.difference).toBe('number'); // was undefined → UI showed "€?"
    expect(tb.balanced).toBe(true);
    expect(tb.difference).toBe(0);
  });

  const bal = (tb, acct) => { const r = tb.rows.find((x) => x.account === acct); return r ? r.balance : 0; };

  it('AR control reconciles to the open sales subledger after a partial payment', () => {
    const twin = FinTwin.createTwin({ clientId: 'rec-ar' });
    twin.ingest('sales.invoice.issued', { invoiceId: 'S1', customer: { name: 'Acme', code: 'C1' }, net: 1000, vat: 210, total: 1210, date: '2026-03-01' });
    twin.ingest('payment.received', { paymentId: 'PR1', amount: 500, date: '2026-03-10', invoiceIds: ['S1'] });
    const tb = twin.trialBalance();
    const inv = twin.getEntity('invoice', 'S1');
    expect(tb.balanced).toBe(true);
    expect(bal(tb, '2410')).toBeCloseTo(710, 2);                  // AR control
    expect(bal(tb, '2410')).toBeCloseTo(inv.total - inv.paid, 2); // == open subledger
  });

  it('an over-payment posts the excess to customer advances (AR not driven negative)', () => {
    const twin = FinTwin.createTwin({ clientId: 'rec-adv' });
    twin.ingest('sales.invoice.issued', { invoiceId: 'S2', customer: { name: 'B', code: 'C2' }, net: 100, vat: 21, total: 121, date: '2026-03-01' });
    twin.ingest('payment.received', { paymentId: 'PR2', amount: 200, date: '2026-03-05', invoiceIds: ['S2'] });
    const tb = twin.trialBalance();
    expect(tb.balanced).toBe(true);
    expect(bal(tb, '2410')).toBeCloseTo(0, 2);   // AR settled, not negative
    expect(bal(tb, '4492')).toBeCloseTo(-79, 2); // advances received (credit) = excess
  });

  it('a supplier over-payment posts the excess to supplier advances (AP not negative)', () => {
    const twin = FinTwin.createTwin({ clientId: 'rec-ap' });
    twin.ingest('purchase.invoice.received', { invoiceId: 'P1', vendor: { name: 'Sup', code: 'V1' }, net: 100, vat: 21, total: 121, date: '2026-03-01' });
    twin.ingest('payment.sent', { paymentId: 'PS1', amount: 200, date: '2026-03-05', invoiceIds: ['P1'] });
    const tb = twin.trialBalance();
    expect(tb.balanced).toBe(true);
    expect(bal(tb, '4430')).toBeCloseTo(0, 2);  // AP settled
    expect(bal(tb, '2044')).toBeCloseTo(79, 2); // advances paid (debit asset) = excess
  });

  it('a normal full payment leaves no advance and balances', () => {
    const twin = FinTwin.createTwin({ clientId: 'rec-full' });
    twin.ingest('sales.invoice.issued', { invoiceId: 'S3', customer: { name: 'D', code: 'C3' }, net: 100, vat: 21, total: 121, date: '2026-03-01' });
    twin.ingest('payment.received', { paymentId: 'PR3', amount: 121, date: '2026-03-09', invoiceIds: ['S3'] });
    const tb = twin.trialBalance();
    expect(tb.balanced).toBe(true);
    expect(bal(tb, '2410')).toBeCloseTo(0, 2);
    expect(bal(tb, '4492')).toBeCloseTo(0, 2); // no advance created
  });
});
