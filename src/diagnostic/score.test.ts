import { describe, expect, it } from 'vitest';
import { computeScores, scoreQuick } from './score';
import {
  Q1,
  Q2,
  Q4,
  Q4_WEIGHTS,
  Q5,
  Q6,
  type BehaviorKey,
  type QuickAnswers,
} from './quickQuestions';
import { POSITION } from '../domain/stages';
import type { ThreatId } from '../domain/types';

const BEHAVIOR_KEYS: BehaviorKey[] = [
  'nothing',
  'consumed',
  'trained',
  'tried',
  'used',
  'built',
  'taught',
];

const FIXTURES = {
  /** The canonical Stage 3 faculty case from the spec's worked example. */
  facultyStuck: {
    q1: 'c',
    q2: 'a',
    q3: ['consumed', 'trained'],
    q4: 'c',
    q5: 'verification',
    q5b: 'identity_authority',
    q6: 'c',
  } satisfies QuickAnswers,

  /** Trained AND tried - the danger-zone bonus must not fire. */
  trainedAndTried: {
    q1: 'c',
    q2: 'a',
    q3: ['trained', 'tried'],
    q4: 'd',
    q5: 'skills_obsolescence',
    q6: 'c',
  } satisfies QuickAnswers,

  /** Behaviour says Discovery, emotion says Loss. */
  conflicted: {
    q1: 'd',
    q2: 'b',
    q3: ['used'],
    q4: 'a',
    q5: 'skills_obsolescence',
    q6: 'c',
  } satisfies QuickAnswers,

  /** Ahead of a barely-engaged field. */
  lonelyLeader: {
    q1: 'e',
    q2: 'e',
    q3: ['used', 'built'],
    q4: 'b',
    q5: 'economic',
    q6: 'b',
  } satisfies QuickAnswers,

  ethical: {
    q1: 'b',
    q2: 'b',
    q3: ['consumed'],
    q4: 'b',
    q5: 'ethical',
    q6: 'c',
  } satisfies QuickAnswers,
} as const;

