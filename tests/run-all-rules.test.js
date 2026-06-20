// Deterministic tests for runAllRules — the central rule engine that executes
// all SAF-T audit / structural / XSD / duplicate / classifier rule families
// over a parsed SAF-T object and returns a findings + summary bundle.
import { describe, it, expect } from 'vitest';
import { runAllRules } from '../TaxAI.jsx';

// Minimal parsed object that satisfies enough structural requirements to let
// the engine run without throwing.  No sales or purchases, so no VAT rules
// can fire.  Arrays referenced by buildContext are all empty.
const minimalParsed = () => ({
  _meta: { rootIsAuditFile: true, namespace: 'https://www.vmi.lt/cms/saf-t' },
  header: {
    auditFileVersion: '2.01',
    auditFileCountry: 'LT',
    auditFileDateCreated: '2026-01-31',
    softwareID: 'TestERP',
    fiscalYearFrom: '2026-01-01',
    fiscalYearTo: '2026-12-31',
    defaultCurrencyCode: 'EUR',
    company: { registrationNumber: '305123456', name: 'UAB Test' },
  },
  accounts: [], customers: [], suppliers: [], products: [],
  taxCodes: [], uoms: [], analysisTypes: [], movementTypes: [],
  assets: [], owners: [], journals: [], transactions: [],
  sales: { items: [] },
  purchases: { items: [] },
  payments: [], stockMovements: [], assetTransactions: [],
  xsdResults: [], dubResults: [], clsResults: [],
  schemaValidation: { findings: [] },
});

describe('runAllRules — return shape', () => {
  it('returns an object with the expected top-level keys', () => {
    const result = runAllRules(minimalParsed());
    expect(result).toHaveProperty('findings');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('byRule');
    expect(result).toHaveProperty('byCategory');
    expect(result).toHaveProperty('bySeverity');
  });

  it('findings is an array', () => {
    const result = runAllRules(minimalParsed());
    expect(Array.isArray(result.findings)).toBe(true);
  });

  it('summary carries the expected numeric counters', () => {
    const result = runAllRules(minimalParsed());
    const s = result.summary;
    expect(typeof s.total).toBe('number');
    expect(typeof s.rulesExecuted).toBe('number');
    expect(s.rulesExecuted).toBeGreaterThan(0);
  });

  it('bySeverity has Block / Reject / Warn buckets', () => {
    const result = runAllRules(minimalParsed());
    expect(result.bySeverity).toHaveProperty('Block');
    expect(result.bySeverity).toHaveProperty('Reject');
    expect(result.bySeverity).toHaveProperty('Warn');
  });

  it('each finding carries the required fields', () => {
    // Inject a wrong auditFileVersion so at least one structural finding is present
    const data = minimalParsed();
    data.header.auditFileVersion = '1.00';
    const result = runAllRules(data);
    expect(result.findings.length).toBeGreaterThan(0);
    const f = result.findings[0];
    expect(f).toHaveProperty('rule_id');
    expect(f).toHaveProperty('category');
    expect(f).toHaveProperty('severity');
    expect(f).toHaveProperty('title');
    expect(f).toHaveProperty('detail');
    expect(Array.isArray(f.evidence)).toBe(true);
  });
});

describe('runAllRules — PARSE error shortcut', () => {
  it('returns a single PARSE finding when data is null', () => {
    const result = runAllRules(null);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].rule_id).toBe('PARSE');
    expect(result.summary.Block).toBe(1);
  });

  it('returns a PARSE finding when _parseError is set', () => {
    const result = runAllRules({ _parseError: 'XML syntax error at line 3' });
    expect(result.findings[0].rule_id).toBe('PARSE');
    expect(result.findings[0].detail).toContain('XML syntax error');
  });
});

describe('runAllRules — SAFT_HDR_002 (AuditFileVersion must be 2.01)', () => {
  // SAFT_HDR_002 evaluate: (d) => d?.header?.auditFileVersion !== "2.01" ? [{ v }] : []
  // It is a structural ("schema") rule: severity High → maps to "Reject".

  it('fires when auditFileVersion is wrong', () => {
    const data = minimalParsed();
    data.header.auditFileVersion = '1.99';
    const result = runAllRules(data);
    const ids = result.findings.map((f) => f.rule_id);
    expect(ids).toContain('SAFT_HDR_002');
  });

  it('the SAFT_HDR_002 finding has type S (Schema) and Reject severity', () => {
    const data = minimalParsed();
    data.header.auditFileVersion = '1.99';
    const result = runAllRules(data);
    const f = result.findings.find((f) => f.rule_id === 'SAFT_HDR_002');
    expect(f.type).toBe('S');
    expect(f.severity).toBe('Reject');
  });

  it('is silent (not in findings) when auditFileVersion is exactly 2.01', () => {
    const data = minimalParsed(); // auditFileVersion already set to '2.01'
    const result = runAllRules(data);
    const ids = result.findings.map((f) => f.rule_id);
    expect(ids).not.toContain('SAFT_HDR_002');
  });

  it('byRule counts the finding occurrence when it fires', () => {
    const data = minimalParsed();
    data.header.auditFileVersion = 'WRONG';
    const result = runAllRules(data);
    expect(result.byRule['SAFT_HDR_002']).toBeGreaterThanOrEqual(1);
  });
});

describe('runAllRules — VAT audit rules (PP_LT_PVM_007) fire/silent cycle', () => {
  // PP_LT_PVM_007: PVM12 (export) invoice with no Ship-To country and Ship-From
  // is LT or absent.
  // when: (!T && (!F || F === 'LT'))
  // It fires per-invoice (perLine: false), matching any line with STI code PVM12.

  const salesWithPvm12 = (shipFrom, shipTo) => ({
    items: [{
      invoiceNo: 'SF-001',
      invoiceDate: '2026-03-15',
      customerID: 'C1',
      shipFromCountry: shipFrom,
      shipToCountry: shipTo,
      documentTotals: { netTotal: 1000 },
      lines: [{ tax: { taxCode: 'PVM12' }, goodsServicesID: 'PR' }],
    }],
  });

  it('fires PP_LT_PVM_007 when PVM12 invoice has no Ship-To country', () => {
    const data = minimalParsed();
    data.sales = salesWithPvm12('LT', ''); // Ship-From LT, no Ship-To → rule triggers
    const result = runAllRules(data);
    const ids = result.findings.map((f) => f.rule_id);
    expect(ids).toContain('PP_LT_PVM_007');
  });

  it('does NOT fire PP_LT_PVM_007 when PVM12 invoice has a non-EU Ship-To country', () => {
    const data = minimalParsed();
    data.sales = salesWithPvm12('LT', 'US'); // Ship-To = US → T is set, condition !T is false
    const result = runAllRules(data);
    const ids = result.findings.map((f) => f.rule_id);
    expect(ids).not.toContain('PP_LT_PVM_007');
  });
});
