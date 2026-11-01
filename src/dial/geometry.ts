import { STAGES } from '../domain/stages';
import { STAGE_IDS } from '../domain/types';
import type { Confidence, Stage } from '../domain/types';

/**
 * The coordinate space is near-square, because a dial is.
 *
 * This is the one number that inverts from the terrain: that graphic needed a
 * wide, short viewBox to match a full-width banner (VIEW_W / VIEW_H > 3), and
 * letterboxed away a third of its width when it did not. A dial needs the
 * opposite, so the banner becomes a centred block rather than a full-bleed
 * strip. The extra height below the ring is deliberate - it holds the field
 * annotation inside the opening, where there is no band.
 */
export const VIEW_W = 660;
export const VIEW_H = 520;

export const CX = 330;
export const CY = 258;

export const R_OUTER = 196;
export const R_INNER = 138;
/** Mid-band: where the station number sits. */
export const R_MID = (R_OUTER + R_INNER) / 2;
/** Just outside the ring: where the stage name sits. */
export const R_LABEL = 212;
/**
 * Inside the hole, in from the ring, in this order.
 *
 * The retreat sits highest, just inside the band edge, so it reads as running
 * between Discomfort and Doubt rather than floating in the middle; the markers
 * and the gap sweep sit below it, and the readout owns everything inside them.
 */
export const R_RETREAT = 130;
export const R_MARKER = 114;
export const R_GAP = 102;

/** Expansion of the invisible hit path beyond the drawn band, each side. */
const HIT_PAD = 16;

export interface Point {
  x: number;
  y: number;
}

/**
 * Angles are degrees clockwise from twelve o'clock, so 0 is straight up and
 * negative is anticlockwise.
 */
export const START_ANGLE = -128;
/** Blank angle between neighbouring bands. */
export const SECTOR_GAP = 3;

/**
 * Angular span per stage, in degrees.
 *
 * Span encodes the options available at that station, which is why Discomfort
 * is a sliver and Integration is the widest band: the Danger Zone is narrow
 * because the choices there really are fewest, and the far side widens because
 * flexibility is what comes back. Two stages before the narrow band and three
 * after it, so the climb reads as shorter than the descent.
 */
const SPANS: Record<Stage, number> = {
  loss: 44,
  doubt: 34,
  discomfort: 20,
  discovery: 46,
  understanding: 64,
  integration: 74,
};

export interface Sector {
  stage: Stage;
  position: number;
  /** Angular width in degrees. */
  span: number;
  /** Leading edge, clockwise. */
  a1: number;
  /** Trailing edge. */
  a2: number;
  /** Midpoint, which is the angle the station sits at. */
  center: number;
  /** The drawn band. */
  d: string;
  /** A wider invisible path, so the touch target clears 44px. */
  hit: string;
  label: Point;
  labelAnchor: 'start' | 'middle' | 'end';
  num: Point;
}

/**
 * One band per stage, built from SPANS. Nothing downstream hard-codes a path:
 * change a span here and the band, its label, its number, its hit area, the
 * markers and both arcs all follow.
 */
export const SECTORS: readonly Sector[] = buildSectors();

function buildSectors(): Sector[] {
  const out: Sector[] = [];
  let cursor = START_ANGLE;

  for (const stage of STAGE_IDS) {
    const span = SPANS[stage];
    const a1 = cursor;
    const a2 = cursor + span;
    const center = (a1 + a2) / 2;
    cursor = a2 + SECTOR_GAP;

    const sin = Math.sin(rad(center));
    const labelAnchor: Sector['labelAnchor'] =
      sin > 0.25 ? 'start' : sin < -0.25 ? 'end' : 'middle';
    const nudge = labelAnchor === 'start' ? 8 : labelAnchor === 'end' ? -8 : 0;
    const label = pointAt(R_LABEL, center);

    out.push({
      stage,
      position: STAGES[stage].position,
      span,
      a1,
      a2,
      center,
      d: bandPath(a1, a2),
      hit: bandPath(
        a1 - SECTOR_GAP / 2,
        a2 + SECTOR_GAP / 2,
        R_INNER - HIT_PAD,
        R_OUTER + HIT_PAD,
      ),
      label: { x: label.x + nudge, y: label.y },
      labelAnchor,
      num: pointAt(R_MID, center),
    });
  }
  return out;
}

/** Total drawn sweep, and the opening that makes this a dial and not a wheel. */
export const TOTAL_SWEEP = SECTORS[SECTORS.length - 1].a2 - SECTORS[0].a1;
export const OPENING = 360 - TOTAL_SWEEP;

