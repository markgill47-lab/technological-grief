import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { apiDevServer } from './api/devServer';

export default defineConfig({
  plugins: [react(), apiDevServer()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'api/**/*.test.ts', 'scripts/**/*.test.mjs'],
  },
});
