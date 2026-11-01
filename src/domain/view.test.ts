import { describe, expect, it } from 'vitest';
import { isBorrowedDomain, viewDiagnosis } from './view';
import { computeGap } from './gap';
import { DOMAIN_IDS } from './types';
import type { Diagnosis } from './types';

function diag(over: Partial<Diagnosis> = {}): Diagnosis {
  return {
    stage: 'doubt',
    stageConfidence: 'high',
    transitionToward: null,
    domain: 'teaching',
    threats: ['skills_obsolescence', 'identity_authority'],
    ethicalPosition: null,
    rogers: 'early_majority',
    gap: computeGap('doubt', 'teaching'),
    signalConflict: false,
    path: 'quick',
    ...over,
  };
}

describe('viewing a diagnosis through another domain', () => {
  it('U-V-01 recomputes the gap for the domain being read', () => {
    const d = diag();
    for (const domain of DOMAIN_IDS) {
      const seen = viewDiagnosis(d, domain)!;
      expect(seen.domain).toBe(domain);
      expect(seen.gap).toBe(computeGap(d.stage, domain));
    }
  });

  it('U-V-02 never moves the reader: stage, threats and confidence pass through', () => {
    const d = diag();
    const seen = viewDiagnosis(d, 'building')!;
    expect(seen.stage).toBe(d.stage);
    expect(seen.stageConfidence).toBe(d.stageConfidence);
    expect(seen.transitionToward).toBe(d.transitionToward);
    expect(seen.threats).toEqual(d.threats);
    expect(seen.rogers).toBe(d.rogers);
    expect(seen.ethicalPosition).toBe(d.ethicalPosition);
    expect(seen.signalConflict).toBe(d.signalConflict);
  });

  it('U-V-03 does not mutate the stored diagnosis', () => {
    // The record of what someone answered has to survive being read through
    // five other fields, or the export stops matching the survey.
    const d = diag();
    const before = JSON.stringify(d);
    viewDiagnosis(d, 'craft');
    viewDiagnosis(d, 'coordination');
    expect(JSON.stringify(d)).toBe(before);
  });

  it('U-V-04 returns the diagnosis itself when nothing is overridden', () => {
    const d = diag();
    expect(viewDiagnosis(d, null)).toBe(d);
    expect(viewDiagnosis(d, 'teaching')).toBe(d);
    expect(viewDiagnosis(null, 'craft')).toBeNull();
  });

  it('U-V-05 knows when the reader has borrowed another field', () => {
    const d = diag();
    expect(isBorrowedDomain(d, 'teaching')).toBe(false);
    expect(isBorrowedDomain(d, 'building')).toBe(true);
    expect(isBorrowedDomain(d, null)).toBe(false);
    expect(isBorrowedDomain(null, 'building')).toBe(false);
  });

  it('U-V-06 changes the sign of the gap when the field is behind the reader', () => {
    // Coordination sits at 2.4 and Building at 5.0. Someone at Discovery is
    // ahead of one and behind the other, and the two cases mean opposite
    // things (grief-framework-context.md §5.2).
    const d = diag({ stage: 'discovery' });
    expect(viewDiagnosis(d, 'coordination')!.gap).toBeLessThan(0);
    expect(viewDiagnosis(d, 'building')!.gap).toBeGreaterThan(0);
  });
});
