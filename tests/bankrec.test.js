// Bank reconciliation engine: parse camt.053 / CSV statements, match to open
// invoices, and post payments that feed the AR/AP control accounts.
import { describe, it, expect } from 'vitest';
import { FinTwin, parseCamt053, parseBankCsv, reconcileBankStatement, applyBankMatches } from '../TaxAI.jsx';

const CAMT = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02"><BkToCstmrStmt><Stmt>
  <Ntry><Amt Ccy="EUR">1210.00</Amt><CdtDbtInd>CRDT</CdtDbtInd><BookgDt><Dt>2026-03-12</Dt></BookgDt>
    <NtryDtls><TxDtls><RltdPties><Dbtr><Nm>Acme UAB</Nm></Dbtr></RltdPties><RmtInf><Ustrd>Apmokejimas pagal S1</Ustrd></RmtInf></TxDtls></NtryDtls></Ntry>
  <Ntry><Amt Ccy="EUR">605.00</Amt><CdtDbtInd>DBIT</CdtDbtInd><BookgDt><Dt>2026-03-13</Dt></BookgDt>
    <NtryDtls><TxDtls><RltdPties><Cdtr><Nm>Sup UAB</Nm></Cdtr></RltdPties><RmtInf><Ustrd>P1</Ustrd></RmtInf></TxDtls></NtryDtls></Ntry>
</Stmt></BkToCstmrStmt></Document>`;

describe('parseCamt053', () => {
  it('parses entries (amount, direction, date, ref, party) namespace-agnostically', () => {
    const e = parseCamt053(CAMT);
    expect(e.length).toBe(2);
    expect(e[0]).toMatchObject({ amount: 1210, direction: 'in', date: '2026-03-12', party: 'Acme UAB' });
    expect(e[0].ref).toContain('S1');
    expect(e[1]).toMatchObject({ amount: 605, direction: 'out', date: '2026-03-13' });
  });
  it('returns [] for junk without throwing', () => {
    expect(parseBankCsv('')).toEqual([]);
    expect(parseCamt053('not xml')).toEqual([]);
  });
});

describe('parseBankCsv', () => {
  it('handles ; delimiter, comma decimals and a separate D/C column', () => {
    const csv = 'Data;Suma;Tipas;Mokėjimo paskirtis;Mokėtojas\n2026-03-12;1.210,00;K;Apmokejimas pagal S1;Acme UAB\n2026-03-13;605,00;D;P1;Sup UAB';
    const e = parseBankCsv(csv);
    expect(e.length).toBe(2);
    expect(e[0]).toMatchObject({ amount: 1210, direction: 'in', date: '2026-03-12', party: 'Acme UAB' });
    expect(e[1]).toMatchObject({ amount: 605, direction: 'out' });
  });
});

describe('reconcileBankStatement + applyBankMatches', () => {
  function twinWithInvoices() {
    const twin = FinTwin.createTwin({ clientId: 'bank-rec' });
    twin.ingest('sales.invoice.issued', { invoiceId: 'S1', customer: { name: 'Acme UAB', code: 'C1' }, net: 1000, vat: 210, total: 1210, date: '2026-03-01' });
    twin.ingest('purchase.invoice.received', { invoiceId: 'P1', vendor: { name: 'Sup UAB', code: 'V1' }, net: 500, vat: 105, total: 605, date: '2026-03-02' });
    return twin;
  }
  it('matches an inbound credit to the open sales invoice with high confidence', () => {
    const twin = twinWithInvoices();
    const matches = reconcileBankStatement(parseCamt053(CAMT), twin);
    const m = matches.find((x) => x.entry.direction === 'in');
    expect(m.invoiceId).toBe('S1');
    expect(m.kind).toBe('sales');
    expect(m.confidence).toBeGreaterThanOrEqual(80);
    expect(m.auto).toBe(true);
  });
  it('posting the matches settles the invoices and keeps the ledger balanced', () => {
    const twin = twinWithInvoices();
    const matches = reconcileBankStatement(parseCamt053(CAMT), twin);
    const posted = applyBankMatches(matches, twin);
    expect(posted).toBe(2);
    const tb = twin.trialBalance();
    expect(tb.balanced).toBe(true);
    const ar = tb.rows.find((r) => r.account === '2410');
    expect(ar ? ar.balance : 0).toBeCloseTo(0, 2); // sales invoice settled by the bank credit
    expect(twin.getEntity('invoice', 'S1').status).toBe('paid');
    expect(twin.getEntity('invoice', 'P1').status).toBe('paid');
  });
});
