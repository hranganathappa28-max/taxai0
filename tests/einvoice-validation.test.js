// Deterministic tests for computeEinvTotals (per-line + document totals) and
// the ERP_BOUNDARY_RULES validation rules (ERPB-01 through ERPB-04, ERPB-07,
// ERPB-10). Each rule is exercised on a violating row (fires) and a valid row
// (silent) so the check function itself is the unit under test.
import { describe, it, expect } from 'vitest';
import { computeEinvTotals, ERP_BOUNDARY_RULES } from '../TaxAI.jsx';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Bare-minimum helpers object matching what validateCanonicalBatch receives.
// Only the fields actually read by the rules under test are needed.
const helpers = {
  classifyVatRate: () => ({ valid: true }),
  isValidLtIban: () => true,
  isLtVatNumber: (s) => typeof s === 'string' && /^LT(\d{9}|\d{12})$/.test(s),
  ISO_4217: new Set(['EUR', 'USD', 'GBP', 'PLN', 'SEK', 'NOK', 'DKK', 'CHF']),
  taxMap: {},
};

// Look up a rule by id from the exported array.
const rule = (id) => {
  const r = ERP_BOUNDARY_RULES.find((r) => r.id === id);
  if (!r) throw new Error(`Rule ${id} not found in ERP_BOUNDARY_RULES`);
  return r;
};

// ─── computeEinvTotals ──────────────────────────────────────────────────────

describe('computeEinvTotals — multi-line invoice', () => {
  // Two standard-rated lines at different VAT rates.
  // Line 1: qty=10, unitPrice=100 → net=1000, pct=21 → vat=210
  // Line 2: qty=5,  unitPrice=200 → net=1000, pct=9  → vat=90
  // lineExt=2000, taxEx=2000, taxTotal=300, taxInc=2300, payable=2300
  const inv = {
    currency: 'EUR',
    buyer: { name: 'Pirkėjas UAB', country: 'LT', vatNo: 'LT123456789' },
    seller: { name: 'Pardavėjas UAB', country: 'LT', vatNo: 'LT987654321' },
    lines: [
      { id: 'L1', qty: 10, unitPrice: 100, pct: 21, description: 'Paslauga A' },
      { id: 'L2', qty: 5,  unitPrice: 200, pct: 9,  description: 'Prekė B' },
    ],
  };

  it('computes per-line net amounts (qty × unitPrice, rounded to 2dp)', () => {
    const T = computeEinvTotals(inv);
    expect(T.lines[0].net).toBe(1000);
    expect(T.lines[1].net).toBe(1000);
  });

  it('computes per-line VAT using TaxCalc.vatCalc', () => {
    const T = computeEinvTotals(inv);
    // vatCalc(1000, 21) → Math.round(1000*21/100*100)/100 = 210
    expect(T.lines[0].vat).toBe(210);
    // vatCalc(1000, 9)  → Math.round(1000*9/100*100)/100  = 90
    expect(T.lines[1].vat).toBe(90);
  });

  it('computes document-level lineExt, taxEx, taxTotal, taxInc, payable', () => {
    const T = computeEinvTotals(inv);
    expect(T.lineExt).toBe(2000);   // 1000 + 1000
    expect(T.allowSum).toBe(0);
    expect(T.chargeSum).toBe(0);
    expect(T.taxEx).toBe(2000);    // lineExt - allowSum + chargeSum
    expect(T.taxTotal).toBe(300);  // 210 + 90
    expect(T.taxInc).toBe(2300);   // taxEx + taxTotal
    expect(T.prepaid).toBe(0);
    expect(T.rounding).toBe(0);
    expect(T.payable).toBe(2300);  // taxInc - prepaid + rounding
  });

  it('produces two subtotals, one per VAT category/rate combination', () => {
    const T = computeEinvTotals(inv);
    expect(T.subtotals.length).toBe(2);
    const sub21 = T.subtotals.find((s) => s.pct === 21);
    const sub9  = T.subtotals.find((s) => s.pct === 9);
    expect(sub21).toBeDefined();
    expect(sub9).toBeDefined();
    expect(sub21.taxable).toBe(1000);
    expect(sub21.tax).toBe(210);
    expect(sub9.taxable).toBe(1000);
    expect(sub9.tax).toBe(90);
  });

  it('deducts a document-level allowance from taxEx', () => {
    // Add a 100-EUR allowance at S/21%.
    const invWithAllowance = {
      ...inv,
      allowances: [{ cat: 'S', pct: 21, amount: 100, reason: 'Discount' }],
    };
    const T = computeEinvTotals(invWithAllowance);
    // lineExt=2000, allowSum=100, chargeSum=0 → taxEx=1900
    expect(T.allowSum).toBe(100);
    expect(T.taxEx).toBe(1900);
  });

  it('applies prepaid amount: payable = taxInc − prepaid', () => {
    const invWithPrepaid = {
      ...inv,
      payment: { prepaid: 500 },
    };
    const T = computeEinvTotals(invWithPrepaid);
    expect(T.prepaid).toBe(500);
    expect(T.payable).toBe(1800); // 2300 - 500
  });
});

