import { STAGE_ORDER, STAGES } from '../domain/stages';
import type { Stage } from '../domain/types';

export const VIEW_W = 1000;
/**
 * The viewBox aspect has to match the banner's actual shape. At 1000x420
 * against a 300px-tall banner, `preserveAspectRatio: meet` scaled to the
 * height and letterboxed away a third of the width. The terrain is meant to
 * be wide and short, so the coordinate space is too.
 */
export const VIEW_H = 310;
export const GROUND_FLOOR = VIEW_H;

export interface Point {
  x: number;
  y: number;
}

export interface Station extends Point {
  stage: Stage;
  position: number;
  /** Trail width at this station. Encodes available options. */
  width: number;
  /** Where the label sits relative to the ridge. */
  anchor: 'above' | 'below';
}

/**
 * A mountain pass.
 *
 * The path climbs from Loss through Doubt to a narrow saddle at Discomfort,
 * then descends on the far side into a widening valley. Two deliberate
 * asymmetries:
 *
 *  - X-spacing tightens on the climb (145, 135) and widens on the descent
 *    (175, 195, 190). This renders the framework's "compressed grief cycles"
 *    claim - early stages arrive faster than they can be processed.
 *
 *  - Trail width is narrowest at Discomfort (8 against 26 at Loss and 48 at
 *    Integration). Width encodes available options, so the pinch at the
 *    saddle IS the paralysis.
 *
 * Nothing downstream hard-codes a path string. Move a station here and the
 * ridge, band, markers, and ground all follow.
 */
export const STATIONS: readonly Station[] = [
  { stage: 'loss', position: 1, x: 90, y: 216, width: 26, anchor: 'below' },
  { stage: 'doubt', position: 2, x: 235, y: 148, width: 18, anchor: 'below' },
  { stage: 'discomfort', position: 3, x: 370, y: 55, width: 8, anchor: 'above' },
  { stage: 'discovery', position: 4, x: 545, y: 143, width: 20, anchor: 'below' },
  { stage: 'understanding', position: 5, x: 740, y: 206, width: 34, anchor: 'below' },
  { stage: 'integration', position: 6, x: 930, y: 231, width: 48, anchor: 'below' },
];

export function stationFor(stage: Stage): Station {
  const s = STATIONS.find((st) => st.stage === stage);
  if (!s) throw new Error(`No station for stage ${stage}`);
  return s;
}

/**
 * Virtual endpoints extend the terrain to the viewport edges so the ground
 * fill spans full width. They continue the slope at each end and carry no
 * station. Curve point index N corresponds to station position N.
 */
const EDGE_LEFT: Point = { x: 0, y: 255 };
const EDGE_RIGHT: Point = { x: VIEW_W, y: 239 };

const CURVE_POINTS: readonly Point[] = [
  EDGE_LEFT,
  ...STATIONS.map(({ x, y }) => ({ x, y })),
  EDGE_RIGHT,
];

/**
 * Lower tension keeps the curve tighter to the station polyline, which is
 * what makes Discomfort read as a narrow saddle rather than a rounded hill.
 * At 0.5 the summit broadens enough that the shape stops making the point.
 */
const TENSION = 0.32;

interface Segment {
  p0: Point;
  c1: Point;
  c2: Point;
  p1: Point;
}

/**
 * Catmull-Rom through the control points, converted to cubic Beziers.
 *
 * Segment index j runs from CURVE_POINTS[j] to CURVE_POINTS[j+1], so
 * segments 1..5 are exactly the station-to-station spans and the Bezier
 * parameter t within segment j maps linearly to position j + t. That makes
 * `pointAtPosition` exact arithmetic rather than a path search - which also
 * means the geometry is unit-testable, since jsdom implements no SVG layout
 * and `getPointAtLength` is unavailable there.
 */
const SEGMENTS: readonly Segment[] = buildSegments(CURVE_POINTS, TENSION);

function buildSegments(pts: readonly Point[], tension: number): Segment[] {
  const out: Segment[] = [];
  const k = tension / 3;

  for (let j = 0; j < pts.length - 1; j++) {
    const p0 = pts[j];
    const p1 = pts[j + 1];
    const prev = pts[j - 1] ?? p0;
    const next = pts[j + 2] ?? p1;

    out.push({
      p0,
      c1: { x: p0.x + (p1.x - prev.x) * k, y: p0.y + (p1.y - prev.y) * k },
      c2: { x: p1.x - (next.x - p0.x) * k, y: p1.y - (next.y - p0.y) * k },
      p1,
    });
  }
  return out;
}

function bezierPoint(s: Segment, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * s.p0.x + b * s.c1.x + c * s.c2.x + d * s.p1.x,
    y: a * s.p0.y + b * s.c1.y + c * s.c2.y + d * s.p1.y,
  };
}

function bezierTangent(s: Segment, t: number): Point {
  const u = 1 - t;
  const a = 3 * u * u;
  const b = 6 * u * t;
  const c = 3 * t * t;
  return {
    x: a * (s.c1.x - s.p0.x) + b * (s.c2.x - s.c1.x) + c * (s.p1.x - s.c2.x),
    y: a * (s.c1.y - s.p0.y) + b * (s.c2.y - s.c1.y) + c * (s.p1.y - s.c2.y),
  };
}

