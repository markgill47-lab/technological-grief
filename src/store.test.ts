import { describe, expect, it } from 'vitest';
import { currentAnswered, hashFor, isComplete, parseHash } from './store';
import type { QuickAnswers } from './diagnostic/quickQuestions';
import { STAGE_IDS } from './domain/types';

describe('routing', () => {
  it('parses every stage deep link', () => {
    for (const stage of STAGE_IDS) {
      expect(parseHash(`#/explore/${stage}`)).toEqual({ mode: 'explore', stage });
    }
  });

  it('parses the diagnose route and the root', () => {
    expect(parseHash('#/diagnose')).toEqual({ mode: 'diagnose', stage: null });
    for (const empty of ['', '#', '#/']) {
      expect(parseHash(empty)).toEqual({ mode: 'explore', stage: null });
    }
  });

  it('rejects an unknown stage rather than guessing', () => {
    expect(parseHash('#/explore/bargaining')).toBeNull();
    expect(parseHash('#/explore/')).toBeNull();
    expect(parseHash('#/nonsense')).toBeNull();
  });

  it('round-trips every route', () => {
    for (const stage of STAGE_IDS) {
      const h = hashFor('explore', stage);
      expect(parseHash(h)).toEqual({ mode: 'explore', stage });
    }
    expect(parseHash(hashFor('diagnose', null))).toEqual({
      mode: 'diagnose',
      stage: null,
    });
    expect(parseHash(hashFor('explore', null))).toEqual({
      mode: 'explore',
      stage: null,
    });
  });

  it('never puts a diagnosis in the URL', () => {
    // S-07: the diagnosis would otherwise survive in history and in anything
    // that logs referrers.
    for (const stage of STAGE_IDS) {
      const h = hashFor('explore', stage);
      expect(h).not.toMatch(/gap|threat|rogers|confidence|domain/);
    }
  });
});

describe('survey completeness', () => {
  const full: QuickAnswers = {
    q1: 'c',
    q2: 'a',
    q3: ['trained'],
    q4: 'c',
    q5: 'verification',
    q6: 'c',
  };

  it('requires every question', () => {
    expect(isComplete(full)).toBe(true);
    for (const key of ['q1', 'q2', 'q4', 'q5', 'q6'] as const) {
      const partial = { ...full };
      delete partial[key];
      expect(isComplete(partial), `missing ${key}`).toBe(false);
    }
    expect(isComplete({ ...full, q3: [] })).toBe(false);
  });

  it('gates Next on the current question only', () => {
    expect(currentAnswered({ q1: 'a' }, 0)).toBe(true);
    expect(currentAnswered({ q1: 'a' }, 1)).toBe(false);
    expect(currentAnswered({ q3: [] }, 2)).toBe(false);
    expect(currentAnswered({ q3: ['trained'] }, 2)).toBe(true);
    expect(currentAnswered(full, 5)).toBe(true);
  });
});
