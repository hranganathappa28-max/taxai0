// Deterministic tests for the bank statement parsers: parseCamt053 (ISO 20022
// CAMT.053) and parseBankCsv (Swedbank/SEB/Luminor CSV export). The matcher
// that consumes these parsers' output is covered in tests/bankrec.test.js;
// these tests focus on the parsers themselves — field extraction, direction
// logic, date normalisation, edge-case inputs, and layout detection.
import { describe, it, expect } from 'vitest';
import { parseCamt053, parseBankCsv } from '../TaxAI.jsx';

// ---------------------------------------------------------------------------
// CAMT.053 fixtures
// ---------------------------------------------------------------------------

// Two-entry statement: one credit (inbound) + one debit (outbound).
// Includes currency attribute on <Amt> and full i.SAF-standard XML structure.
const CAMT_TWO_ENTRIES = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="EUR">1210.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2026-04-15</Dt></BookgDt>
        <NtryDtls><TxDtls>
          <RltdPties><Dbtr><Nm>Klientas UAB</Nm></Dbtr></RltdPties>
          <RmtInf><Ustrd>Apmokejimas pagal INV-001</Ustrd></RmtInf>
        </TxDtls></NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">605.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2026-04-16</Dt></BookgDt>
        <NtryDtls><TxDtls>
          <RltdPties><Cdtr><Nm>Tiekėjas UAB</Nm></Cdtr></RltdPties>
          <RmtInf><Ustrd>PUR-007</Ustrd></RmtInf>
        </TxDtls></NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

// Statement where BookgDt is absent; the parser must fall back to ValDt.
const CAMT_VALDT_FALLBACK = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt><Stmt>
    <Ntry>
      <Amt Ccy="EUR">300.00</Amt>
      <CdtDbtInd>CRDT</CdtDbtInd>
      <ValDt><Dt>2026-05-01</Dt></ValDt>
      <NtryDtls><TxDtls>
        <RltdPties><Dbtr><Nm>Mokėtojas AB</Nm></Dbtr></RltdPties>
        <RmtInf><Ustrd>REF-99</Ustrd></RmtInf>
      </TxDtls></NtryDtls>
    </Ntry>
  </Stmt></BkToCstmrStmt>
</Document>`;

// Statement where RmtInf/Ustrd is absent; AddtlNtryInf must be used instead.
const CAMT_ADDTL_REF = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt><Stmt>
    <Ntry>
      <Amt Ccy="EUR">500.00</Amt>
      <CdtDbtInd>CRDT</CdtDbtInd>
      <BookgDt><Dt>2026-06-01</Dt></BookgDt>
      <AddtlNtryInf>AddtlRef-42</AddtlNtryInf>
      <NtryDtls><TxDtls>
        <RltdPties><Dbtr><Nm>Other Ltd</Nm></Dbtr></RltdPties>
      </TxDtls></NtryDtls>
    </Ntry>
  </Stmt></BkToCstmrStmt>
</Document>`;

// Statement with multiple <Ustrd> nodes — all should be concatenated into ref.
const CAMT_MULTI_USTRD = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt><Stmt>
    <Ntry>
      <Amt Ccy="EUR">1000.00</Amt>
      <CdtDbtInd>CRDT</CdtDbtInd>
      <BookgDt><Dt>2026-07-10</Dt></BookgDt>
      <NtryDtls><TxDtls>
        <RltdPties><Dbtr><Nm>Multi Ltd</Nm></Dbtr></RltdPties>
        <RmtInf>
          <Ustrd>First line</Ustrd>
          <Ustrd>Second line</Ustrd>
        </RmtInf>
      </TxDtls></NtryDtls>
    </Ntry>
  </Stmt></BkToCstmrStmt>
</Document>`;

// Entry whose amount is zero — must be skipped (amount > 0 guard in the parser).
const CAMT_ZERO_AMOUNT = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt><Stmt>
    <Ntry>
      <Amt Ccy="EUR">0.00</Amt>
      <CdtDbtInd>CRDT</CdtDbtInd>
      <BookgDt><Dt>2026-01-01</Dt></BookgDt>
      <NtryDtls><TxDtls>
        <RltdPties><Dbtr><Nm>Zero Ltd</Nm></Dbtr></RltdPties>
        <RmtInf><Ustrd>ZERO</Ustrd></RmtInf>
      </TxDtls></NtryDtls>
    </Ntry>
  </Stmt></BkToCstmrStmt>
</Document>`;

// ---------------------------------------------------------------------------
// CSV fixtures
// ---------------------------------------------------------------------------

// Lithuanian-style: semicolon delimiter, comma decimal, separate D/C column.
const CSV_LT_SEMICOLON = [
  'Data;Suma;Tipas;Mokėjimo paskirtis;Mokėtojas',
  '2026-04-15;1.210,00;K;Apmokejimas pagal INV-001;Klientas UAB',
  '2026-04-16;605,00;D;PUR-007;Tiekėjas UAB',
].join('\n');

