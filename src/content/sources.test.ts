import { describe, expect, it } from 'vitest';
import {
  DOMAIN_SOURCES,
  FRAMEWORK_SOURCES,
  HELP_SOURCES,
  type Source,
} from './sources';
import { DOMAIN_IDS } from '../domain/types';

const ALL: Source[] = [
  ...FRAMEWORK_SOURCES,
  ...HELP_SOURCES,
  ...DOMAIN_IDS.flatMap((d) => DOMAIN_SOURCES[d]),
];

describe('sources', () => {
  it('U-S-01 every field of work has reading of its own', () => {
    // A domain with an empty list would show a heading above nothing, which
    // reads as "there is nothing to say about your work".
    for (const d of DOMAIN_IDS) {
      expect(DOMAIN_SOURCES[d].length, d).toBeGreaterThanOrEqual(2);
    }
  });

  it('U-S-02 every entry is complete enough to find', () => {
    for (const s of ALL) {
      expect(s.title.trim().length, s.title).toBeGreaterThan(0);
      expect(s.authors.trim().length, s.title).toBeGreaterThan(0);
      expect(s.venue.trim().length, s.title).toBeGreaterThan(0);
      expect(s.year, s.title).toMatch(/^(19|20)\d{2}$/);
    }
  });

  it('U-S-03 every entry says why it is here', () => {
    // A citation with no note is a reading list, not an answer to "where does
    // this come from". The note is the part that does the work.
    for (const s of ALL) {
      expect(s.note.trim().length, s.title).toBeGreaterThan(30);
    }
  });

  it('U-S-04 every link is a real absolute URL', () => {
    for (const s of ALL) {
      if (!s.url) continue;
      expect(() => new URL(s.url!), s.title).not.toThrow();
      expect(s.url, s.title).toMatch(/^https:\/\//);
    }
  });

  it('U-S-05 lists the work that argues against the tool', () => {
    // The framework list has to contain the direct empirical test that went
    // against stage theory. Dropping it would turn this into marketing.
    const titles = FRAMEWORK_SOURCES.map((s) => s.title).join(' ');
    expect(titles).toContain('Empirical Examination of the Stage Theory of Grief');
    expect(titles).toContain('Cautioning Health-Care Professionals');
  });

  it('U-S-06 flags what should not be taken at face value', () => {
    // Preprints and vendor-published surveys are used here, and each one
    // carries its own warning rather than a blanket note at the bottom.
    const flagged = ALL.filter((s) => s.caveat);
    expect(flagged.length).toBeGreaterThanOrEqual(6);
    for (const s of flagged) {
      expect(s.caveat!.trim().length, s.title).toBeGreaterThan(10);
    }
  });

  it('U-S-07 lists nothing twice', () => {
    const keys = ALL.map((s) => `${s.authors}|${s.year}|${s.title}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
