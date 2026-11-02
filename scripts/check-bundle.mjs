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

const DIST = 'dist';
const MAX_JS_GZIP = 180 * 1024;
const MAX_CSS_GZIP = 40 * 1024;

/** The one value allowed to outlive the tab, and the only file allowed to set it. */
const THEME_KEY = 'grief.theme';
const LOCAL_STORAGE_OK = ['src/theme/useTheme.ts'];
/** Everything about the reading itself, which is sessionStorage and nothing else. */
const SESSION_KEY = 'tgi.session.v2';

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

const SOURCE = walk('src').filter((f) =>
  ['.ts', '.tsx', '.js', '.jsx'].includes(extname(f)),
);

// --- S-00: the app makes no network requests at all -----------------------
//
// This is the product's defining property, not an implementation detail:
// "nothing you enter leaves your browser" is the reason the tool can be
// shared as a public link with no key, no proxy and no per-visitor cost.
// A claim that load-bearing is worth enforcing rather than trusting.
const NETWORK = /\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|new\s+WebSocket|EventSource\s*\(|import\s*\(\s*['"]https?:/;
for (const file of SOURCE) {
  if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue;
  const text = readFileSync(file, 'utf8');
  const hit = NETWORK.exec(text);
  if (hit) {
    failures.push(
      `S-00 ${file} makes a network call (${hit[0].trim()}). The app is offline-only.`,
    );
  }
}

// --- S-01: no Anthropic SDK, as a dependency or an import -----------------
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
for (const field of ['dependencies', 'devDependencies']) {
  if (pkg[field]?.['@anthropic-ai/sdk']) {
    failures.push(`S-01 @anthropic-ai/sdk is in ${field}. The app calls no API.`);
  }
}
const SDK_IMPORT = /\bfrom\s+['"]@anthropic-ai\/sdk|require\(\s*['"]@anthropic-ai\/sdk/;
for (const file of SOURCE) {
  if (SDK_IMPORT.test(readFileSync(file, 'utf8'))) {
    failures.push(`S-01 ${file} imports @anthropic-ai/sdk.`);
  }
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

  // --- S-05, in the built output ----------------------------------------
  //
  // Only the theme bootstrap in index.html survives minification with its key
  // readable, so that is the one place the rule can be checked here. The
  // source-level half is below, where the key constants still have names.
  if (ext === '.html' && /\blocalStorage\b/.test(text) && !text.includes(THEME_KEY)) {
    failures.push(`S-05 ${file} uses localStorage for something other than ${THEME_KEY}.`);
  }
}

// --- S-05: the session dies with the tab ----------------------------------
//
// This used to be "no localStorage anywhere in dist", which was correct until
// D-12 gave the app a theme toggle and then failed every build from that
// commit onward. Nobody saw it, because this script is not part of
// `npm test`. The rule it was protecting is narrower than the mechanism it
// banned: session state goes in sessionStorage and dies with the tab, and the
// one value allowed to outlive it is a display preference that reveals
// nothing about anyone. Minification renames the key constants, so the
// allowlist is enforced against the source, where they can still be read.
for (const file of SOURCE) {
  if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue;
  const text = readFileSync(file, 'utf8');
  const rel = file.split('\\').join('/');

  if (/\blocalStorage\b/.test(text)) {
    if (!LOCAL_STORAGE_OK.includes(rel)) {
      failures.push(
        `S-05 ${rel} uses localStorage. Only ${LOCAL_STORAGE_OK.join(', ')} may, and only for ${THEME_KEY}.`,
      );
    } else if (!text.includes(THEME_KEY)) {
      failures.push(`S-05 ${rel} uses localStorage for something other than ${THEME_KEY}.`);
    }
  }

  if (text.includes(SESSION_KEY) && /\blocalStorage\b/.test(text)) {
    failures.push(`S-05 ${rel} puts the session key within reach of localStorage.`);
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
