import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * `base` is the GitHub Pages subpath, and it is applied to builds only.
 *
 * The site is served from markgill47-lab.github.io/technological-grief/, so
 * every asset URL Vite writes into the built index.html needs that prefix or
 * the page loads and then 404s on its own script. The dev server keeps '/',
 * which is why http://localhost:5173 still works without the segment, and
 * vitest resolves the config in serve mode so tests are unaffected.
 *
 * Routing is hash-based, so the subpath costs nothing there: Pages never sees
 * a path it has to rewrite, and a deep link like #/explore/discovery survives
 * a reload without a 404 fallback.
 */
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/technological-grief/' : '/',
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
}));
