import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DISTRESS_TEXT, SYSTEM_PROMPT } from './_system-prompt';
// @ts-expect-error - plain .mjs build script, no types
import { buildPrompt } from '../scripts/build-system-prompt.mjs';

const FRAMEWORK = join(process.cwd(), 'specs', 'grief-framework-context.md');

describe('generated system prompt', () => {
  it('matches the current framework document', () => {
    // The framework lives in one place. If this fails, the document moved and
    // the prompt did not: run `npm run build:prompt`.
    const expected = buildPrompt(readFileSync(FRAMEWORK, 'utf8'));
    expect(SYSTEM_PROMPT).toBe(expected);
  });

  it('carries the framework inside a delimiter', () => {
    expect(SYSTEM_PROMPT).toContain('<framework>');
    expect(SYSTEM_PROMPT).toContain('</framework>');
    expect(SYSTEM_PROMPT).toContain('The Grief Gap');
    expect(SYSTEM_PROMPT).toContain('DISCOMFORT');
  });

  it('states every rule the spec requires', () => {
    expect(SYSTEM_PROMPT).toContain('Never diagnose an ethical objection');
    expect(SYSTEM_PROMPT).toContain('Attended training but tried nothing');
    expect(SYSTEM_PROMPT).toContain('Stop early if Stage 1 is clear by turn 4');
    expect(SYSTEM_PROMPT).toContain('behaviour outranks emotion');
    expect(SYSTEM_PROMPT).toContain('Never claim anything is saved');
    // Naming the stage mid-interview biases the remaining answers.
    expect(SYSTEM_PROMPT).toContain('Do not mention stage names');
    expect(SYSTEM_PROMPT).toContain(DISTRESS_TEXT);
  });

  it('names every canonical id the classifier must return', () => {
    for (const id of [
      'loss',
      'doubt',
      'discomfort',
      'discovery',
      'understanding',
      'integration',
      'teaching',
      'craft',
      'analysis',
      'building',
      'coordination',
      'skills_obsolescence',
      'identity_authority',
      'verification',
      'authenticity_quality',
      'economic',
      'ethical',
      'control_opacity',
      'innovator',
      'early_adopter',
      'early_majority',
      'late_majority',
      'laggard',
    ]) {
      expect(SYSTEM_PROMPT, `missing id: ${id}`).toContain(id);
    }
  });

  it('contains nothing that varies per request', () => {
    // Any variation silently disables prompt caching and roughly quadruples
    // the per-session input cost.
    expect(SYSTEM_PROMPT).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(SYSTEM_PROMPT).not.toContain('${');
    expect(SYSTEM_PROMPT).not.toContain('undefined');
    expect(buildPrompt(readFileSync(FRAMEWORK, 'utf8'))).toBe(
      buildPrompt(readFileSync(FRAMEWORK, 'utf8')),
    );
  });

  it('drops the document housekeeping sections', () => {
    expect(SYSTEM_PROMPT).not.toContain('Revision history');
    expect(SYSTEM_PROMPT).not.toContain('Kübler-Ross');
    // And no cross-document links for the model to cite at the user.
    expect(SYSTEM_PROMPT).not.toContain('.md)');
  });

  it('stays in a sensible size band for a cached prefix', () => {
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(15_000);
    expect(SYSTEM_PROMPT.length).toBeLessThan(60_000);
  });
});
