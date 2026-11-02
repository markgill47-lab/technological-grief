import { describe, expect, it } from 'vitest';
import { ALL_BLOCKS, DOMAIN_LENSES, STAGE_CORES, THREAT_RESPONSES } from './index';
import { PACE_NOTES } from './paceNotes';
import { assemble } from './assemble';
import { splitStageCore } from './schema';
import { DOMAIN_IDS, ROGERS_IDS, STAGE_IDS, THREAT_IDS } from '../domain/types';
import type { Diagnosis, Domain, RogersPosition, Stage, ThreatId } from '../domain/types';
import { computeGap } from '../domain/gap';
import {
  DOMAIN_IMAGE_BRIEFS,
  IMAGE_BRIEFS,
  PROMPT_LEAD,
  PROMPT_RULES,
  briefFor,
} from './imageBriefs';

/**
 * Content validation. These run in CI and fail the build.
 * See specs/content-architecture.md section 5.
 */

/**
 * Explicit word bounds per fragment type.
 *
 * These exist to catch one block quietly becoming the whole page, not to
 * police style. An earlier version of this check derived bounds from a single
 * target with a compounding tolerance, which produced an incoherent floor
 * (21.6 words for a pace framing) and failed content that was correct.
 */
const WORD_BOUNDS = {
  /** Measured across the three sections combined. */
  stage_core: { min: 300, max: 700 },
  domain_lens_body: { min: 90, max: 250 },
  domain_lens_experiment: { min: 50, max: 180 },
  threat_response: { min: 60, max: 200 },
  /** The aligned framing is deliberately terser than the two signed ones. */
  pace_note_framing: { min: 15, max: 130 },
} as const;

/** Build-enforced. specs/content-specification.md section 2.2. */
const BANNED = [
  'symptoms',
  'symptom',
  'patient',
  'treatment',
  'diagnosis of',
  'disorder',
  'pathology',
  'pathological',
  'prognosis',
  'clinical',
  'therapy',
  'dysfunction',
  'coping mechanism',
  'maladaptive',
];

