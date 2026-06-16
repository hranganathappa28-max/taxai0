// Audit-grade close report: a deterministic, self-contained printable working
// paper built from the twin (the document an accountant hands to a client/VMI).
import { describe, it, expect } from 'vitest';
import { FinTwin, seedSampleTwin, buildEAccountantReportHtml } from '../TaxAI.jsx';

describe('buildEAccountantReportHtml', () => {
  it('builds a self-contained HTML report with the key sections and figures', () => {
    const twin = FinTwin.createTwin({ clientId: '305123458' });
    seedSampleTwin(twin);
    const html = buildEAccountantReportHtml(twin, { lang: 'en', company: 'UAB Demo' });
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('Period Close Report');
    expect(html).toContain('UAB Demo');
    expect(html).toContain('VAT position');
    expect(html).toContain('Close readiness');
    expect(html).toContain('€');
  });
  it('is deterministic for the same twin (ignoring the generated timestamp)', () => {
    const twin = FinTwin.createTwin({ clientId: 'd' });
    seedSampleTwin(twin);
    const strip = (s) => s.replace(/generated [0-9 :-]+/i, 'generated X');
    const a = buildEAccountantReportHtml(twin, { lang: 'en', company: 'X' });
    const b = buildEAccountantReportHtml(twin, { lang: 'en', company: 'X' });
    expect(strip(a)).toBe(strip(b));
  });
  it('respects the period filter and never throws on an empty twin', () => {
    expect(() => buildEAccountantReportHtml(FinTwin.createTwin({ clientId: 'e' }), { lang: 'lt' })).not.toThrow();
    const twin = FinTwin.createTwin({ clientId: 'p' });
    seedSampleTwin(twin);
    expect(buildEAccountantReportHtml(twin, { lang: 'en', period: '2026-01' })).toContain('2026-01');
  });
});
