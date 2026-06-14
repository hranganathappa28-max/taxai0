import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vitest runs the deterministic-engine unit tests (tests/**). It imports the
// named exports from TaxAI.jsx; jsdom provides the DOM globals the module
// touches. The production `vite build` is unaffected (it uses vite.config.js).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{js,jsx}'],
    setupFiles: ['./tests/setup.js'],
  },
});