export function sectorFor(stage: Stage): Sector {
  const s = SECTORS.find((sec) => sec.stage === stage);
  if (!s) throw new Error(`No sector for stage ${stage}`);
  return s;
}

export function pointAt(r: number, deg: number): Point {
  return { x: CX + r * Math.sin(rad(deg)), y: CY - r * Math.cos(rad(deg)) };
}

/**
 * The angle of a fractional station position, interpolated between band
 * centres and clamped to [1, 6]. Positions outside the range are not
 * meaningful, and a marker beyond either end would sit in the opening.
 */
export function angleAtPosition(position: number): number {
  const p = clamp(position, 1, 6);
  const low = Math.floor(p);
  const high = Math.ceil(p);
  const a = SECTORS[low - 1].center;
  const b = SECTORS[high - 1].center;
  return a + (b - a) * (p - low);
}

/** An annulus sector: the drawn band, or any wedge over it. */
export function bandPath(
  a1: number,
  a2: number,
  rInner: number = R_INNER,
  rOuter: number = R_OUTER,
): string {
  const o1 = pointAt(rOuter, a1);
  const o2 = pointAt(rOuter, a2);
  const i2 = pointAt(rInner, a2);
  const i1 = pointAt(rInner, a1);
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
  return (
    `M ${xy(o1)} A ${rOuter} ${rOuter} 0 ${large} 1 ${xy(o2)} ` +
    `L ${xy(i2)} A ${rInner} ${rInner} 0 ${large} 0 ${xy(i1)} Z`
  );
}

/** A single arc, used for the gap sweep and the retreat. */
export function arcPath(r: number, a1: number, a2: number): string {
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
  const sweep = a2 > a1 ? 1 : 0;
  return `M ${xy(pointAt(r, a1))} A ${r} ${r} 0 ${large} ${sweep} ${xy(pointAt(r, a2))}`;
}

/**
 * Discomfort back to Doubt, and nowhere else.
 *
 * Drawn anticlockwise inside the ring so it reads as a route off the path
 * rather than as part of it. The claim it carries - that most people cycle
 * between Doubt and Discomfort several times before moving on - is central to
 * the framework, and v1's closed wheel had no way to show it.
 */
export const RETREAT_D = arcPath(R_RETREAT, angleAtPosition(3), angleAtPosition(2));

/** The Grief Gap: the sweep from where you are to where your field is. */
export function gapArcD(userPosition: number, fieldPosition: number): string {
  return arcPath(R_GAP, angleAtPosition(userPosition), angleAtPosition(fieldPosition));
}

/** Uncertainty half-width in stations. */
export const UNCERTAINTY_HALF_WIDTH = {
  high: 0.15,
  moderate: 0.35,
  low: 0.6,
} as const;

/**
 * Uncertainty as angular extent over the ring.
 *
 * The terrain drew this horizontally because its axis was horizontal; here the
 * axis is the sweep, so a less confident reading is a wider wedge. `toward`
 * biases the wedge the way a named transition points, which is how "in Doubt,
 * with some signs of Discomfort" gets drawn.
 */
export function uncertaintyD(
  position: number,
  confidence: Confidence,
  toward: number | null = null,
): string {
  const half = UNCERTAINTY_HALF_WIDTH[confidence];
  const bias = toward === null ? 0 : Math.sign(toward - position) * half * 0.25;
  const lo = clamp(position + bias - half, 1, 6);
  const hi = clamp(position + bias + half, 1, 6);
  return bandPath(angleAtPosition(lo), angleAtPosition(hi), R_INNER - 14, R_OUTER + 14);
}

/**
 * Plain-language description of the whole dial, generated from state so it
 * always says where the user is. Feeds the SVG's aria-describedby.
 */
export function dialDescription(
  stage: Stage | null,
  gapSentenceShort: string | null,
  /** False when the named stage is one the reader is browsing, not their own. */
  isYou = true,
): string {
  const base =
    'Six stages around an open dial, read clockwise. It begins at Loss at the ' +
    'lower left, climbs through Doubt to a narrow band at Discomfort, then ' +
    'widens through Discovery and Understanding to Integration at the lower ' +
    'right. Each band is as wide as the options available there. The dial does ' +
    'not close, and the one route backward runs from Discomfort to Doubt.';

  if (!stage) {
    return `${base} No stage is currently marked.`;
  }

  const d = STAGES[stage];
  const where = isYou
    ? ` You are at ${d.name}, stage ${d.position} of 6.`
    : ` Showing ${d.name}, stage ${d.position} of 6.`;
  return base + where + (isYou && gapSentenceShort ? ` ${gapSentenceShort}` : '');
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function xy(p: Point): string {
  return `${fmt(p.x)} ${fmt(p.y)}`;
}

function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}
