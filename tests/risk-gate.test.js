// Two inspector-facing engines that were only smoke-tested (empty input):
//  • computeRiskScore — weighted, log-damped aggregate risk score + banding
//  • simulateAcceptanceGate — i.SAF-T submission gate (technical errors block,
//    content findings pass as warnings)
// Synthetic rule_ids (ZZZ_*) are deliberately absent from the VMI weight table,
// so weights fall back to the severity defaults {Critical:5,High:3,Medium:1,Low:0.3}.
import { describe, it, expect } from 'vitest';
import { computeRiskScore, simulateAcceptanceGate } from '../TaxAI.jsx';

describe('computeRiskScore', () => {
  it('scores a single rule with the documented weight × log-damped hit factor', () => {
    const r = computeRiskScore([{ rule_id: 'ZZZ_MED', severity: 'Medium' }]);
    expect(r.perRule).toHaveLength(1);
    expect(r.perRule[0].weight).toBe(1);           // Medium default — confirms no catalogue collision
    expect(r.perRule[0].contrib).toBeCloseTo(1.18, 2); // 1 × (1 + ln2/ln51)
    expect(r.score).toBeCloseTo(1.2, 5);
    expect(r.band).toBe('low');
  });

  it('forces the "high" band whenever any finding is Critical, regardless of score', () => {
    const r = computeRiskScore([{ rule_id: 'ZZZ_CRIT', severity: 'Critical' }]);
    expect(r.perRule[0].weight).toBe(5);
    expect(r.score).toBeCloseTo(5.9, 5); // well under the 40 threshold…
    expect(r.band).toBe('high');         // …but Critical short-circuits the banding
  });

  it('excludes findings the user rejected', () => {
    const r = computeRiskScore([{ rule_id: 'ZZZ_CRIT', severity: 'Critical', status: 'rejected' }]);
    expect(r.perRule).toHaveLength(0);
    expect(r.score).toBe(0);
    expect(r.band).toBe('clean');
  });

  it('aggregates hits by rule_id and damps the contribution sub-linearly', () => {
    const agg = computeRiskScore([
      { rule_id: 'ZZZ_DUP', severity: 'High', count: 4 },
      { rule_id: 'ZZZ_DUP', severity: 'High', count: 2 },
    ]);
    expect(agg.perRule).toHaveLength(1);
    expect(agg.perRule[0].hits).toBe(6);
    const one = computeRiskScore([{ rule_id: 'ZZZ_DUP', severity: 'High', count: 1 }]).perRule[0].contrib;
    expect(agg.perRule[0].contrib).toBeGreaterThan(one);    // more hits → more risk
    expect(agg.perRule[0].contrib).toBeLessThan(one * 6);   // but damped, not linear
  });

  it('caps the hit factor at 50 hits', () => {
    const c50 = computeRiskScore([{ rule_id: 'ZZZ_CAP', severity: 'Medium', count: 50 }]).perRule[0].contrib;
    const c100 = computeRiskScore([{ rule_id: 'ZZZ_CAP', severity: 'Medium', count: 100 }]).perRule[0].contrib;
    expect(c50).toBe(2);    // 1 × (1 + ln51/ln51)
    expect(c100).toBe(c50);
  });

  it('sums distinct rules into the score and aggregates per category; bands "elevated" past 12', () => {
    const r = computeRiskScore([
      { rule_id: 'ZZZ_A', severity: 'High', category: 'vat' },
      { rule_id: 'ZZZ_B', severity: 'Medium', category: 'vat' },
    ]);
    expect(r.perRule).toHaveLength(2);
    expect(r.perCategory.vat).toBeCloseTo(r.perRule[0].contrib + r.perRule[1].contrib, 2);
    expect(r.score).toBeCloseTo(4.7, 5);
    const many = computeRiskScore(['a', 'b', 'c', 'd'].map((id) => ({ rule_id: 'ZZZ_' + id, severity: 'High' })));
    expect(many.score).toBeCloseTo(14.1, 5);
    expect(many.band).toBe('elevated');
  });
});

describe('simulateAcceptanceGate', () => {
  const okHeader = { header: { registrationNumber: '305123458', auditFileVersion: '2.01' } };

  it('accepts a clean file with no findings', () => {
    const g = simulateAcceptanceGate(okHeader, []);
    expect(g.verdict).toBe('clean');
    expect(g.reasons).toEqual([]);
    expect(g.warningCount).toBe(0);
    expect(g.label[0]).toBe('ACCEPTED — CLEAN');
  });

  it('passes content findings as warnings (does not block)', () => {
    const g = simulateAcceptanceGate(okHeader, [{ rule_id: 'C1', type: 'C', title: 'content', count: 3 }]);
    expect(g.verdict).toBe('warnings');
    expect(g.warningCount).toBe(3);
    expect(g.reasons).toEqual([]);
  });

  it('blocks on technical (X/V) findings and totals them', () => {
    const g = simulateAcceptanceGate(okHeader, [{ rule_id: 'XSD1', type: 'X', title: 'schema', count: 2 }]);
    expect(g.verdict).toBe('rejected');
    expect(g.blockingTotal).toBe(2);
    expect(g.reasons.find((r) => r.id === 'XSD1')).toBeTruthy();
    expect(g.label[0]).toBe('FILE WOULD BE REJECTED');
  });

  it('blocks an unparseable file, a bad version, and a missing registration number', () => {
    expect(simulateAcceptanceGate({ _parseError: 'bad xml' }, []).reasons.some((r) => r.id === 'XML')).toBe(true);
    expect(simulateAcceptanceGate({ header: { registrationNumber: '1', auditFileVersion: '1.0' } }, []).reasons.some((r) => r.id === 'HDR_VER')).toBe(true);
    expect(simulateAcceptanceGate({ header: { company: {} } }, []).reasons.some((r) => r.id === 'HDR_REG')).toBe(true);
  });

  it('ignores rejected findings, and a block overrides warnings in the verdict', () => {
    expect(simulateAcceptanceGate(okHeader, [{ rule_id: 'X', type: 'X', status: 'rejected' }]).verdict).toBe('clean');
    const mixed = simulateAcceptanceGate(okHeader, [
      { rule_id: 'x1', type: 'X', count: 1 },
      { rule_id: 'c1', type: 'C', count: 5 },
    ]);
    expect(mixed.verdict).toBe('rejected'); // block wins
    expect(mixed.warningCount).toBe(5);     // …but warnings are still tallied
    expect(mixed.blockingTotal).toBe(1);
  });
});
