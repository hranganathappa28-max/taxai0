// Regression test for the Invoicing/Transactions tabs: they read inbox-item
// review fields, which are FLAT (item.verdict/confidence/opinions). The desks
// used to read item.review.* (undefined) and crashed the moment a real invoice
// had an inbox item — which the empty-twin smoke test never exercised.
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { FinTwin, InvoiceDesk, TransactionsDesk } from '../TaxAI.jsx';

afterEach(cleanup);

function populated() {
  const twin = FinTwin.createTwin({ clientId: 'desk-test' });
  twin.ingest('sales.invoice.issued', { invoiceId: 'S1', customer: { name: 'Acme', code: 'C1' }, net: 1000, vat: 210, total: 1210, date: '2026-03-01', dueDate: '2026-03-31' });
  twin.ingest('purchase.invoice.received', { invoiceId: 'P1', vendor: { name: 'Sup', code: 'V1' }, net: 500, vat: 105, total: 605, date: '2026-03-02', dueDate: '2026-03-20' });
  const inbox = FinTwin.createInbox(twin); // replays the two events into review items
  return { twin, inbox };
}

describe('inbox item shape', () => {
  it('exposes review fields flat (verdict/confidence/opinions), not under .review', () => {
    const { twin, inbox } = populated();
    const evId = twin.getEvents().find((e) => e.type === 'sales.invoice.issued').id;
    const item = inbox.getByEvent(evId);
    expect(item).toBeTruthy();
    expect(item.review).toBeUndefined();          // there is no nested .review
    expect(typeof item.verdict).toBe('string');   // the desks must read these
    expect(typeof item.confidence).toBe('number');
    expect(Array.isArray(item.opinions)).toBe(true);
  });
});

describe('E-Accountant desks render with real invoices + inbox items', () => {
  it('InvoiceDesk (Invoicing tab) renders rows without crashing', () => {
    const { twin, inbox } = populated();
    expect(() => {
      const { container, unmount } = render(<InvoiceDesk twin={twin} inbox={inbox} lang="en" />);
      expect(container.textContent).toContain('Acme'); // a real invoice row rendered
      unmount();
    }).not.toThrow();
  });

  it('TransactionsDesk (Transactions tab) renders without crashing', () => {
    const { twin, inbox } = populated();
    expect(() => {
      const { unmount } = render(<TransactionsDesk twin={twin} inbox={inbox} lang="en" actor="acc" />);
      unmount();
    }).not.toThrow();
  });
});
