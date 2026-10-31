#!/usr/bin/env node
/**
 * Generates api/_system-prompt.ts from the canonical framework document.
 *
 * The framework lives in specs/grief-framework-context.md and nowhere else.
 * Hand-copying it into the prompt would create a second source of truth that
 * drifts silently, so it is generated — and `_system-prompt.test.ts` fails if
 * the committed output no longer matches the document.
 *
 * The result is committed rather than built on deploy, so the serverless
 * function does not depend on specs/ being present in the deployment.
 *
 * It must also be BYTE-STABLE across requests within a release: this is the
 * cached prompt prefix, and any variation silently stops prompt caching from
 * working. Nothing interpolated at request time, no timestamps.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(root, 'specs', 'grief-framework-context.md');
const TARGET = join(root, 'api', '_system-prompt.ts');

/** Housekeeping for human readers, not framework content. */
const DROP_SECTIONS = ['## 15. References', '## Revision history'];

export const DISTRESS_TEXT =
  "I want to be clear about what I am — a reflection tool built on a " +
  'change-management framework, not a mental health professional. If what is ' +
  'going on is heavier than work frustration, someone who specializes in ' +
  'career transitions or workplace stress would be a better place to take it.';

export function extractFramework(markdown) {
  let framework = markdown;

  for (const heading of DROP_SECTIONS) {
    const i = framework.indexOf(heading);
    if (i === -1) continue;
    const next = framework.indexOf('\n## ', i + heading.length);
    framework =
      next === -1 ? framework.slice(0, i) : framework.slice(0, i) + framework.slice(next + 1);
  }

  // Cross-document references are noise to the model and would invite it to
  // cite filenames at the user. Three forms appear in the document:
  // markdown links, "(see foo.md)" parentheticals, and bare filenames.
  return framework
    .replace(/\[([^\]]+)\]\([^)]+\.md[^)]*\)/g, '$1')
    .replace(/\s*\((?:see\s+)?[^()]*\.md[^()]*\)/g, '')
    .replace(/\b[A-Za-z0-9._-]+\.md\b/g, 'the specification')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function buildPrompt(markdown) {
  return [
    'You are conducting a brief, warm conversation to help someone locate',
    'themselves in the Change Grief Cycle with respect to AI in their work.',
    '',
    '<framework>',
    extractFramework(markdown),
    '</framework>',
    '',
    'Conduct 5-8 turns. One question at a time. Keep each turn short — two or',
    'three sentences, then the question. Adapt to what they say; do not work',
    'through a fixed list.',
    '',
    'You are establishing four things:',
    '  - stage: one of loss, doubt, discomfort, discovery, understanding, integration',
    '  - domain: exactly one of teaching, craft, analysis, building, coordination',
    '  - threats: one or two of skills_obsolescence, identity_authority,',
    '    verification, authenticity_quality, economic, ethical, control_opacity',
    '  - rogers: one of innovator, early_adopter, early_majority, late_majority, laggard',
    '',
    'Weighting: behaviour outranks emotion, and emotion outranks self-report.',
    'Someone who reports feeling overwhelmed while describing three successful',
    'experiments is in Discovery with lagging feelings, not in Discomfort.',
    '',
    'Rules:',
    '- Never diagnose an ethical objection as a stage symptom. It is a position,',
    '  not a condition. See framework section 7.1.',
    '- Attended training but tried nothing is near-conclusive for Discomfort.',
    '- Stop early if Stage 1 is clear by turn 4. Questioning someone in denial',
    '  past that point reads as interrogation.',
    '- If someone describes distress beyond ordinary work frustration, reproduce',
    '  this text exactly and then stop asking questions:',
    `  "${DISTRESS_TEXT}"`,
    '- Never claim anything is saved or remembered. Nothing is.',
    '- Do not mention stage names, the framework, or that you are classifying',
    '  anything while you are still asking. A person told they are "probably in',
    '  Discomfort" at turn three will answer turn four as a person in Discomfort.',
    '- Ask about their work before you ask about how they feel about it.',
    '',
  ].join('\n');
}

export function renderModule(prompt) {
  return `/* eslint-disable */
// GENERATED FILE — do not edit.
// Source: specs/grief-framework-context.md
// Regenerate: npm run build:prompt
//
// Byte-stability matters: this is the cached prompt prefix. Editing it by
// hand, or interpolating anything into it at request time, silently disables
// prompt caching and roughly quadruples the per-session input cost.

export const DISTRESS_TEXT = ${JSON.stringify(DISTRESS_TEXT)};

export const SYSTEM_PROMPT = ${JSON.stringify(prompt)};
`;
}

// Only write when run directly, so tests can import the builders.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const prompt = buildPrompt(readFileSync(SOURCE, 'utf8'));
  writeFileSync(TARGET, renderModule(prompt), 'utf8');
  console.log(
    `  ✓ api/_system-prompt.ts  ${prompt.length} chars ` +
      `(~${Math.round(prompt.length / 3.8)} tokens, cached)`,
  );
}
