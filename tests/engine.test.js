// Deterministic-engine unit tests for TaxAI.
// These cover the pure, reproducible engines (no AI): finding confidence,
// VMI risk score, the SAF-T acceptance gate, the financial digital twin
// (forecast / cash / close / fraud) and the 2026 payroll arithmetic.
import { describe, it, expect } from 'vitest';
import {
  computeRiskScore,
  simulateAcceptanceGate,
  findingConfidence,
  FinTwin,
} from '../TaxAI.jsx';

describe('findingConfidence', () => {
  it('rates schema (XSD) findings as near-certain (high band)', () => {
    const c = findingConfidence({ rule_id: 'SAFT_XSD_ENUM_X', ruleMeta: { family: 'XSD' }, severity: 'High', evidence: ['x'] });
    expect(c.score).toBeGreaterThanOrEqual(90);
    expect(c.band).toBe('high');
  });

  it('rates indicative "signal" rules lower than deterministic checks', () => {
    const signal = findingConfidence({ rule_id: 'PP_LT_PVM_001', ruleMeta: { kind: 'signal' }, severity: 'Medium', evidence: ['x'] });
    const schema = findingConfidence({ rule_id: 'SAFT_XSD_ENUM_X', ruleMeta: { family: 'XSD' }, severity: 'High', evidence: ['x'] });
    expect(signal.score).toBeLessThan(schema.score);
    expect(signal.score).toBeLessThan(90);
  });

  it('clamps to the 40–99 range and always returns a band', () => {
    const c = findingConfidence({ rule_id: 'X', ruleMeta: {}, severity: 'Low', evidence: [] });
    expect(c.score).toBeGreaterThanOrEqual(40);
    expect(c.score).toBeLessThanOrEqual(99);
    expect(['high', 'medium', 'low']).toContain(c.band);
  });
});

describe('computeRiskScore', () => {
  it('returns score 0 for no findings', () => {
    expect(computeRiskScore([]).score).toBe(0);
  });
});

describe('simulateAcceptanceGate', () => {
  it('produces a verdict for a clean (finding-free) file', () => {
    const parsed = { header: {}, sales: { items: [] }, purchases: { items: [] }, transactions: [] };
    const gate = simulateAcceptanceGate(parsed, []);
    expect(gate).toBeTruthy();
    expect(typeof gate.verdict).toBe('string');
  });
});

describe('FinTwin engine', () => {
  it('creates an empty twin', () => {
    const twin = FinTwin.createTwin({ clientId: 'test' });
    expect(twin.eventCount()).toBe(0);
  });

  it('runs every read-model on an empty twin without throwing', () => {
    const twin = FinTwin.createTwin({ clientId: 'test' });
    expect(() => FinTwin.buildForecast(twin)).not.toThrow();
    expect(() => FinTwin.buildCashView(twin, {})).not.toThrow();
    expect(() => FinTwin.closeReadiness(twin, {})).not.toThrow();
    expect(() => FinTwin.scanFraud(twin, {})).not.toThrow();
    expect(() => FinTwin.deriveFindings(twin, {})).not.toThrow();
    expect(() => twin.trialBalance()).not.toThrow();
  });

  it('computes 2026 payroll arithmetic (net < gross < employer cost)', () => {
    const pe = FinTwin.createPayrollEngine(FinTwin.PARAMS_2026);
    const r = pe.calcEmployee({ employeeId: 'e1', name: 'Test', gross: 2000 });
    expect(r.gross).toBe(2000);
    expect(r.net).toBeGreaterThan(0);
    expect(r.net).toBeLessThan(r.gross);
    expect(r.employerCost).toBeGreaterThanOrEqual(r.gross);
  });
});
