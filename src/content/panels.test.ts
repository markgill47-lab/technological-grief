import { describe, expect, it } from 'vitest';
import { assemble } from './assemble';
import { groupIntoPanels } from './panels';
import { STAGE_IDS } from '../domain/types';
import type { Diagnosis } from '../domain/types';

function diag(over: Partial<Diagnosis> = {}): Diagnosis {
  return {
    stage: 'discomfort',
    stageConfidence: 'high',
    transitionToward: null,
    domain: 'teaching',
    threats: ['skills_obsolescence', 'identity_authority'],
    ethicalPosition: null,
    rogers: 'early_majority',
    gap: 0.1,
    signalConflict: false,
    path: 'quick',
    ...over,
  };
}

describe('panel grouping', () => {
  it('U-P-01 loses nothing: every section lands in exactly one group', () => {
    for (const stage of STAGE_IDS) {
      for (const d of [null, diag({ stage }), diag({ stage, ethicalPosition: 'primary' })]) {
        const page = assemble(stage, d);
        const g = groupIntoPanels(page);

        const landed = [
          ...(g.description ? [g.description] : []),
          ...(g.experience ? [g.experience] : []),
          ...g.why,
          ...g.forward,
        ].map((s) => s.key);

        expect([...landed].sort()).toEqual([...page.sections.map((s) => s.key)].sort());
        expect(new Set(landed).size).toBe(landed.length);
      }
    }
  });

  it('U-P-02 always has a description and a triad to show in the panel', () => {
    for (const stage of STAGE_IDS) {
      const g = groupIntoPanels(assemble(stage, null));
      expect(g.description?.kind).toBe('overview');
      expect(g.experience?.kind).toBe('experience');
    }
  });

  it('U-P-03 leads each modal with the invariant core section', () => {
    const g = groupIntoPanels(assemble('discomfort', diag()));
    expect(g.why[0].kind).toBe('why');
    expect(g.forward[0].kind).toBe('forward');
  });

  it('U-P-04 keeps the ethical override: threat response before domain lens', () => {
    const g = groupIntoPanels(
      assemble('discomfort', diag({ ethicalPosition: 'primary', threats: ['ethical'] })),
    );
    const kinds = g.why.map((s) => s.kind);
    if (kinds.includes('threat') && kinds.includes('lens')) {
      expect(kinds.indexOf('threat')).toBeLessThan(kinds.indexOf('lens'));
    }
  });

  it('U-P-05 with no diagnosis both modals hold exactly their core section', () => {
    const g = groupIntoPanels(assemble('doubt', null));
    expect(g.why.map((s) => s.kind)).toEqual(['why']);
    expect(g.forward.map((s) => s.kind)).toEqual(['forward']);
  });

  it('U-P-06 never puts the same section behind both buttons', () => {
    const g = groupIntoPanels(assemble('discovery', diag({ stage: 'discovery' })));
    const whyKeys = new Set(g.why.map((s) => s.key));
    for (const s of g.forward) {
      expect(whyKeys.has(s.key)).toBe(false);
    }
  });
});
