// VAT control-account reclass: on obligation creation, the period's output/input
// VAT clear into one net settlement liability; a payment then clears that.
import { describe, it, expect } from 'vitest';
import { FinTwin } from '../TaxAI.jsx';

function periodTwin() {
  const twin = FinTwin.createTwin({ clientId: 'vat' });
  twin.ingest('sales.invoice.issued', { invoiceId: 'S1', customer: { name: 'Acme', code: 'C1' }, net: 1000, vat: 210, total: 1210, date: '2026-03-01' });
  twin.ingest('purchase.invoice.received', { invoiceId: 'P1', vendor: { name: 'Sup', code: 'V1' }, net: 500, vat: 105, total: 605, date: '2026-03-02' });
  return twin;
}
const bal = (tb, a) => { const r = tb.rows.find((x) => x.account === a); return r ? r.balance : 0; };

describe('VAT control-account reclass', () => {
  it('clears VAT_PAYABLE and VAT_RECEIVABLE into a net settlement on obligation creation', () => {
    const twin = periodTwin();
    let tb = twin.trialBalance();
    expect(bal(tb, '4480')).toBeCloseTo(-210, 2); // output VAT sits as a credit
    expect(bal(tb, '2441')).toBeCloseTo(105, 2);  // input VAT sits as a debit
    const r = twin.generateVatObligation('2026-03');
    expect(r.obligationCreated).toBe(true);
    expect(r.net).toBeCloseTo(105, 2);
    tb = twin.trialBalance();
    expect(tb.balanced).toBe(true);
    expect(bal(tb, '4480')).toBeCloseTo(0, 2);    // output cleared
    expect(bal(tb, '2441')).toBeCloseTo(0, 2);    // input cleared
    expect(bal(tb, '4481')).toBeCloseTo(-105, 2); // single net VAT payable
  });
  it('a payment against the VAT obligation clears the settlement account', () => {
    const twin = periodTwin();
    twin.generateVatObligation('2026-03');
    twin.ingest('payment.sent', { paymentId: 'VPAY', amount: 105, date: '2026-04-15', obligationId: 'obl_vat_2026-03' });
    const tb = twin.trialBalance();
    expect(tb.balanced).toBe(true);
    expect(bal(tb, '4481')).toBeCloseTo(0, 2);
  });
});