describe('computeEinvTotals — single line, fractional amounts', () => {
  // qty=3, unitPrice=33.33 → net=99.99 (rounded from 99.99); pct=21 →
  // vat = Math.round(99.99*21/100*100)/100 = Math.round(2099.79)/100 = 20.998 → rounds to 21.00
  it('handles fractional unit price with correct rounding', () => {
    const inv = {
      currency: 'EUR',
      lines: [{ id: 'L1', qty: 3, unitPrice: 33.33, pct: 21 }],
    };
    const T = computeEinvTotals(inv);
    // einvR2(3 * 33.33) = einvR2(99.99) = 99.99
    expect(T.lines[0].net).toBe(99.99);
    // TaxCalc.vatCalc(99.99, 21): Math.round(99.99*21/100*100)/100
    // = Math.round(2099.79)/100 = 2100/100 = 21
    expect(T.lines[0].vat).toBe(21);
    expect(T.taxEx).toBe(99.99);
    expect(T.taxTotal).toBe(21);
    expect(T.taxInc).toBe(120.99); // 99.99 + 21
    expect(T.payable).toBe(120.99);
  });
});

// ─── ERP_BOUNDARY_RULES — ERPB-01 (Missing invoice number) ──────────────────

describe('ERPB-01 — missing invoice number', () => {
  const r01 = rule('ERPB-01');

  it('fires when invoiceNo is empty string', () => {
    const row = { invoiceNo: '', invoiceDate: '2026-01-15', totals: { net: 100, vat: 21, gross: 121 }, lines: [], source: { externalId: 'EXT-001' } };
    expect(r01.check(row, helpers)).toBe(true);
  });

  it('fires when invoiceNo is absent (undefined)', () => {
    const row = { invoiceDate: '2026-01-15', totals: { net: 100, vat: 21, gross: 121 }, lines: [], source: { externalId: 'EXT-002' } };
    expect(r01.check(row, helpers)).toBe(true);
  });

  it('is silent when invoiceNo is a non-empty string', () => {
    const row = { invoiceNo: 'SF-2026-001', invoiceDate: '2026-01-15', totals: { net: 100, vat: 21, gross: 121 }, lines: [], source: { externalId: 'EXT-003' } };
    expect(r01.check(row, helpers)).toBe(false);
  });

  it('has severity Block', () => {
    expect(r01.sev).toBe('Block');
  });
});

// ─── ERP_BOUNDARY_RULES — ERPB-02 (Invalid or missing invoice date) ─────────

describe('ERPB-02 — invalid or missing invoice date', () => {
  const r02 = rule('ERPB-02');

  it('fires when invoiceDate is missing', () => {
    const row = { invoiceNo: 'SF-01', totals: { net: 100, vat: 21, gross: 121 }, lines: [], source: { externalId: 'X' } };
    expect(r02.check(row, helpers)).toBe(true);
  });

  it('fires when invoiceDate is not YYYY-MM-DD format', () => {
    const row = { invoiceNo: 'SF-02', invoiceDate: '15.01.2026', totals: { net: 100, vat: 21, gross: 121 }, lines: [] };
    expect(r02.check(row, helpers)).toBe(true);
  });

  it('fires when invoiceDate is an empty string', () => {
    const row = { invoiceNo: 'SF-03', invoiceDate: '', totals: { net: 100, vat: 21, gross: 121 }, lines: [] };
    expect(r02.check(row, helpers)).toBe(true);
  });

  it('is silent when invoiceDate is valid YYYY-MM-DD', () => {
    const row = { invoiceNo: 'SF-04', invoiceDate: '2026-03-31', totals: { net: 100, vat: 21, gross: 121 }, lines: [] };
    expect(r02.check(row, helpers)).toBe(false);
  });
});