// English-style: comma delimiter, dot decimal, no D/C column (sign via negative amount).
const CSV_EN_COMMA = [
  'Date,Amount,Description,Counterparty',
  '2026-04-15,1210.00,Payment for INV-001,Klientas UAB',
  '2026-04-16,-605.00,PUR-007,Tiekėjas UAB',
].join('\n');

// Separate credit / debit columns (no combined Amount column).
const CSV_SEPARATE_CR_DB = [
  'Date;Credit;Debit;Description;Counterparty',
  '2026-04-15;1210.00;;INV-001 payment;Klientas UAB',
  '2026-04-16;;605.00;PUR-007;Tiekėjas UAB',
].join('\n');

// Header only (no data rows) — must return [].
const CSV_HEADER_ONLY = 'Data;Suma;Tipas;Mokėjimo paskirtis;Mokėtojas';

// Unrecognised layout (no date/amount column) — must return [].
const CSV_UNRECOGNISED = [
  'Foo;Bar;Baz',
  '1;2;3',
].join('\n');

// ---------------------------------------------------------------------------
// parseCamt053 — happy path
// ---------------------------------------------------------------------------

describe('parseCamt053 — two-entry statement (credit + debit)', () => {
  const entries = parseCamt053(CAMT_TWO_ENTRIES);

  it('returns exactly two entries', () => {
    expect(entries.length).toBe(2);
  });

  it('first entry is inbound credit with correct amount and date', () => {
    expect(entries[0]).toMatchObject({
      amount: 1210,
      direction: 'in',
      date: '2026-04-15',
    });
  });

  it('first entry carries the remittance reference', () => {
    expect(entries[0].ref).toContain('INV-001');
  });

  it('first entry captures the debtor (counterparty) name', () => {
    expect(entries[0].party).toBe('Klientas UAB');
  });

  it('second entry is outbound debit with correct amount and date', () => {
    expect(entries[1]).toMatchObject({
      amount: 605,
      direction: 'out',
      date: '2026-04-16',
    });
  });

  it('second entry carries the remittance reference', () => {
    expect(entries[1].ref).toContain('PUR-007');
  });

  it('second entry captures the creditor (counterparty) name', () => {
    expect(entries[1].party).toBe('Tiekėjas UAB');
  });

  it('each entry has the five expected keys: date, amount, direction, ref, party', () => {
    for (const e of entries) {
      expect(Object.keys(e).sort()).toEqual(['amount', 'date', 'direction', 'party', 'ref'].sort());
    }
  });
});

// ---------------------------------------------------------------------------
// parseCamt053 — ValDt fallback when BookgDt is absent
// ---------------------------------------------------------------------------

describe('parseCamt053 — ValDt fallback', () => {
  it('uses ValDt when BookgDt is absent', () => {
    const entries = parseCamt053(CAMT_VALDT_FALLBACK);
    expect(entries.length).toBe(1);
    expect(entries[0].date).toBe('2026-05-01');
    expect(entries[0].amount).toBe(300);
    expect(entries[0].direction).toBe('in');
    expect(entries[0].party).toBe('Mokėtojas AB');
    expect(entries[0].ref).toContain('REF-99');
  });
});

// ---------------------------------------------------------------------------
// parseCamt053 — AddtlNtryInf fallback when Ustrd is absent
// ---------------------------------------------------------------------------

describe('parseCamt053 — AddtlNtryInf ref fallback', () => {
  it('uses AddtlNtryInf as ref when no Ustrd nodes exist', () => {
    const entries = parseCamt053(CAMT_ADDTL_REF);
    expect(entries.length).toBe(1);
    expect(entries[0].ref).toContain('AddtlRef-42');
  });
});

// ---------------------------------------------------------------------------
// parseCamt053 — multiple Ustrd nodes concatenated
// ---------------------------------------------------------------------------

describe('parseCamt053 — multiple Ustrd concatenation', () => {
  it('concatenates all Ustrd nodes into a single ref string', () => {
    const entries = parseCamt053(CAMT_MULTI_USTRD);
    expect(entries.length).toBe(1);
    expect(entries[0].ref).toContain('First line');
    expect(entries[0].ref).toContain('Second line');
  });
});

// ---------------------------------------------------------------------------
// parseCamt053 — zero-amount entry is skipped
// ---------------------------------------------------------------------------

