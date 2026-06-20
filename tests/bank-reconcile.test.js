// Additional deterministic tests for the bank-reconciliation engine.
// Complements tests/bankrec.test.js (which covers happy-path exact matches and
// trial-balance settlement). These tests focus on the no-match / ambiguous /
// boundary / apply-options scenarios not already covered.
import { describe, it, expect } from 'vitest';
import { FinTwin, reconcileBankStatement, applyBankMatches } from '../TaxAI.jsx';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function makeEntry(overrides) {
  return { date: '2026-04-10', amount: 1210, direction: 'in', ref: '', party: '', ...overrides };
}

function twinWithSalesInvoice({ invoiceId = 'INV-001', total = 1210, paid = 0 } = {}) {
  const twin = FinTwin.createTwin({ clientId: 'brec-test' });
  twin.ingest('sales.invoice.issued', {
    invoiceId,
    customer: { name: 'Klientas UAB', code: 'C99' },
    net: 1000, vat: 210, total, date: '2026-04-01',
  });
  if (paid > 0) {
    twin.ingest('payment.received', {
      paymentId: 'PR-SEED',
      amount: paid, date: '2026-04-02', invoiceIds: [invoiceId], accountId: 'CASH',
    });
  }
  return twin;
}

function twinWithPurchaseInvoice({ invoiceId = 'PUR-001', total = 605 } = {}) {
  const twin = FinTwin.createTwin({ clientId: 'brec-test-pur' });
  twin.ingest('purchase.invoice.received', {
    invoiceId,
    vendor: { name: 'Tiekėjas UAB', code: 'V99' },
    net: 500, vat: 105, total, date: '2026-04-01',
  });
  return twin;
}

// ---------------------------------------------------------------------------
// reconcileBankStatement — no-match case
// ---------------------------------------------------------------------------

describe('reconcileBankStatement — no-match', () => {
  it('returns invoiceId null when the twin has no open invoices', () => {
    const twin = FinTwin.createTwin({ clientId: 'empty' });
    const entry = makeEntry({ amount: 500, ref: 'UNKNOWN', party: 'Nobody' });
    const results = reconcileBankStatement([entry], twin);
    expect(results.length).toBe(1);
    expect(results[0].invoiceId).toBeNull();
  });

  it('returns invoiceId null when no invoice matches the direction (inbound vs purchase)', () => {
    // Twin has only a purchase (outbound) invoice; inbound entry should not match
    const twin = twinWithPurchaseInvoice();
    const entry = makeEntry({ amount: 605, direction: 'in', ref: 'PUR-001', party: 'Tiekėjas UAB' });
    const results = reconcileBankStatement([entry], twin);
    expect(results[0].invoiceId).toBeNull();
    expect(results[0].kind).toBe('sales'); // direction in → expects sales
  });

  it('returns low confidence and auto false when only date signal fires (no ref/amount/party)', () => {
    // Entry amount 99999 vs open 100: fails all amount checks and has no ref or party.
    // Only the date signal (entry.date >= inv.date within 120 days) can fire,
    // giving score 0.1 → confidence 10 and auto=false.
    const twin = twinWithSalesInvoice({ invoiceId: 'INV-DATE', total: 100 });
    const entry = makeEntry({ amount: 99999, direction: 'in', ref: '', party: '' });
    const results = reconcileBankStatement([entry], twin);
    const m = results[0];
    // The date signal alone sets best; confidence is low and auto is definitely false
    expect(m.auto).toBe(false);
    expect(m.confidence).toBeLessThan(20);
    expect(m.basis).not.toContain('ref');
    expect(m.basis).not.toContain('amount=open');
    expect(m.basis).not.toContain('amount=total');
    expect(m.basis).not.toContain('partial');
  });
});

// ---------------------------------------------------------------------------
// reconcileBankStatement — ambiguous (amount+party but no ref → auto false)
// ---------------------------------------------------------------------------