// ─── ERP_BOUNDARY_RULES — ERPB-03 (net+VAT ≠ gross) ────────────────────────

describe('ERPB-03 — document totals do not reconcile (net+VAT ≠ gross)', () => {
  const r03 = rule('ERPB-03');

  it('fires when gross is inconsistent with net+VAT by more than 0.02', () => {
    // net=1000, vat=210, gross=1211 → |1210-1211|=1 > 0.02
    const row = { invoiceNo: 'SF-BAD', invoiceDate: '2026-01-10', totals: { net: 1000, vat: 210, gross: 1211 }, lines: [] };
    expect(r03.check(row, helpers)).toBe(true);
  });

  it('is silent when gross equals net+VAT exactly', () => {
    // net=1000, vat=210, gross=1210 → |1210-1210|=0 ≤ 0.02
    const row = { invoiceNo: 'SF-OK', invoiceDate: '2026-01-10', totals: { net: 1000, vat: 210, gross: 1210 }, lines: [] };
    expect(r03.check(row, helpers)).toBe(false);
  });

  it('is silent when difference is within the 0.02 tolerance (rounding penny)', () => {
    // net=99.99, vat=21, gross=120.99 → |120.99-120.99|=0 ≤ 0.02
    const row = { invoiceNo: 'SF-TOL', invoiceDate: '2026-01-10', totals: { net: 99.99, vat: 21, gross: 120.99 }, lines: [] };
    expect(r03.check(row, helpers)).toBe(false);
  });

  it('fires on zero-vat invoice where gross was inflated', () => {
    // net=500, vat=0, gross=501 → |500-501|=1 > 0.02
    const row = { invoiceNo: 'SF-ZERO', invoiceDate: '2026-02-01', totals: { net: 500, vat: 0, gross: 501 }, lines: [] };
    expect(r03.check(row, helpers)).toBe(true);
  });

  it('has severity Reject', () => {
    expect(r03.sev).toBe('Reject');
  });
});

// ─── ERP_BOUNDARY_RULES — ERPB-04 (Line sum differs from header net) ─────────

describe('ERPB-04 — line sum differs from header net', () => {
  const r04 = rule('ERPB-04');

  it('fires when line nets sum to a different value than totals.net', () => {
    // lines sum=800 but totals.net=1000 → |800-1000|=200 > 0.02
    const row = {
      invoiceNo: 'SF-LSUM-BAD',
      invoiceDate: '2026-01-15',
      totals: { net: 1000, vat: 210, gross: 1210 },
      lines: [{ net: 500 }, { net: 300 }], // sum=800, not 1000
    };
    expect(r04.check(row, helpers)).toBe(true);
  });

  it('is silent when line nets sum matches totals.net', () => {
    const row = {
      invoiceNo: 'SF-LSUM-OK',
      invoiceDate: '2026-01-15',
      totals: { net: 1000, vat: 210, gross: 1210 },
      lines: [{ net: 600 }, { net: 400 }], // sum=1000
    };
    expect(r04.check(row, helpers)).toBe(false);
  });

  it('is silent when difference is within 0.02 tolerance', () => {
    // single line net=999.99, totals.net=1000 → |999.99-1000|=0.01 ≤ 0.02
    const row = {
      invoiceNo: 'SF-LSUM-TOL',
      invoiceDate: '2026-01-15',
      totals: { net: 1000, vat: 210, gross: 1210 },
      lines: [{ net: 999.99 }],
    };
    expect(r04.check(row, helpers)).toBe(false);
  });

  it('has severity Reject', () => {
    expect(r04.sev).toBe('Reject');
  });
});

// ─── ERP_BOUNDARY_RULES — ERPB-07 (LT counterparty without VAT number) ──────