describe('parseCamt053 — zero amount guard', () => {
  it('skips entries whose amount is 0.00', () => {
    const entries = parseCamt053(CAMT_ZERO_AMOUNT);
    expect(entries.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// parseCamt053 — edge / robustness
// ---------------------------------------------------------------------------

describe('parseCamt053 — edge and robustness', () => {
  it('returns [] for an empty string', () => {
    expect(parseCamt053('')).toEqual([]);
  });

  it('returns [] for a whitespace-only string', () => {
    expect(parseCamt053('   \n\t  ')).toEqual([]);
  });

  it('returns [] for non-XML junk (no throw)', () => {
    expect(parseCamt053('not xml at all')).toEqual([]);
  });

  it('returns [] for well-formed XML that has no Ntry elements', () => {
    const xml = '<?xml version="1.0"?><Document><BkToCstmrStmt><Stmt></Stmt></BkToCstmrStmt></Document>';
    expect(parseCamt053(xml)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// parseBankCsv — Lithuanian semicolon + comma-decimal format
// ---------------------------------------------------------------------------

describe('parseBankCsv — semicolon delimiter, comma decimal, D/C column', () => {
  const entries = parseBankCsv(CSV_LT_SEMICOLON);

  it('returns exactly two entries', () => {
    expect(entries.length).toBe(2);
  });

  it('first entry is inbound with correct amount and date', () => {
    expect(entries[0]).toMatchObject({
      amount: 1210,
      direction: 'in',
      date: '2026-04-15',
    });
  });

  it('first entry carries the remittance reference', () => {
    expect(entries[0].ref).toContain('INV-001');
  });

  it('first entry captures the payer name', () => {
    expect(entries[0].party).toBe('Klientas UAB');
  });

  it('second entry is outbound debit with correct amount and date', () => {
    expect(entries[1]).toMatchObject({
      amount: 605,
      direction: 'out',
      date: '2026-04-16',
    });
  });

  it('second entry captures the payee name', () => {
    expect(entries[1].party).toBe('Tiekėjas UAB');
  });

  it('each entry has the five expected keys', () => {
    for (const e of entries) {
      expect(Object.keys(e).sort()).toEqual(['amount', 'date', 'direction', 'party', 'ref'].sort());
    }
  });
});

// ---------------------------------------------------------------------------
// parseBankCsv — English comma-delimited format with signed amounts
// ---------------------------------------------------------------------------

describe('parseBankCsv — comma delimiter, dot decimal, signed amounts', () => {
  const entries = parseBankCsv(CSV_EN_COMMA);

  it('returns exactly two entries', () => {
    expect(entries.length).toBe(2);
  });

  it('positive amount → direction in', () => {
    expect(entries[0]).toMatchObject({ amount: 1210, direction: 'in', date: '2026-04-15' });
  });

  it('negative amount → direction out, absolute value stored', () => {
    expect(entries[1]).toMatchObject({ amount: 605, direction: 'out', date: '2026-04-16' });
  });

  it('ref and party are captured from the correct columns', () => {
    expect(entries[0].ref).toContain('INV-001');
    expect(entries[0].party).toBe('Klientas UAB');
    expect(entries[1].ref).toContain('PUR-007');
    expect(entries[1].party).toBe('Tiekėjas UAB');
  });
});

// ---------------------------------------------------------------------------
// parseBankCsv — separate Credit / Debit columns
// ---------------------------------------------------------------------------

describe('parseBankCsv — separate Credit/Debit columns', () => {
  const entries = parseBankCsv(CSV_SEPARATE_CR_DB);

  it('returns exactly two entries', () => {
    expect(entries.length).toBe(2);
  });

  it('credit column populated → direction in', () => {
    expect(entries[0]).toMatchObject({ amount: 1210, direction: 'in' });
  });

  it('debit column populated → direction out', () => {
    expect(entries[1]).toMatchObject({ amount: 605, direction: 'out' });
  });
});

// ---------------------------------------------------------------------------
// parseBankCsv — edge / robustness
// ---------------------------------------------------------------------------

describe('parseBankCsv — edge and robustness', () => {
  it('returns [] for an empty string', () => {
    expect(parseBankCsv('')).toEqual([]);
  });

  it('returns [] for a whitespace-only string', () => {
    expect(parseBankCsv('   \n  ')).toEqual([]);
  });

  it('returns [] when there is only a header row (no data rows)', () => {
    expect(parseBankCsv(CSV_HEADER_ONLY)).toEqual([]);
  });

  it('returns [] for an unrecognised layout (no date or amount column found)', () => {
    expect(parseBankCsv(CSV_UNRECOGNISED)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Shape equivalence — a CAMT credit and a CSV credit of the same transaction
// must produce the same normalised fields
// ---------------------------------------------------------------------------

describe('shape equivalence — CAMT credit and CSV credit produce identical field shape', () => {
  const camtEntry = parseCamt053(CAMT_TWO_ENTRIES)[0];  // INV-001, 1210, in, 2026-04-15
  const csvEntry  = parseBankCsv(CSV_LT_SEMICOLON)[0];  // same transaction

  it('both entries have the same set of field names', () => {
    expect(Object.keys(camtEntry).sort()).toEqual(Object.keys(csvEntry).sort());
  });

  it('both entries agree on amount', () => {
    expect(camtEntry.amount).toBe(csvEntry.amount);
  });

  it('both entries agree on direction', () => {
    expect(camtEntry.direction).toBe(csvEntry.direction);
  });

  it('both entries agree on date', () => {
    expect(camtEntry.date).toBe(csvEntry.date);
  });

  it('both entries ref contains the invoice id', () => {
    expect(camtEntry.ref).toContain('INV-001');
    expect(csvEntry.ref).toContain('INV-001');
  });

  it('both entries agree on party name', () => {
    expect(camtEntry.party).toBe(csvEntry.party);
  });
});
