// Reproduction for the "E-Invoicing tab goes blank" report. Renders the two
// components mounted by the einvoicing view with the app's initial state.
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { EInvoicingTab, EInvoiceStudio } from '../TaxAI.jsx';

afterEach(cleanup);

const einv = {
  profile: { name: 'UAB Demo', regNo: '305123458', vatNo: 'LT130512345819', iban: 'LT607044060008101234', city: 'Vilnius', street: '', postal: '', series: 'TX', peppolScheme: '0200' },
  settings: { peppolEnabled: true, emailConsent: false, vida: false },
  seq: 1, outbox: [], inbox: [], archive: [],
};
const baseProps = { lang: 'en', t: (a) => a, audit: { log: () => {} }, einv, setEinv: () => {}, erp: { store: { customers: [] }, taxMap: {} }, fileData: null, isafData: null, setToast: () => {} };

const fileData = { hash: 'h1', parsed: { header: { company: { name: 'UAB Demo', registrationNumber: '305123458' } }, sales: { items: [{ invoiceNo: 'S1', invoiceDate: '2026-03-01', customerID: 'C1', documentTotals: { netTotal: 1000, taxPayable: 210, grossTotal: 1210 }, lines: [{}] }] }, purchases: { items: [] } } };
const isafData = { sales: [{ invoiceNo: 'S1' }] };

describe('E-Invoicing tab renders', () => {
  it('EInvoicingTab renders without crashing (empty)', () => {
    expect(() => { const { unmount } = render(<EInvoicingTab {...baseProps} />); unmount(); }).not.toThrow();
  });
  it('EInvoicingTab renders with a loaded SAF-T + i.SAF register', () => {
    expect(() => { const { unmount } = render(<EInvoicingTab {...baseProps} fileData={fileData} isafData={isafData} />); unmount(); }).not.toThrow();
  });
  it('EInvoiceStudio renders without crashing (empty)', () => {
    expect(() => { const { unmount } = render(<EInvoiceStudio lang="en" fileData={null} setToast={() => {}} audit={{ log: () => {} }} />); unmount(); }).not.toThrow();
  });
  it('EInvoiceStudio renders with a loaded SAF-T', () => {
    expect(() => { const { unmount } = render(<EInvoiceStudio lang="en" fileData={fileData} setToast={() => {}} audit={{ log: () => {} }} />); unmount(); }).not.toThrow();
  });
});
