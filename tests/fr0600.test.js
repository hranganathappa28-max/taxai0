// FR0600 (monthly VAT return) figure derivation — the tax-critical engine that
// maps SAF-T invoice lines through the official VMI tax-code → return-box map.
// These tests pin the box arithmetic deterministically: a wrong figure here is
// a wrong VAT return, so the mapping and aggregation must not drift silently.
import { describe, it, expect } from 'vitest';
import { computeFr0600 } from '../TaxAI.jsx';

const box = (res, b) => res.rows.find((r) => r.box === b);
const val = (res, b) => box(res, b)?.value;

// A self-contained period: standard- and reduced-rate sales, an EU acquisition,
// import VAT (customs), and an annulled invoice that must be ignored entirely.
const fixture = () => ({
  taxCodes: [],
  sales: { items: [
    { invoiceType: 'SF', lines: [
      { tax: { taxCode: 'PVM1', taxableAmount: 1000, taxAmount: 210, taxPercentage: 21 } },
      { tax: { taxCode: 'PVM2', taxableAmount: 2000, taxAmount: 240, taxPercentage: 12 } },
    ] },
    { invoiceType: 'AN', lines: [ // annulled — must not contribute
      { tax: { taxCode: 'PVM1', taxableAmount: 9999, taxAmount: 9999, taxPercentage: 21 } },
    ] },
  ] },
  purchases: { items: [
    { invoiceType: 'SF', lines: [
      { tax: { taxCode: 'PVM16', taxableAmount: 5000, taxAmount: 1050, taxPercentage: 21 } }, // EU acquisition
      { tax: { taxCode: 'PVM23', taxAmount: 300, taxPercentage: 0 } }, // import VAT, no taxable value
    ] },
  ] },
});

describe('computeFr0600 — VAT-return box figures', () => {
  it('aggregates taxable values and VAT into the correct boxes', () => {
    const res = computeFr0600(fixture());
    expect(val(res, '11')).toBe(3000); // standard-rated sales taxable (PVM1 1000 + PVM2 2000)
    expect(val(res, '29')).toBe(210);  // output VAT 21% (PVM1)
    expect(val(res, '30')).toBe(240);  // output VAT 9% box collects PVM2
    expect(val(res, '21')).toBe(5000); // EU-acquisition taxable (PVM16)
    expect(val(res, '26')).toBe(300);  // import VAT at customs (PVM23)
    expect(val(res, '25*')).toBe(1050); // input VAT, excluding import codes PVM23/24
    expect(val(res, '34*')).toBe(1050); // derived: VAT on EU acquisitions (PVM16/17/18)
  });

  it('ignores annulled (AN) invoices and counts lines / missing-taxable correctly', () => {
    const res = computeFr0600(fixture());
    expect(val(res, '11')).not.toBe(12999); // the AN invoice's 9999 must not leak in
    expect(res.lines).toBe(4);  // 2 sales SF + 2 purchase SF lines (AN skipped)
    expect(res.noTV).toBe(1);   // the import-VAT line has VAT but no taxable value
  });

  it('leaves deduction-dependent boxes (28/35/36) unset — not derivable from SAF-T', () => {
    const res = computeFr0600(fixture());
    for (const b of ['28', '35', '36']) expect(val(res, b)).toBeNull();
  });

  it('resolves STI codes through the tax-code index (taxCode → stiTaxCode)', () => {
    const res = computeFr0600({
      taxCodes: [{ taxCode: 'STD21', stiTaxCode: 'PVM1' }],
      sales: { items: [{ invoiceType: 'SF', lines: [{ tax: { taxCode: 'STD21', taxableAmount: 800, taxAmount: 168, taxPercentage: 21 } }] }] },
      purchases: { items: [] },
    });
    expect(val(res, '11')).toBe(800); // STD21 mapped to PVM1 → standard-rated taxable box
    expect(val(res, '29')).toBe(168);
  });

  it('returns null for empty input', () => {
    expect(computeFr0600(null)).toBeNull();
  });
});