function words(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function bodiesOf(block: (typeof ALL_BLOCKS)[number]): string[] {
  if (block.kind === 'pace_note') return Object.values(block.framings);
  if (block.kind === 'domain_lens') {
    return [block.body, block.firstExperiment ?? ''].filter(Boolean);
  }
  return [block.body];
}

describe('content validation', () => {
  it('U-V-01 has all six stage cores and all five pace notes', () => {
    for (const stage of STAGE_IDS) {
      expect(STAGE_CORES[stage], `missing stage core: ${stage}`).toBeDefined();
      expect(STAGE_CORES[stage].stage).toBe(stage);
    }
    for (const r of ROGERS_IDS) {
      expect(PACE_NOTES[r], `missing pace note: ${r}`).toBeDefined();
      expect(Object.keys(PACE_NOTES[r].framings).sort()).toEqual([
        'aligned',
        'fieldAhead',
        'userAhead',
      ]);
    }
  });

  it('U-V-02 gives each stage either all five domain lenses or none', () => {
    for (const stage of STAGE_IDS) {
      const count = DOMAIN_LENSES.filter((b) => b.stage === stage).length;
      expect([0, 5], `stage ${stage} has ${count} lenses`).toContain(count);
    }
    // Authoring phase 3: Discomfort complete, the rest open by design.
    expect(DOMAIN_LENSES.filter((b) => b.stage === 'discomfort')).toHaveLength(5);
    expect(new Set(DOMAIN_LENSES.map((b) => b.domain)).size).toBe(DOMAIN_IDS.length);
  });

  it('U-V-03 has no duplicate block ids', () => {
    const ids = ALL_BLOCKS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('U-V-04 resolves at most one variant per threat per stage', () => {
    for (const threat of THREAT_IDS) {
      for (const stage of STAGE_IDS) {
        const scoped = THREAT_RESPONSES.filter(
          (b) => b.threat === threat && b.stageScope?.includes(stage),
        );
        expect(
          scoped.length,
          `${threat} at ${stage} resolves ${scoped.length} variants`,
        ).toBeLessThanOrEqual(1);
      }
    }
  });

  it('U-V-05 assembles all 1,050 combinations with no gaps', () => {
    let combinations = 0;

    for (const stage of STAGE_IDS) {
      for (const domain of DOMAIN_IDS) {
        for (const threat of THREAT_IDS) {
          for (const rogers of ROGERS_IDS) {
            combinations++;
            const d: Diagnosis = {
              stage,
              stageConfidence: 'high',
              transitionToward: null,
              domain: domain as Domain,
              threats: [threat as ThreatId],
              rogers: rogers as RogersPosition,
              gap: computeGap(stage as Stage, domain as Domain),
              signalConflict: false,
              ethicalPosition: threat === 'ethical' ? 'primary' : null,
              path: 'quick',
            };

            const page = assemble(stage, d);

            // No empty section, ever.
            for (const s of page.sections) {
              expect(
                s.body.trim().length,
                `empty section ${s.kind} for ${stage}/${domain}/${threat}/${rogers}`,
              ).toBeGreaterThan(0);
            }

            // The invariant spine is always present.
            const kinds = page.sections.map((s) => s.kind);
            expect(kinds).toContain('overview');
            expect(kinds).toContain('why');
            expect(kinds).toContain('forward');
            expect(kinds).toContain('pace');

            // No duplicated paragraph across the whole page.
            const paragraphs = page.sections
              .filter((s) => s.kind !== 'experience')
              .flatMap((s) => s.body.split(/\n{2,}/).map((p) => p.trim()))
              .filter((p) => p.length > 40);
            expect(
              new Set(paragraphs).size,
              `duplicate paragraph for ${stage}/${domain}/${threat}/${rogers}`,
            ).toBe(paragraphs.length);

            // No heading above nothing: every section with a heading has a body.
            for (const s of page.sections) {
              if (s.heading) expect(s.body.trim().length).toBeGreaterThan(0);
            }
          }
        }
      }
    }

    expect(combinations).toBe(1050);
  });

  it('U-V-06 keeps every block within its word bounds', () => {
    const check = (
      id: string,
      label: string,
      n: number,
      bounds: { min: number; max: number },
    ) => {
      expect(n, `${id} ${label} is ${n} words, min ${bounds.min}`).toBeGreaterThanOrEqual(
        bounds.min,
      );
      expect(n, `${id} ${label} is ${n} words, max ${bounds.max}`).toBeLessThanOrEqual(
        bounds.max,
      );
    };

    for (const block of ALL_BLOCKS) {
      switch (block.kind) {
        case 'stage_core': {
          const { overview, why, forward } = splitStageCore(block.body);
          check(
            block.id,
            'total',
            words(overview) + words(why) + words(forward),
            WORD_BOUNDS.stage_core,
          );
          break;
        }
        case 'domain_lens':
          check(block.id, 'body', words(block.body), WORD_BOUNDS.domain_lens_body);
          if (block.firstExperiment) {
            check(
              block.id,
              'experiment',
              words(block.firstExperiment),
              WORD_BOUNDS.domain_lens_experiment,
            );
          }
          break;
        case 'threat_response':
          check(block.id, 'body', words(block.body), WORD_BOUNDS.threat_response);
          break;
        case 'pace_note':
          for (const [sign, text] of Object.entries(block.framings)) {
            check(block.id, sign, words(text), WORD_BOUNDS.pace_note_framing);
          }
          break;
      }
    }
  });

  it('U-V-07 warns when a block has not been reviewed in twelve months', () => {
    const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
    const stale = ALL_BLOCKS.filter(
      (b) => new Date(b.meta.lastReviewed).getTime() < cutoff,
    );
    if (stale.length > 0) {
      console.warn(
        `[content] ${stale.length} block(s) not reviewed in 12 months:\n` +
          stale.map((b) => `  ${b.id} (${b.meta.lastReviewed})`).join('\n'),
      );
    }
    // A warning, not a failure - stale content is still correct content.
    expect(ALL_BLOCKS.every((b) => !Number.isNaN(Date.parse(b.meta.lastReviewed)))).toBe(
      true,
    );
  });

  it('U-V-08 names every domain lens still awaiting practitioner review', () => {
    const unverified = DOMAIN_LENSES.filter((b) => b.meta.domainVerified !== true);
    if (unverified.length > 0) {
      console.warn(
        `[content] ${unverified.length} domain lens(es) not yet verified by a ` +
          `practitioner in the domain:\n` +
          unverified.map((b) => `  ${b.id}`).join('\n'),
      );
    }
    expect(DOMAIN_LENSES.every((b) => 'domainVerified' in b.meta)).toBe(true);
  });

  it('U-V-09 contains no clinical vocabulary', () => {
    for (const block of ALL_BLOCKS) {
      for (const body of bodiesOf(block)) {
        const lower = body.toLowerCase();
        for (const term of BANNED) {
          expect(lower.includes(term), `${block.id} contains "${term}"`).toBe(false);
        }
      }
    }
  });

  it('U-V-10 offers no tool experiment at Loss or Doubt', () => {
    // The framework is explicit: do not offer solutions in Loss, do not argue
    // in Doubt. A first experiment at those stages must be reflective, which
    // is enforced here rather than left to an author's memory.
    for (const lens of DOMAIN_LENSES) {
      if (lens.stage === 'loss' || lens.stage === 'doubt') {
        expect(
          lens.firstExperiment,
          `${lens.id} must not carry a tool experiment at this stage`,
        ).toBeUndefined();
      }
    }
  });

  it('U-V-11 gives every authored lens an image of its own', () => {
    // A lens with no domain image falls back to the stage-level picture,
    // which is correct behaviour and the wrong content: the point of the
    // per-domain block is that the loss looks different in that field.
    for (const lens of DOMAIN_LENSES) {
      const brief = DOMAIN_IMAGE_BRIEFS[lens.stage]?.[lens.domain];
      expect(brief, `${lens.id} has no domain image brief`).toBeDefined();
      expect(brief!.alt.trim().length, lens.id).toBeGreaterThan(20);
      expect(brief!.prompt.trim().length, lens.id).toBeGreaterThan(80);
    }
  });

  it('U-V-12 resolves an image for every door at every stage', () => {
    // The forward door stays stage-level by design — the first move out of a
    // stage is the same move whoever you are — so the fallback has to hold.
    for (const stage of STAGE_IDS) {
      expect(briefFor(stage, 'why', null)).toBe(IMAGE_BRIEFS[stage].why);
      expect(briefFor(stage, 'forward', null)).toBe(IMAGE_BRIEFS[stage].forward);
      for (const domain of DOMAIN_IDS) {
        expect(briefFor(stage, 'forward', domain)).toBe(IMAGE_BRIEFS[stage].forward);
        expect(briefFor(stage, 'why', domain).alt.length, `${stage}/${domain}`).toBeGreaterThan(0);
      }
    }
  });

  it('U-V-13 asks for no text-bearing prop in any image', () => {
    // Generated writing is always subtly wrong, it dates the image, it cannot
    // be translated, and a screen reader gets nothing from it. The rule is
    // carried to the generator by PROMPT_RULES; this keeps the briefs from
    // asking for the thing the rules then have to forbid. Word-bounded on
    // purpose: "texture" and "illegible" are fine, "text" and "legible
    // writing" are not.
    const PROPS = [
      /\btexts?\b/i,
      /\bwriting\b/i,
      /\bhandwritt(en|ing)\b/i,
      /\blettering\b/i,
      /\bwords?\b/i,
      /\bnumerals?\b/i,
      /\blabels?(led|ed)?\b/i,
      /\bsignage\b/i,
      /\bcaptions?\b/i,
      /\bheadlines?\b/i,
      /\btitles?\b/i,
      /\bdocuments?\b/i,
      /\bsyllabus\b/i,
      /\bchecklists?\b/i,
      /\bspreadsheets?\b/i,
      /\bslides?\b/i,
      /\bindex cards?\b/i,
      /\bnote(s|book|pad)?\b/i,
      /\btally\b/i,
      /\bprint(ed|out|outs)\b/i,
      /\bmemos?\b/i,
      /\binvoices?\b/i,
      /\breceipts?\b/i,
      /\bcontracts?\b/i,
      /\blicen[cs]es?\b/i,
      /\bforms?\b/i,
      /\bquestionnaires?\b/i,
    ];

    const every = [
      ...Object.entries(IMAGE_BRIEFS).flatMap(([stage, doors]) =>
        Object.entries(doors).map(([door, b]) => [`${stage}/${door}`, b] as const),
      ),
      ...Object.entries(DOMAIN_IMAGE_BRIEFS).flatMap(([stage, byDomain]) =>
        Object.entries(byDomain!).map(([domain, b]) => [`${stage}/${domain}`, b] as const),
      ),
    ];

    expect(every).toHaveLength(42);

    for (const [id, brief] of every) {
      for (const field of [brief.alt, brief.prompt]) {
        for (const re of PROPS) {
          expect(re.test(field), `image brief ${id} asks for ${re}`).toBe(false);
        }
      }
    }

    // And the rule itself still reaches the generator.
    expect(PROMPT_RULES.toLowerCase()).toContain('no text');
  });

  it('U-V-14 puts a person in every image', () => {
    // An empty desk is a still life. The stage is something someone is doing,
    // or visibly not doing, so the frame needs them in it.
    const PEOPLE =
      /\b(person|people|man|men|woman|women|faculty|lecturers?|teachers?|students?|academics?|potters?|designers?|illustrators?|makers?|developers?|engineers?|advisers?|analysts?|lawyers?|chefs?|colleagues?|staff members?|apprentices?|tradespe(rson|ople)|managers?|clients?|juniors?|seniors?)\b/i;

    for (const [stage, doors] of Object.entries(IMAGE_BRIEFS)) {
      for (const [door, brief] of Object.entries(doors)) {
        expect(PEOPLE.test(brief.prompt), `${stage}/${door} has nobody in it`).toBe(true);
      }
    }
    for (const [stage, byDomain] of Object.entries(DOMAIN_IMAGE_BRIEFS)) {
      for (const [domain, brief] of Object.entries(byDomain!)) {
        expect(PEOPLE.test(brief.prompt), `${stage}/${domain} has nobody in it`).toBe(
          true,
        );
      }
    }
  });

  it('U-V-15 keeps camera vocabulary out of the briefs', () => {
    // The house style is a chalk drawing. Camera words are not neutral
    // description to a generator: they are an instruction to make a
    // photograph, and they beat the style reference. The first run lost
    // seven frames to exactly this, so it is a build rule rather than a
    // note. Where something should be indistinct, the brief says how it is
    // drawn instead — loose open outlines against a fully drawn figure.
    const CAMERA = [
      /\bout[- ]of[- ]focus\b/i,
      /\bdepth of field\b/i,
      /\bmotion blur\b/i,
      /\bblur(red|ry)?\b/i,
      /\blong[- ]exposure\b/i,
      /\bbokeh\b/i,
      /\bshot (from|low|wide|close)\b/i,
      /\btelephoto|wide[- ]angle|macro lens|lens\b/i,
      /\bphotograph(y|ic)?\b/i,
      /\bcandid\b/i,
      /\bf\/\d/i,
      /\b\d+mm\b/i,
      /\bISO \d/i,
    ];

    const every = [
      ...Object.values(IMAGE_BRIEFS).flatMap((doors) => Object.values(doors)),
      ...Object.values(DOMAIN_IMAGE_BRIEFS).flatMap((byDomain) =>
        Object.values(byDomain!),
      ),
    ];

    for (const brief of every) {
      for (const field of [brief.alt, brief.prompt]) {
        for (const re of CAMERA) {
          expect(re.test(field), `"${brief.alt}" uses camera language ${re}`).toBe(
            false,
          );
        }
      }
    }

    // The lead is what makes these drawings, and it has to lead: a style
    // reference loses to camera vocabulary later in the prompt. Both strings
    // are verbatim from the run that produced the shipped set, so this also
    // guards against someone tidying the wording.
    expect(PROMPT_LEAD).toMatch(/^Hand-drawn line art, chalk and ink on black paper\./);
    expect(PROMPT_LEAD.endsWith(' '), 'the lead concatenates, so it needs its space').toBe(
      true,
    );
    expect(PROMPT_RULES).toMatch(/bare unmarked surfaces/i);
  });

  it('counts 49 authored blocks', () => {
    // 6 stage cores + 30 lenses + 8 threat + 5 pace.
    expect(Object.keys(STAGE_CORES)).toHaveLength(6);
    expect(THREAT_RESPONSES).toHaveLength(8);
    expect(Object.keys(PACE_NOTES)).toHaveLength(5);
    expect(ALL_BLOCKS).toHaveLength(6 + DOMAIN_LENSES.length + 8 + 5);
  });

  it('addresses the reader in the second person', () => {
    for (const block of ALL_BLOCKS) {
      for (const body of bodiesOf(block)) {
        if (words(body) < 30) continue;
        expect(/\byou\b/i.test(body), `${block.id} never says "you"`).toBe(true);
      }
    }
  });

  it('avoids the minimising words', () => {
    const SOFT_BANNED = [/\bjust try\b/i, /\bsimply\b/i, /\bembrace\b/i, /\bjourney\b/i];
    for (const block of ALL_BLOCKS) {
      for (const body of bodiesOf(block)) {
        for (const re of SOFT_BANNED) {
          // "embrace change" appears inside a quoted criticism in the Loss
          // core, which is the one legitimate use.
          if (re.source.includes('embrace') && body.includes('"embrace change"')) continue;
          expect(re.test(body), `${block.id} matches ${re}`).toBe(false);
        }
      }
    }
  });
});
