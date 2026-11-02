import { describe, expect, it } from 'vitest';
import { assemble } from './assemble';
import { resolveThreatResponse } from './index';
import { splitStageCore } from './schema';
import { STAGE_CORES } from './stageCores';
import { DOMAIN_LENSES } from './domainLenses';
import { PACE_NOTES } from './paceNotes';
import type { Diagnosis } from '../domain/types';
import { ROGERS_IDS, STAGE_IDS } from '../domain/types';

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

const kinds = (p: ReturnType<typeof assemble>) => p.sections.map((s) => s.kind);

describe('assemble', () => {
  it('U-C-01 renders a complete page from the stage core alone', () => {
    for (const stage of STAGE_IDS) {
      const page = assemble(stage, null);
      expect(kinds(page)).toEqual(['overview', 'experience', 'why', 'forward']);
      for (const s of page.sections) expect(s.body.trim().length).toBeGreaterThan(0);
    }
  });

  it('U-C-02 stacks all four layers in order', () => {
    const page = assemble('discomfort', diag());
    expect(kinds(page)).toEqual([
      'overview',
      'experience',
      'lens',
      'experiment',
      'threat',
      'why',
      'forward',
      'pace',
    ]);
  });

  it('U-C-03 omits the lens where no block is authored for that stage', () => {
    // Derived rather than named: this test used to hardcode Discovery as the
    // unauthored stage, and broke the moment Discovery was written. The
    // guarantee is about the degradation path, not about which stage happens
    // to be empty this month.
    const authored = new Set(DOMAIN_LENSES.map((l) => l.stage));
    const unauthored = STAGE_IDS.find((s) => !authored.has(s));

    if (!unauthored) {
      // Every stage has its five lenses now. The same path is still reachable
      // with no diagnosis at all, so assert it there instead of losing it.
      expect(kinds(assemble('discomfort', null))).not.toContain('lens');
      return;
    }

    const page = assemble(unauthored, diag({ stage: unauthored }));
    expect(kinds(page), `stage ${unauthored}`).not.toContain('lens');
    expect(kinds(page), `stage ${unauthored}`).not.toContain('experiment');
    expect(kinds(page)).toContain('threat');
    expect(kinds(page)).toContain('pace');
  });

  it('U-C-04 renders one block for a redundant threat pair', () => {
    const page = assemble(
      'discomfort',
      diag({ threats: ['verification', 'control_opacity'] }),
    );
    expect(kinds(page).filter((k) => k === 'threat')).toHaveLength(1);
  });

  it('U-C-05 renders both for a non-redundant pair, primary first', () => {
    const page = assemble('discomfort', diag({ threats: ['verification', 'economic'] }));
    const threats = page.sections.filter((s) => s.kind === 'threat');
    expect(threats).toHaveLength(2);
    expect(threats[0].blockId).toBe('threat_response.verification');
    expect(threats[1].blockId).toBe('threat_response.economic');
  });

  it('U-C-06 caps threat blocks at two', () => {
    const page = assemble(
      'discomfort',
      diag({ threats: ['verification', 'economic', 'skills_obsolescence'] as never }),
    );
    expect(kinds(page).filter((k) => k === 'threat').length).toBeLessThanOrEqual(2);
  });

  it('U-C-07 promotes an ethical threat above the lens and suppresses the experiment', () => {
    const page = assemble(
      'discomfort',
      diag({ threats: ['ethical'], ethicalPosition: 'primary' }),
    );
    const order = kinds(page);
    expect(order).not.toContain('experiment');
    expect(order.indexOf('threat')).toBeLessThan(order.indexOf('lens'));
  });

  it('U-C-08/09/10 selects the pace framing by gap sign', () => {
    const pace = (p: ReturnType<typeof assemble>) =>
      p.sections.find((s) => s.kind === 'pace')!.body;

    // Assert the mapping, not prose keywords: a framing is correct when it is
    // the exact fragment the block holds for that sign.
    const cases = [
      { gap: 4, sign: 'fieldAhead' as const },
      { gap: -3.6, sign: 'userAhead' as const },
      { gap: 0.1, sign: 'aligned' as const },
      { gap: 0.5, sign: 'aligned' as const }, // boundary: inclusive
      { gap: -0.5, sign: 'aligned' as const },
      { gap: 0.6, sign: 'fieldAhead' as const },
      { gap: -0.6, sign: 'userAhead' as const },
    ];

    for (const r of ROGERS_IDS) {
      for (const { gap, sign } of cases) {
        const page = assemble('discomfort', diag({ rogers: r, gap }));
        expect(pace(page), `${r} at gap ${gap}`).toBe(PACE_NOTES[r].framings[sign]);
      }
    }

    // And the three framings must actually differ, or the layer does nothing.
    for (const r of ROGERS_IDS) {
      const f = PACE_NOTES[r].framings;
      expect(new Set([f.aligned, f.fieldAhead, f.userAhead]).size).toBe(3);
    }
  });

  it('U-C-11 splits every stage core into three non-empty sections', () => {
    for (const stage of STAGE_IDS) {
      const { overview, why, forward } = splitStageCore(STAGE_CORES[stage].body);
      expect(overview.length).toBeGreaterThan(100);
      expect(why.length).toBeGreaterThan(100);
      expect(forward.length).toBeGreaterThan(100);
    }
  });

  it('U-C-12 throws rather than guessing on an ambiguous variant', () => {
    // skills_obsolescence has two disjoint scoped variants, so every stage
    // resolves to exactly one or to none.
    for (const stage of STAGE_IDS) {
      expect(() => resolveThreatResponse('skills_obsolescence', stage)).not.toThrow();
    }
    // Early and late variants must be different blocks.
    expect(resolveThreatResponse('skills_obsolescence', 'loss')?.id).toBe(
      'threat_response.skills_obsolescence@early',
    );
    expect(resolveThreatResponse('skills_obsolescence', 'integration')?.id).toBe(
      'threat_response.skills_obsolescence@late',
    );
    // Mid-path stages have no scoped variant and no unscoped fallback.
    expect(resolveThreatResponse('skills_obsolescence', 'discomfort')).toBeNull();
  });

  it('U-C-13 never interpolates user text into an assembled block', () => {
    const page = assemble('discomfort', diag());
    const joined = page.sections.map((s) => s.body).join('\n');
    // Nothing in the diagnosis object should appear verbatim in content.
    expect(joined).not.toContain('early_majority');
    expect(joined).not.toContain('verification');
    expect(joined).not.toContain('0.1');
  });

  it('never emits a section with an empty body', () => {
    const page = assemble('discomfort', diag());
    for (const s of page.sections) expect(s.body.trim()).not.toBe('');
  });
});