describe('ERPB-07 — LT counterparty without VAT number on taxed supply', () => {
  const r07 = rule('ERPB-07');

  it('fires when party is LT but has no vatNo and vat > 0', () => {
    const row = {
      invoiceNo: 'SF-LT-NOVAT',
      invoiceDate: '2026-02-10',
      totals: { net: 100, vat: 21, gross: 121 },
      lines: [],
      party: { name: 'Pirkėjas UAB', country: 'LT', vatNo: '' },
    };
    expect(r07.check(row, helpers)).toBe(true);
  });

  it('is silent when party is LT and has a vatNo', () => {
    const row = {
      invoiceNo: 'SF-LT-WITHVAT',
      invoiceDate: '2026-02-10',
      totals: { net: 100, vat: 21, gross: 121 },
      lines: [],
      party: { name: 'Pirkėjas UAB', country: 'LT', vatNo: 'LT123456789' },
    };
    expect(r07.check(row, helpers)).toBe(false);
  });

  it('is silent when vat is 0 even if LT party has no vatNo (zero-rated supply)', () => {
    const row = {
      invoiceNo: 'SF-LT-ZEROVAT',
      invoiceDate: '2026-02-10',
      totals: { net: 100, vat: 0, gross: 100 },
      lines: [],
      party: { name: 'Kitas UAB', country: 'LT', vatNo: '' },
    };
    expect(r07.check(row, helpers)).toBe(false);
  });

  it('is silent when party country is not LT', () => {
    const row = {
      invoiceNo: 'SF-DE-NOVAT',
      invoiceDate: '2026-02-10',
      totals: { net: 100, vat: 21, gross: 121 },
      lines: [],
      party: { name: 'German GmbH', country: 'DE', vatNo: '' },
    };
    expect(r07.check(row, helpers)).toBe(false);
  });

  it('has severity Warn', () => {
    expect(r07.sev).toBe('Warn');
  });
});

// ─── ERP_BOUNDARY_RULES — ERPB-10 (Invoice date in the future) ──────────────

describe('ERPB-10 — invoice date in the future', () => {
  const r10 = rule('ERPB-10');

  it('fires when invoiceDate is in the future', () => {
    const row = { invoiceNo: 'SF-FUTURE', invoiceDate: '2099-12-31', totals: { net: 100, vat: 21, gross: 121 }, lines: [] };
    expect(r10.check(row, helpers)).toBe(true);
  });

  it('is silent when invoiceDate is today', () => {
    const today = new Date().toISOString().slice(0, 10);
    const row = { invoiceNo: 'SF-TODAY', invoiceDate: today, totals: { net: 100, vat: 21, gross: 121 }, lines: [] };
    expect(r10.check(row, helpers)).toBe(false);
  });

  it('is silent when invoiceDate is in the past', () => {
    const row = { invoiceNo: 'SF-PAST', invoiceDate: '2025-01-01', totals: { net: 100, vat: 21, gross: 121 }, lines: [] };
    expect(r10.check(row, helpers)).toBe(false);
  });

  it('has severity Warn', () => {
    expect(r10.sev).toBe('Warn');
  });
});

// ─── ERP_BOUNDARY_RULES — sanity: all expected rule ids are present ──────────

describe('ERP_BOUNDARY_RULES — structure', () => {
  it('contains at least the 12 standard rules', () => {
    const ids = ERP_BOUNDARY_RULES.map((r) => r.id);
    for (const expected of ['ERPB-01', 'ERPB-02', 'ERPB-03', 'ERPB-04', 'ERPB-05',
                             'ERPB-06', 'ERPB-07', 'ERPB-08', 'ERPB-09', 'ERPB-10',
                             'ERPB-11', 'ERPB-12']) {
      expect(ids).toContain(expected);
    }
  });

  it('every rule has id, sev, check (function), msg (function), and kinds (array)', () => {
    for (const r of ERP_BOUNDARY_RULES) {
      expect(typeof r.id).toBe('string');
      expect(['Block', 'Reject', 'Warn']).toContain(r.sev);
      expect(typeof r.check).toBe('function');
      expect(typeof r.msg).toBe('function');
      expect(Array.isArray(r.kinds)).toBe(true);
    }
  });
});
