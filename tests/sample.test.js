// Onboarding: seedSampleTwin must populate the twin so every read-model comes
// alive (the "usable from first open" fix), and the seeded employees must carry
// the field the payroll engine reads (regression for the e.gross→grossSalary bug).
import { describe, it, expect } from 'vitest';
import { FinTwin, seedSampleTwin } from '../TaxAI.jsx';

describe('sample-data onboarding', () => {
  it('populates the twin and the read-models without breaking the ledger', () => {
    const twin = FinTwin.createTwin({ clientId: 'sample' });
    const n = seedSampleTwin(twin);
    expect(n).toBeGreaterThan(25);
    expect(twin.listEntities('invoice').length).toBeGreaterThanOrEqual(20);
    expect(twin.listEntities('employee').length).toBe(2);
    expect(twin.trialBalance().balanced).toBe(true);
  });
  it('gives the forecast enough history to backtest (6 months → accuracy)', () => {
    const twin = FinTwin.createTwin({ clientId: 'sample2' });
    seedSampleTwin(twin);
    const fc = FinTwin.buildForecast(twin);
    expect(fc).toBeTruthy();
    expect(fc.accuracy).not.toBeNull();
  });
  it('seeded employees carry grossSalary that the payroll engine can use (>0 net)', () => {
    const twin = FinTwin.createTwin({ clientId: 'sample3' });
    seedSampleTwin(twin);
    const emp = twin.listEntities('employee')[0];
    expect(emp.grossSalary).toBeGreaterThan(0);
    const r = FinTwin.createPayrollEngine().calcEmployee({ gross: emp.grossSalary });
    expect(r.net).toBeGreaterThan(0);
    expect(r.net).toBeLessThan(emp.grossSalary);
  });
});
