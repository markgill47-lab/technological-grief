import { describe, expect, it } from 'vitest';
import { diagnosisToMarkdown } from './toMarkdown';
import type { Diagnosis } from '../domain/types';
import { DOMAIN_IDS, ROGERS_IDS, STAGE_IDS, THREAT_IDS } from '../domain/types';
import { computeGap } from '../domain/gap';

function diag(over: Partial<Diagnosis> = {}): Diagnosis {
  return {
    stage: 'discomfort',
    stageConfidence: 'high',
    transitionToward: null,
    domain: 'teaching',
    threats: ['verification'],
    rogers: 'early_majority',
    gap: 0.1,
    signalConflict: false,
    ethicalPosition: null,
    path: 'quick',
    ...over,
  };
}

describe('markdown export', () => {
  it('includes the reading, the content, and the privacy footer', () => {
    const md = diagnosisToMarkdown(diag(), 'Because of what you said.');

    expect(md).toContain('# Discomfort, stage 3 of 6');
    expect(md).toContain('Because of what you said.');
    expect(md).toContain('## Your reading');
    expect(md).toContain('| Your work | Teaching & Assessment |');
    expect(md).toContain('| Your pace | Early majority |');
    expect(md).toContain('## Try this');
    expect(md).toContain('Nothing was stored');
    expect(md).toContain('not a clinical or');
  });

  it('carries the gap sentence rather than a bare number', () => {
    const level = diagnosisToMarkdown(diag(), null);
    expect(level).toContain('standing in roughly the same place');

    const behind = diagnosisToMarkdown(
      diag({ stage: 'loss', domain: 'building', gap: computeGap('loss', 'building') }),
      null,
    );
    expect(behind).toContain('ahead of you');

    const leader = diagnosisToMarkdown(
      diag({
        stage: 'understanding',
        domain: 'coordination',
        gap: computeGap('understanding', 'coordination'),
      }),
      null,
    );
    expect(leader).toContain('isolation rather than grief');
  });

  it('suppresses the experiment for an ethical objection', () => {
    const md = diagnosisToMarkdown(
      diag({ threats: ['ethical'], ethicalPosition: 'primary' }),
      null,
    );
    expect(md).not.toContain('## Try this');
    expect(md).toContain('not going to treat it as one');
  });

  it('notes a signal conflict and a transition when present', () => {
    const md = diagnosisToMarkdown(
      diag({ signalConflict: true, transitionToward: 'discovery' }),
      null,
    );
    expect(md).toContain('Feelings often lag actions');
    expect(md).toContain('signs of **Discovery**');
  });

  it('produces non-empty, well-formed output for every diagnosis shape', () => {
    for (const stage of STAGE_IDS) {
      for (const domain of DOMAIN_IDS) {
        for (const threat of THREAT_IDS) {
          for (const rogers of ROGERS_IDS) {
            const md = diagnosisToMarkdown(
              diag({
                stage,
                domain,
                threats: [threat],
                rogers,
                gap: computeGap(stage, domain),
                ethicalPosition: threat === 'ethical' ? 'primary' : null,
              }),
              null,
            );
            expect(md.length).toBeGreaterThan(800);
            expect(md).toContain('# ');
            // No unresolved template leftovers or empty headings.
            expect(md).not.toMatch(/\|\s*\|\s*\|\n\|---\|---\|\n\|\s*\|\s*\|/);
            expect(md).not.toMatch(/##\s*\n\s*\n##/);
            expect(md).not.toContain('undefined');
            expect(md).not.toContain('[object Object]');
          }
        }
      }
    }
  });
});
