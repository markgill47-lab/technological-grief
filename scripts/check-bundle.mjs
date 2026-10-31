#!/usr/bin/env node
/**
 * Security and size checks on the built client bundle.
 *
 * v1's design shipped VITE_ANTHROPIC_API_KEY to the browser while asserting
 * elsewhere that no key was exposed. These checks are why that cannot happen
 * again by accident: the claim is enforced, not merely documented.
 *
 * See specs/software-design-document.md section 7.1 and
 * specs/test-scenarios.md section 9.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, extname } from 'node:path';
import { createRequire } from 'node:module';

const DIST = 'dist';
const MAX_JS_GZIP = 180 * 1024;
const MAX_CSS_GZIP = 40 * 1024;

const failures = [];
const notes = [];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// --- S-01: the Anthropic SDK must not be a client dependency --------------
const require = createRequire(import.meta.url);
const pkg = require('../package.json');
if (pkg.dependencies?.['@anthropic-ai/sdk']) {
  failures.push(
    'S-01 @anthropic-ai/sdk is a client dependency. It belongs on the proxy only.',
  );
}

// --- S-04: no VITE_-prefixed secret names ---------------------------------
for (const name of Object.keys(process.env)) {
  if (/^VITE_/.test(name) && /KEY|SECRET|TOKEN/i.test(name)) {
    failures.push(`S-04 ${name} would be inlined into the client bundle.`);
  }
}

let files;
try {
  files = walk(DIST);
} catch {
  console.error(`No ${DIST}/ directory. Run "npm run build" first.`);
  process.exit(1);
}

for (const file of files) {
  const ext = extname(file);
  if (!['.js', '.css', '.html', '.map'].includes(ext)) continue;
  const text = readFileSync(file, 'utf8');

  // --- S-02: no API key material ----------------------------------------
  if (/sk-ant-/.test(text)) {
    failures.push(`S-02 ${file} contains an Anthropic key prefix.`);
  }

  // --- S-03: the client cannot reach the API directly -------------------
  if (/api\.anthropic\.com/.test(text)) {
    failures.push(`S-03 ${file} references api.anthropic.com directly.`);
  }

  // --- S-05: sessionStorage only ----------------------------------------
  if (/\blocalStorage\b/.test(text)) {
    failures.push(
      `S-05 ${file} uses localStorage. Session state is sessionStorage only.`,
    );
  }
}

// --- P-07 / P-08: bundle size --------------------------------------------
let jsBytes = 0;
let cssBytes = 0;
for (const file of files) {
  const ext = extname(file);
  if (ext === '.js') jsBytes += gzipSync(readFileSync(file)).length;
  if (ext === '.css') cssBytes += gzipSync(readFileSync(file)).length;
}

const kb = (n) => `${(n / 1024).toFixed(1)}KB`;
notes.push(`JS  ${kb(jsBytes)} gzipped (budget ${kb(MAX_JS_GZIP)})`);
notes.push(`CSS ${kb(cssBytes)} gzipped (budget ${kb(MAX_CSS_GZIP)})`);

if (jsBytes > MAX_JS_GZIP) failures.push(`P-07 JS bundle ${kb(jsBytes)} over budget.`);
if (cssBytes > MAX_CSS_GZIP) failures.push(`P-08 CSS ${kb(cssBytes)} over budget.`);

for (const n of notes) console.log(`  ${n}`);

if (failures.length) {
  console.error('\nBundle checks failed:');
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}

console.log('\n  ✓ bundle checks passed');