describe('reconcileBankStatement — ambiguous / low-confidence', () => {
  it('does NOT set auto when ref does not contain the invoice id', () => {
    // party and amount match but ref is blank — cannot be auto-posted
    const twin = twinWithSalesInvoice({ invoiceId: 'S42', total: 1210 });
    const entry = makeEntry({ amount: 1210, direction: 'in', ref: '', party: 'Klientas UAB' });
    const results = reconcileBankStatement([entry], twin);
    const m = results[0];
    // Some match expected (amount=open + party → score 0.3+0.2 = 0.5 → 50 confidence)
    expect(m.invoiceId).toBe('S42');
    expect(m.auto).toBe(false); // no ref hit → not auto
    expect(m.basis).not.toContain('ref');
  });

  it('does NOT set auto when amount matches but ref and party are both absent', () => {
    const twin = twinWithSalesInvoice({ invoiceId: 'S43', total: 1210 });
    const entry = makeEntry({ amount: 1210, direction: 'in', ref: '', party: '' });
    const results = reconcileBankStatement([entry], twin);
    expect(results[0].auto).toBe(false);
  });

  it('sets auto true only when ref contains invoice id AND amount equals open balance', () => {
    const twin = twinWithSalesInvoice({ invoiceId: 'S44', total: 1210 });
    const entry = makeEntry({ amount: 1210, direction: 'in', ref: 'Invoice S44', party: '' });
    const results = reconcileBankStatement([entry], twin);
    const m = results[0];
    expect(m.invoiceId).toBe('S44');
    expect(m.auto).toBe(true);
    expect(m.basis).toContain('ref');
    expect(m.basis).toContain('amount=open');
  });
});

// ---------------------------------------------------------------------------
// reconcileBankStatement — purchase (outbound) invoice matching
// ---------------------------------------------------------------------------

describe('reconcileBankStatement — outbound / purchase direction', () => {
  it('matches an outbound entry to an open purchase invoice by ref and amount', () => {
    const twin = twinWithPurchaseInvoice({ invoiceId: 'PUR-77', total: 605 });
    const entry = makeEntry({ amount: 605, direction: 'out', ref: 'PUR-77', party: 'Tiekėjas UAB' });
    const results = reconcileBankStatement([entry], twin);
    const m = results[0];
    expect(m.invoiceId).toBe('PUR-77');
    expect(m.kind).toBe('purchase');
    expect(m.auto).toBe(true);
    expect(m.confidence).toBeGreaterThanOrEqual(80);
  });
});

// ---------------------------------------------------------------------------
// reconcileBankStatement — basis array content
// ---------------------------------------------------------------------------

describe('reconcileBankStatement — basis content', () => {
  it('includes "ref" in basis when ref contains the invoice id', () => {
    const twin = twinWithSalesInvoice({ invoiceId: 'S-REF', total: 1210 });
    const entry = makeEntry({ amount: 1210, ref: 'S-REF', party: '' });
    const m = reconcileBankStatement([entry], twin)[0];
    expect(m.basis).toContain('ref');
  });

  it('includes "amount=open" when entry amount equals open balance within 0.02', () => {
    const twin = twinWithSalesInvoice({ invoiceId: 'S-AMT', total: 1210 });
    const entry = makeEntry({ amount: 1210, ref: '', party: '' });
    const m = reconcileBankStatement([entry], twin)[0];
    expect(m.basis).toContain('amount=open');
  });

  it('includes "partial" when entry amount is less than open balance', () => {
    const twin = twinWithSalesInvoice({ invoiceId: 'S-PAR', total: 1210 });
    // Pay 500 of 1210 → open = 710; send an entry of 300 (< 710)
    const entry = makeEntry({ amount: 300, direction: 'in', ref: '', party: '' });
    const m = reconcileBankStatement([entry], twin)[0];
    // 300 <= 1210 + 0.02 → partial
    expect(m.basis).toContain('partial');
  });

  it('includes "party" when party name is a substring of the counterparty name', () => {
    const twin = twinWithSalesInvoice({ invoiceId: 'S-PTY', total: 1210 });
    // "Klientas" is a prefix of "Klientas UAB" stored in the twin
    const entry = makeEntry({ amount: 9999, direction: 'in', ref: '', party: 'Klientas' });
    const m = reconcileBankStatement([entry], twin)[0];
    expect(m.basis).toContain('party');
  });
});

// ---------------------------------------------------------------------------
// reconcileBankStatement — amount boundary (tolerance ≤ 0.02)
// ---------------------------------------------------------------------------

describe('reconcileBankStatement — amount tolerance boundary', () => {
  it('matches amount=open when difference is exactly 0.01 (within 0.02 tolerance)', () => {
    const twin = twinWithSalesInvoice({ invoiceId: 'S-TOL1', total: 1210 });
    const entry = makeEntry({ amount: 1210.01, direction: 'in', ref: '', party: '' });
    const m = reconcileBankStatement([entry], twin)[0];
    expect(m.basis).toContain('amount=open');
  });

  it('does NOT match amount=open when difference exceeds 0.02', () => {
    const twin = twinWithSalesInvoice({ invoiceId: 'S-TOL2', total: 1210 });
    const entry = makeEntry({ amount: 1210.05, direction: 'in', ref: '', party: '' });
    const m = reconcileBankStatement([entry], twin)[0];
    expect(m.basis).not.toContain('amount=open');
  });
});

