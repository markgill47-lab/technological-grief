import type { Domain, RogersPosition, ThreatId } from './types';

/**
 * The five domains, cut by what AI displaces in the work rather than by
 * industry or collar. See specs/grief-framework-context.md section 6.
 *
 * There is deliberately no `general` option. v1 had one, and a residual
 * bucket can only ever produce residual content.
 */
export const DOMAINS: Record<
  Domain,
  { id: Domain; name: string; short: string; displaces: string; identity: string }
> = {
  teaching: {
    id: 'teaching',
    name: 'Teaching & Assessment',
    short: 'teaching',
    displaces: 'The proxy relationship between student output and student learning',
    identity: 'Gatekeeper; singular authority',
  },
  craft: {
    id: 'craft',
    name: 'Craft & Composition',
    short: 'craft',
    displaces: 'Execution skill as the professional moat',
    identity: 'Maker whose hand is visible in the work',
  },
  analysis: {
    id: 'analysis',
    name: 'Analysis & Advisory',
    short: 'advisory work',
    displaces: 'Synthesis of documents, precedent, and literature',
    identity: "The expert who has read what you haven't",
  },
  building: {
    id: 'building',
    name: 'Building & Systems',
    short: 'engineering',
    displaces: 'Implementation fluency; knowing the syntax',
    identity: 'The person who can make the machine do it',
  },
  coordination: {
    id: 'coordination',
    name: 'Coordination & Care',
    short: 'coordination work',
    displaces: 'Documentation load, scheduling, correspondence',
    identity: 'The person who holds things together',
  },
};

/**
 * Where each field now sits on the 1-6 station scale.
 *
 * OPEN ITEM. These are editorial judgments about five professional fields,
 * not measurements, and they drive the second marker on the terrain. See
 * specs/grief-framework-context.md section 5.3 for the reasoning behind each
 * and the review cadence.
 *
 * Last review: 2026-10-31 (initial). Review every six months.
 */
export const FIELD_POSITION: Record<Domain, number> = {
  building: 5.0,
  craft: 4.2,
  analysis: 3.8,
  teaching: 3.1,
  coordination: 2.4,
};

/**
 * The seven threats - what specific loss is being grieved. Carries the
 * emotional register, independent of both stage and domain.
 */
export const THREATS: Record<ThreatId, { id: ThreatId; name: string; loss: string }> = {
  skills_obsolescence: {
    id: 'skills_obsolescence',
    name: 'Skills obsolescence',
    loss: 'Years of accumulated capability, now widely available',
  },
  identity_authority: {
    id: 'identity_authority',
    name: 'Identity & authority',
    loss: 'Standing as the one who knows',
  },
  verification: {
    id: 'verification',
    name: 'Verification collapse',
    loss: "The ability to know what's real, learned, or genuinely theirs",
  },
  authenticity_quality: {
    id: 'authenticity_quality',
    name: 'Authenticity & quality',
    loss: 'Work that means something; craft that shows',
  },
  economic: {
    id: 'economic',
    name: 'Economic security',
    loss: 'Livelihood, role, career path',
  },
  ethical: {
    id: 'ethical',
    name: 'Ethical objection',
    loss: 'Participation without complicity',
  },
  control_opacity: {
    id: 'control_opacity',
    name: 'Control & opacity',
    loss: "Understanding the tools you're accountable for",
  },
};

/**
 * Redundancy pairs. Never render both - keep the primary.
 * See specs/content-architecture.md section 4.3.
 */
export const REDUNDANT_THREAT_PAIRS: readonly (readonly [ThreatId, ThreatId])[] = [
  ['skills_obsolescence', 'identity_authority'],
  ['verification', 'control_opacity'],
  ['authenticity_quality', 'ethical'],
];

export function threatsAreRedundant(a: ThreatId, b: ThreatId): boolean {
  return REDUNDANT_THREAT_PAIRS.some(
    ([x, y]) => (a === x && b === y) || (a === y && b === x),
  );
}

export const ROGERS: Record<
  RogersPosition,
  { id: RogersPosition; name: string; share: string }
> = {
  innovator: { id: 'innovator', name: 'Innovator', share: '2.5%' },
  early_adopter: { id: 'early_adopter', name: 'Early adopter', share: '13.5%' },
  early_majority: { id: 'early_majority', name: 'Early majority', share: '34%' },
  late_majority: { id: 'late_majority', name: 'Late majority', share: '34%' },
  laggard: { id: 'laggard', name: 'Laggard', share: '16%' },
};
