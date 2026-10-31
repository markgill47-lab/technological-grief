import { POSITION } from './stages';
import { DOMAINS, FIELD_POSITION } from './taxonomies';
import type { Domain, Stage } from './types';

export type GapSign = 'fieldAhead' | 'aligned' | 'userAhead';

/**
 * The Grief Gap: signed distance between where someone sits and where their
 * field sits. See specs/grief-framework-context.md section 5.
 *
 * Always computed here, never taken from a model response - it is a pure
 * function of two values the application owns, and letting it drift would
 * corrupt the one number the visualization depends on.
 */
export function computeGap(stage: Stage, domain: Domain): number {
  return round1(FIELD_POSITION[domain] - POSITION[stage]);
}

export function gapSign(gap: number): GapSign {
  if (gap > 0.5) return 'fieldAhead';
  if (gap < -0.5) return 'userAhead';
  return 'aligned';
}

/**
 * The sign changes the meaning entirely. A negative gap is isolation, not a
 * smaller amount of grief - v1 treated the gap as a magnitude only and had
 * no representation for someone ahead of their field.
 */
export function gapSentence(gap: number, domain: Domain): string {
  const field = DOMAINS[domain].name;
  const mag = Math.abs(gap);
  const rounded = formatStations(mag);

  switch (gapSign(gap)) {
    case 'aligned':
      return `Your field is standing in roughly the same place you are. ${field} sits at about the same point on this path, which means what you are feeling is structural rather than personal.`;
    case 'fieldAhead':
      return mag >= 2
        ? `Your field has moved ${rounded} ahead of you. That distance is the main source of the pressure, and it is largely structural: people who arrive later face a harder adjustment because the expectations have already reset.`
        : `Your field is ${rounded} ahead of you — ordinary adaptive pressure, and a manageable distance.`;
    case 'userAhead':
      return `You are ${rounded} ahead of your field. That is isolation rather than grief, and it needs something different: people outside your own organization to compare notes with.`;
  }
}

export function gapLabel(gap: number): string {
  const mag = formatStations(Math.abs(gap));
  if (gapSign(gap) === 'userAhead') return `you are ${mag} ahead of your field`;
  if (gapSign(gap) === 'fieldAhead') return `your field is ${mag} ahead`;
  return 'you and your field are level';
}

function formatStations(mag: number): string {
  const n = Math.round(mag * 10) / 10;
  const unit = n === 1 ? 'stage' : 'stages';
  return `${n} ${unit}`;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