// ---------------------------------------------------------------------------
// reconcileBankStatement — already fully paid invoice is excluded
// ---------------------------------------------------------------------------

describe('reconcileBankStatement — paid invoices excluded', () => {
  it('does not match an invoice whose open balance is zero', () => {
    // Create invoice with total=1210 and pre-pay 1210 → open=0 → filtered out
    const twin = twinWithSalesInvoice({ invoiceId: 'S-PAID', total: 1210, paid: 1210 });
    const entry = makeEntry({ amount: 1210, direction: 'in', ref: 'S-PAID', party: '' });
    const m = reconcileBankStatement([entry], twin)[0];
    expect(m.invoiceId).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// applyBankMatches — options: idPrefix, accountId
// ---------------------------------------------------------------------------

describe('applyBankMatches — options', () => {
  it('uses opts.idPrefix in the generated paymentId stored in the twin', () => {
    const twin = twinWithSalesInvoice({ invoiceId: 'S-OPT', total: 1210 });
    const entry = makeEntry({ amount: 1210, date: '2026-04-15', direction: 'in', ref: 'S-OPT' });
    const match = { entry, invoiceId: 'S-OPT', kind: 'sales', confidence: 90, auto: true, basis: ['ref', 'amount=open'] };
    applyBankMatches([match], twin, { idPrefix: 'MYBANK' });
    // The paymentId is MYBANK-20260415-0; it appears in the twin's payment entity
    const payments = twin.listEntities('payment');
    expect(payments.some((p) => String(p.id || p.paymentId || '').startsWith('MYBANK'))).toBe(true);
  });

  it('skips entries that have no invoiceId and returns the count of actually posted', () => {
    const twin = twinWithSalesInvoice({ invoiceId: 'S-SKIP', total: 1210 });
    const entryGood = makeEntry({ amount: 1210, direction: 'in', ref: 'S-SKIP' });
    const matchGood = { entry: entryGood, invoiceId: 'S-SKIP', kind: 'sales', confidence: 90, auto: true, basis: [] };
    const matchNone = { entry: makeEntry({ amount: 50, direction: 'in', ref: '' }), invoiceId: null, kind: 'sales', confidence: 0, auto: false, basis: [] };
    const posted = applyBankMatches([matchGood, matchNone], twin);
    expect(posted).toBe(1); // only the one with an invoiceId is posted
  });

  it('returns 0 when all matches have invoiceId null', () => {
    const twin = FinTwin.createTwin({ clientId: 'apply-none' });
    const matchNone = { entry: makeEntry(), invoiceId: null, kind: 'sales', confidence: 0, auto: false, basis: [] };
    expect(applyBankMatches([matchNone], twin)).toBe(0);
  });

  it('returns 0 for an empty matches array', () => {
    const twin = FinTwin.createTwin({ clientId: 'apply-empty' });
    expect(applyBankMatches([], twin)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// applyBankMatches — payment direction: inbound → payment.received, outbound → payment.sent
// ---------------------------------------------------------------------------

describe('applyBankMatches — payment direction', () => {
  it('settles sales invoice (payment.received) leaving open balance zero', () => {
    const twin = twinWithSalesInvoice({ invoiceId: 'S-DIR', total: 605 });
    const entry = makeEntry({ amount: 605, direction: 'in', date: '2026-04-20', ref: 'S-DIR' });
    const m = { entry, invoiceId: 'S-DIR', kind: 'sales', confidence: 99, auto: true, basis: [] };
    applyBankMatches([m], twin);
    expect(twin.getEntity('invoice', 'S-DIR').status).toBe('paid');
  });

  it('settles purchase invoice (payment.sent) leaving it paid', () => {
    const twin = twinWithPurchaseInvoice({ invoiceId: 'PUR-DIR', total: 605 });
    const entry = makeEntry({ amount: 605, direction: 'out', date: '2026-04-20', ref: 'PUR-DIR' });
    const m = { entry, invoiceId: 'PUR-DIR', kind: 'purchase', confidence: 99, auto: true, basis: [] };
    applyBankMatches([m], twin);
    expect(twin.getEntity('invoice', 'PUR-DIR').status).toBe('paid');
  });
});
