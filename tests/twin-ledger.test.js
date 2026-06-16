// The twin can act as the SAF-T ledger ("books") for reconcileISAF, so a firm
// keeping live books in the twin can reconcile an externally-declared i.SAF
// against them. These tests reconcile the twin's books against a declaration
// that deliberately diverges, and assert the discrepancies are caught.
import { describe, it, expect } from 'vitest';
import { FinTwin, seedSampleTwin, buildISafFromTwin, buildSaftLikeFromTwin, parseISAF, reconcileISAF } from '../TaxAI.jsx';

const REG = '305123458';
const books = () => { const t = FinTwin.createTwin({ clientId: REG }); seedSampleTwin(t); return t; };
const declaredFrom = (twin) => parseISAF(buildISafFromTwin(twin, null, { regNo: REG }));
const ledgerFrom = (twin) => buildSaftLikeFromTwin(twin, { regNo: REG });

describe('twin as the SAF-T ledger for reconcileISAF', () => {
  it('shapes the ledger so a self-consistent declaration reconciles with 0 Reject/Block', () => {
    const twin = books();
    const recon = reconcileISAF(declaredFrom(twin), ledgerFrom(twin));
    expect(recon.findings.filter((f) => f.severity === 'Reject' || f.severity === 'Block')).toEqual([]);
    const salesCount = twin.listEntities('invoice').filter((i) => i.kind === 'sales').length;
    expect(ledgerFrom(twin).sales.items.length).toBe(salesCount);
    expect(salesCount).toBeGreaterThan(0);
  });

  it('catches output VAT over-declared vs the books (Reject)', () => {
    const twin = books();
    const declared = declaredFrom(twin);
    declared.sales[0].vat = (declared.sales[0].vat || 0) + 100;
    const recon = reconcileISAF(declared, ledgerFrom(twin));
    expect(recon.findings.some((f) => f.id === 'ISAF-S-VAT' && f.severity === 'Reject')).toBe(true);
  });

  it('flags a sale on the books but absent from the declaration (Block — under-declared output)', () => {
    const twin = books();
    const declared = declaredFrom(twin);
    declared.sales = declared.sales.slice(1);
    const recon = reconcileISAF(declared, ledgerFrom(twin));
    expect(recon.findings.some((f) => f.id === 'ISAF-S-MISSING-REGISTER' && f.severity === 'Block')).toBe(true);
  });

  it('flags input VAT claimed with no matching purchase on the books (Block)', () => {
    const twin = books();
    const declared = declaredFrom(twin);
    declared.purchases = [...declared.purchases, { invoiceNo: 'GHOST-1', vat: 210, taxable: 1000, counterpartyName: 'Ghost UAB', counterpartyVat: 'LT999999999', cancelled: false }];
    const recon = reconcileISAF(declared, ledgerFrom(twin));
    expect(recon.findings.some((f) => f.id === 'ISAF-P-MISSING-LEDGER' && f.severity === 'Block')).toBe(true);
  });
});