/** The full ridge, edge to edge. */
export const RIDGE_D: string = (() => {
  const head = `M ${fmt(CURVE_POINTS[0].x)} ${fmt(CURVE_POINTS[0].y)}`;
  const rest = SEGMENTS.map(
    (s) =>
      `C ${fmt(s.c1.x)} ${fmt(s.c1.y)}, ${fmt(s.c2.x)} ${fmt(s.c2.y)}, ` +
      `${fmt(s.p1.x)} ${fmt(s.p1.y)}`,
  ).join(' ');
  return `${head} ${rest}`;
})();

/** Ridge closed down to the floor, for the ground fill. */
export const GROUND_D = `${RIDGE_D} L ${VIEW_W} ${GROUND_FLOOR} L 0 ${GROUND_FLOOR} Z`;

/**
 * A point on the ridge at a fractional station position.
 * Clamped to [1, 6] - positions outside the station range are not meaningful.
 */
export function pointAtPosition(position: number): Point {
  const p = clamp(position, 1, 6);
  let j = Math.floor(p);
  let t = p - j;
  if (j === 6) {
    j = 5;
    t = 1;
  }
  return bezierPoint(SEGMENTS[j], t);
}

export function tangentAtPosition(position: number): Point {
  const p = clamp(position, 1, 6);
  let j = Math.floor(p);
  let t = p - j;
  if (j === 6) {
    j = 5;
    t = 1;
  }
  return bezierTangent(SEGMENTS[j], t);
}

/** Linear interpolation of trail width between stations. */
export function widthAtPosition(position: number): number {
  const p = clamp(position, 1, 6);
  const j = Math.floor(p);
  if (j >= 6) return STATIONS[5].width;
  const t = p - j;
  const a = STATIONS[j - 1].width;
  const b = STATIONS[j].width;
  return a + (b - a) * t;
}

const BAND_SAMPLES = 160;

/**
 * The trail band as a filled shape. SVG has no variable-width stroke, so the
 * ridge is offset perpendicular by +/- width/2 and the two offset curves are
 * closed into one path.
 */
export const TRAIL_BAND_D: string = (() => {
  const top: Point[] = [];
  const bottom: Point[] = [];

  for (let i = 0; i <= BAND_SAMPLES; i++) {
    const position = 1 + (5 * i) / BAND_SAMPLES;
    const p = pointAtPosition(position);
    const tan = tangentAtPosition(position);
    const len = Math.hypot(tan.x, tan.y) || 1;
    // Normal pointing "up" (negative y) for a left-to-right tangent.
    const nx = tan.y / len;
    const ny = -tan.x / len;
    const h = widthAtPosition(position) / 2;

    top.push({ x: p.x + nx * h, y: p.y + ny * h });
    bottom.push({ x: p.x - nx * h, y: p.y - ny * h });
  }

  const fwd = top.map((p, i) => `${i === 0 ? 'M' : 'L'} ${fmt(p.x)} ${fmt(p.y)}`);
  const back = bottom
    .slice()
    .reverse()
    .map((p) => `L ${fmt(p.x)} ${fmt(p.y)}`);

  return [...fwd, ...back, 'Z'].join(' ');
})();

/**
 * Discomfort back to Doubt.
 *
 * Drawn as an arc through the sky rather than a line down the near face.
 * In a cross-section the near face IS the ridge, so a second path inside the
 * hill would read as a tunnel. An arc above the surface reads as what it is:
 * a direction of travel, available from the summit.
 *
 * The only element here that exists purely to make a theoretical claim
 * visible, and it earns its place: "most people cycle between Doubt and
 * Discomfort several times before moving forward" is central to the
 * framework, and v1's wheel had no way to show it.
 */
export const REGRESSION_D = 'M 342 50 C 316 20, 258 32, 232 136';

/** Horizontal line connecting the two markers, for the gap span. */
export const GAP_SPAN_Y = 280;

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}

/** Uncertainty half-width in stations. */
export const UNCERTAINTY_HALF_WIDTH = {
  high: 0.15,
  moderate: 0.35,
  low: 0.6,
} as const;

/**
 * Plain-language description of the whole path, generated from state so it
 * always says where the user is. Feeds the SVG's aria-describedby.
 */
export function terrainDescription(
  stage: Stage | null,
  gapSentenceShort: string | null,
): string {
  const base =
    'Six stages along a path. It climbs from Loss through Doubt to a narrow ' +
    'summit at Discomfort, where the path forks — forward and down into ' +
    'Discovery, or back down to Doubt. Beyond the summit it widens through ' +
    'Understanding to Integration.';

  if (!stage) {
    return `${base} No stage is currently marked.`;
  }

  const d = STAGES[stage];
  const where = ` You are at ${d.name}, stage ${d.position} of 6.`;
  return base + where + (gapSentenceShort ? ` ${gapSentenceShort}` : '');
}

export { STAGE_ORDER };
