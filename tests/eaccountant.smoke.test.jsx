// Smoke test: every E-Accountant view must render without crashing, in both
// languages, with an empty twin. This is the safety net for the sub-view
// hoist refactor — a mis-threaded prop would throw at render time and fail here.
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { EAccountantView } from '../TaxAI.jsx';

const VIEWS = [
  'cmd', 'agents', 'tx', 'inv', 'graph', 'twin', 'fc', 'tre',
  'pay', 'close', 'comp', 'advisor', 'company', 'integrations', 'saft', 'settings',
];

afterEach(cleanup);

describe('EAccountantView renders every view', () => {
  for (const lang of ['en', 'lt']) {
    for (const v of VIEWS) {
      it(`renders "${v}" (${lang}) without crashing`, () => {
        expect(() => {
          const { unmount } = render(
            <EAccountantView lang={lang} initialView={v} setToast={() => {}} onAi={async () => ''} />
          );
          unmount();
        }).not.toThrow();
      });
    }
  }
});