describe('scoreQuick', () => {
  it('U-S-01 diagnoses Discomfort with high confidence for the canonical case', () => {
    const d = scoreQuick(FIXTURES.facultyStuck);
    expect(d.stage).toBe('discomfort');
    expect(d.stageConfidence).toBe('high');
    expect(d.transitionToward).toBeNull();
    expect(d.domain).toBe('teaching');
    expect(d.rogers).toBe('early_majority');
  });

  it('U-S-01b reproduces the spec worked example score exactly', () => {
    const { total } = computeScores(FIXTURES.facultyStuck);
    // Q1(c) 1.0x -> doubt 2, discomfort 3
    // Q3 [consumed, trained] + bonus 5 -> doubt 3, discomfort 7, then 2.0x
    // Q4(c) 1.5x -> discomfort 4.5
    expect(total.discomfort).toBe(21.5);
    expect(total.doubt).toBe(8);
    expect(total.loss).toBe(0);
  });

  it('U-S-02 training without implementation is decisive on its own', () => {
    const only = scoreQuick({ ...FIXTURES.facultyStuck, q3: ['trained'] });
    const { total } = computeScores({ ...FIXTURES.facultyStuck, q3: ['trained'] });
    expect(only.stage).toBe('discomfort');
    const runnerUp = Math.max(
      ...Object.entries(total)
        .filter(([k]) => k !== 'discomfort')
        .map(([, v]) => v),
    );
    expect(total.discomfort - runnerUp).toBeGreaterThanOrEqual(10);
  });

  it('U-S-03 does not apply the bonus when something was tried', () => {
    const { trainedWithoutImplementing } = computeScores(FIXTURES.trainedAndTried);
    expect(trainedWithoutImplementing).toBe(false);
  });

  it('U-S-04 weights behaviour over emotion and flags the conflict', () => {
    const d = scoreQuick(FIXTURES.conflicted);
    expect(d.stage).toBe('discovery');
    expect(d.signalConflict).toBe(true);
  });

  it('U-S-05 breaks every exact tie toward the earlier stage', () => {
    let tiesSeen = 0;
    for (const answers of enumerateAnswers()) {
      const { total, ranked } = computeScores(answers);
      if (total[ranked[0]] !== total[ranked[1]]) continue;
      tiesSeen++;
      expect(POSITION[ranked[0]]).toBeLessThan(POSITION[ranked[1]]);
    }
    // If the instrument ever stops producing ties this assertion is vacuous,
    // so fail loudly rather than pass silently.
    expect(tiesSeen).toBeGreaterThan(0);
  });

  it('U-S-06 names a transition for a thin adjacent margin', () => {
    const d = scoreQuick(FIXTURES.trainedAndTried);
    expect(d.stage).toBe('discomfort');
    expect(d.transitionToward).toBe('discovery');
    expect(d.stageConfidence).toBe('low');
  });

  it('U-S-07 names no transition when the top two are not adjacent', () => {
    for (const answers of enumerateAnswers()) {
      const d = scoreQuick(answers);
      const { ranked } = computeScores(answers);
      const adjacent = Math.abs(POSITION[ranked[0]] - POSITION[ranked[1]]) === 1;
      if (!adjacent) expect(d.transitionToward).toBeNull();
    }
  });

  it('U-S-08 computes an aligned gap for teaching at Discomfort', () => {
    expect(scoreQuick(FIXTURES.facultyStuck).gap).toBe(0.1);
  });

  it('U-S-09 computes a negative gap for coordination at Understanding', () => {
    const d = scoreQuick(FIXTURES.lonelyLeader);
    expect(d.stage).toBe('understanding');
    expect(d.gap).toBe(-2.6);
  });

  it('U-S-10 computes a positive gap for coordination at Loss', () => {
    const d = scoreQuick({
      q1: 'a',
      q2: 'e',
      q3: ['nothing'],
      q4: 'a',
      q5: 'economic',
      q6: 'e',
    });
    expect(d.stage).toBe('loss');
    expect(d.gap).toBe(1.4);
  });

  it('U-S-11 marks an ethical position without altering stage scoring', () => {
    const d = scoreQuick(FIXTURES.ethical);
    const control = scoreQuick({ ...FIXTURES.ethical, q5: 'economic' });
    expect(d.ethicalPosition).toBe('primary');
    expect(control.ethicalPosition).toBeNull();
    expect(d.stage).toBe(control.stage);
    expect(d.stageConfidence).toBe(control.stageConfidence);
  });

  it('U-S-12 returns both threats; assembly is what drops a redundant one', () => {
    const d = scoreQuick(FIXTURES.facultyStuck);
    expect(d.threats).toEqual(['verification', 'identity_authority']);
  });

  it('U-S-13 counts indifference toward Loss, not Discovery', () => {
    expect(Q4_WEIGHTS.g.loss).toBeGreaterThan(0);
    expect(Q4_WEIGHTS.g.discovery).toBeUndefined();
    const d = scoreQuick({
      q1: 'b',
      q2: 'c',
      q3: ['nothing'],
      q4: 'g',
      q5: 'economic',
      q6: 'd',
    });
    expect(d.stage).toBe('loss');
  });

  it('U-S-14 returns a valid diagnosis for every answer combination', () => {
    let count = 0;
    for (const answers of enumerateAnswers()) {
      const d = scoreQuick(answers);
      count++;
      expect(POSITION[d.stage]).toBeGreaterThanOrEqual(1);
      expect(d.gap).toBeGreaterThanOrEqual(-5);
      expect(d.gap).toBeLessThanOrEqual(5);
      expect(d.threats.length).toBeGreaterThanOrEqual(1);
      expect(d.threats.length).toBeLessThanOrEqual(2);
      expect(['high', 'moderate', 'low']).toContain(d.stageConfidence);
      expect(d.path).toBe('quick');
    }
    expect(count).toBeGreaterThan(5000);
  });

  it('U-S-15 handles every non-empty behaviour subset', () => {
    const subsets = nonEmptySubsets(BEHAVIOR_KEYS);
    expect(subsets.length).toBe(127);

    for (const q3 of subsets) {
      const answers: QuickAnswers = {
        q1: 'c',
        q2: 'a',
        q3,
        q4: 'c',
        q5: 'verification',
        q6: 'c',
      };
      const { trainedWithoutImplementing } = computeScores(answers);
      const expected =
        q3.includes('trained') &&
        !['tried', 'used', 'built', 'taught'].some((k) =>
          q3.includes(k as BehaviorKey),
        );
      expect(trainedWithoutImplementing).toBe(expected);
      expect(() => scoreQuick(answers)).not.toThrow();
    }
  });
});

/**
 * The full single-select answer space, with a representative spread of
 * behaviour sets. Small enough to enumerate completely, so there is no
 * reason to sample.
 */
function* enumerateAnswers(): Generator<QuickAnswers> {
  const q3Sets: BehaviorKey[][] = [
    ['nothing'],
    ['consumed'],
    ['trained'],
    ['consumed', 'trained'],
    ['tried'],
    ['used'],
    ['built'],
    ['taught'],
    ['used', 'built', 'taught'],
  ];

  for (const q1 of Q1.options) {
    for (const q2 of Q2.options) {
      for (const q3 of q3Sets) {
        for (const q4 of Q4.options) {
          for (const q6 of Q6.options) {
            yield {
              q1: q1.id,
              q2: q2.id,
              q3,
              q4: q4.id,
              q5: Q5.options[0].id as ThreatId,
              q6: q6.id,
            };
          }
        }
      }
    }
  }
}

function nonEmptySubsets<T>(items: T[]): T[][] {
  const out: T[][] = [];
  for (let mask = 1; mask < 1 << items.length; mask++) {
    out.push(items.filter((_, i) => mask & (1 << i)));
  }
  return out;
}
