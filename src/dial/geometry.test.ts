import { describe, expect, it } from 'vitest';
import {
  CX,
  CY,
  OPENING,
  RETREAT_D,
  R_INNER,
  R_OUTER,
  R_RETREAT,
  SECTORS,
  SECTOR_GAP,
  TOTAL_SWEEP,
  UNCERTAINTY_HALF_WIDTH,
  VIEW_H,
  VIEW_W,
  angleAtPosition,
  bandPath,
  gapArcD,
  pointAt,
  sectorFor,
  uncertaintyD,
} from './geometry';
import { STAGE_IDS } from '../domain/types';

/** Arc length in viewBox units of `span` degrees at radius `r`. */
function arcLen(span: number, r: number): number {
  return (Math.abs(span) * Math.PI * r) / 180;
}

describe('dial geometry', () => {
  it('U-D-01 has one band per stage, in path order', () => {
    expect(SECTORS.map((s) => s.stage)).toEqual([...STAGE_IDS]);
    expect(SECTORS.map((s) => s.position)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('U-D-02 lays the bands out clockwise without overlapping', () => {
    for (const s of SECTORS) {
      expect(s.a2).toBeGreaterThan(s.a1);
      expect(s.center).toBeCloseTo((s.a1 + s.a2) / 2, 6);
    }
    for (let i = 1; i < SECTORS.length; i++) {
      expect(SECTORS[i].a1 - SECTORS[i - 1].a2).toBeCloseTo(SECTOR_GAP, 6);
    }
  });

  it('U-D-03 does not close the ring, which is the whole point of a dial', () => {
    // v1's wheel asserted endless cycling by closing. The path has a start and
    // an end, so the geometry has to leave the opening between them.
    expect(TOTAL_SWEEP).toBeLessThan(360);
    expect(OPENING).toBeGreaterThan(40);
  });

  it('U-D-03b puts the opening at the bottom, under the ends of the path', () => {
    // Loss starts at the lower left and Integration ends at the lower right,
    // so the blank wedge is centred near six o'clock.
    const openingMid = SECTORS[5].a2 + OPENING / 2;
    expect(Math.abs(openingMid - 180)).toBeLessThan(40);
  });

  it('U-D-04 narrows to the Danger Zone and widens after it', () => {
    const spans = SECTORS.map((s) => s.span);
    expect(spans[0]).toBeGreaterThan(spans[1]);
    expect(spans[1]).toBeGreaterThan(spans[2]);
    expect(spans[2]).toBe(Math.min(...spans));
    expect(sectorFor('discomfort').span).toBe(Math.min(...spans));
    expect(spans[3]).toBeGreaterThan(spans[2]);
    expect(spans[4]).toBeGreaterThan(spans[3]);
    expect(spans[5]).toBeGreaterThan(spans[4]);
    expect(spans[5]).toBe(Math.max(...spans));
  });

  it('U-D-04b spends fewer degrees on the climb than on the descent', () => {
    const climb = SECTORS[0].span + SECTORS[1].span + SECTORS[2].span / 2;
    const descent = SECTORS[2].span / 2 + SECTORS[3].span + SECTORS[4].span + SECTORS[5].span;
    expect(climb).toBeLessThan(descent);
  });

  it('U-D-05 returns the band centre at integer positions', () => {
    for (const s of SECTORS) {
      expect(angleAtPosition(s.position)).toBeCloseTo(s.center, 6);
    }
  });

  it('U-D-05b places a fractional position between its two bands', () => {
    const a = angleAtPosition(3.5);
    expect(a).toBeGreaterThan(SECTORS[2].center);
    expect(a).toBeLessThan(SECTORS[3].center);
    expect(a).toBeCloseTo((SECTORS[2].center + SECTORS[3].center) / 2, 6);
  });

  it('U-D-05c runs monotonically clockwise and clamps outside the range', () => {
    let prev = angleAtPosition(1);
    for (let p = 1.1; p <= 6; p += 0.1) {
      const a = angleAtPosition(p);
      expect(a).toBeGreaterThan(prev - 1e-9);
      prev = a;
    }
    expect(angleAtPosition(0)).toBe(angleAtPosition(1));
    expect(angleAtPosition(-10)).toBe(angleAtPosition(1));
    expect(angleAtPosition(7)).toBe(angleAtPosition(6));
    expect(angleAtPosition(99)).toBe(angleAtPosition(6));
  });

  it('U-D-06 measures angles clockwise from twelve o-clock', () => {
    const up = pointAt(100, 0);
    expect(up.x).toBeCloseTo(CX, 6);
    expect(up.y).toBeCloseTo(CY - 100, 6);

    const right = pointAt(100, 90);
    expect(right.x).toBeCloseTo(CX + 100, 6);
    expect(right.y).toBeCloseTo(CY, 6);

    for (const deg of [-128, -39, 0, 35, 169]) {
      const p = pointAt(R_OUTER, deg);
      expect(Math.hypot(p.x - CX, p.y - CY)).toBeCloseTo(R_OUTER, 6);
    }
  });

  it('U-D-07 derives the paths rather than hard-coding them', () => {
    for (const s of SECTORS) {
      const start = pointAt(R_OUTER, s.a1);
      const rounded = `${Math.round(start.x * 100) / 100} ${Math.round(start.y * 100) / 100}`;
      expect(s.d).toContain(rounded);
      expect(s.d.startsWith('M ')).toBe(true);
      expect(s.d.endsWith('Z')).toBe(true);
    }
    expect(bandPath(0, 10)).toContain(`A ${R_OUTER} ${R_OUTER}`);
    expect(bandPath(0, 10)).toContain(`A ${R_INNER} ${R_INNER}`);
  });

  it('U-D-08 widens the uncertainty wedge as confidence drops', () => {
    expect(UNCERTAINTY_HALF_WIDTH.high).toBeLessThan(UNCERTAINTY_HALF_WIDTH.moderate);
    expect(UNCERTAINTY_HALF_WIDTH.moderate).toBeLessThan(UNCERTAINTY_HALF_WIDTH.low);

    const high = uncertaintyD(3, 'high');
    const low = uncertaintyD(3, 'low');
    expect(high).not.toEqual(low);
    // A wedge is an annulus sector either way, so compare the angular span the
    // half-widths produce rather than the path strings.
    const spanFor = (c: 'high' | 'low') =>
      angleAtPosition(3 + UNCERTAINTY_HALF_WIDTH[c]) -
      angleAtPosition(3 - UNCERTAINTY_HALF_WIDTH[c]);
    expect(spanFor('low')).toBeGreaterThan(spanFor('high'));
  });

  it('U-D-08b biases the wedge toward a named transition', () => {
    const plain = uncertaintyD(2, 'moderate');
    const toward = uncertaintyD(2, 'moderate', 3);
    const away = uncertaintyD(2, 'moderate', 1);
    expect(toward).not.toEqual(plain);
    expect(away).not.toEqual(plain);
    expect(toward).not.toEqual(away);
  });

  it('U-D-09 runs the retreat backward, from Discomfort to Doubt', () => {
    // Sweep flag 0 is anticlockwise, which is the only direction the framework
    // describes travelling backward.
    expect(RETREAT_D).toContain(' 0 0 ');
    const from = pointAt(R_RETREAT, angleAtPosition(3));
    const to = pointAt(R_RETREAT, angleAtPosition(2));
    expect(RETREAT_D).toContain(`${Math.round(from.x * 100) / 100}`);
    expect(to.x).toBeLessThan(from.x);
  });

  it('U-D-10 sweeps the gap forward for a field ahead and back for one behind', () => {
    expect(gapArcD(2, 4.2)).toContain(' 0 1 ');
    expect(gapArcD(5, 3.1)).toContain(' 0 0 ');
  });

  it('U-D-11 keeps the whole dial and every label inside the viewBox', () => {
    expect(CX + R_OUTER).toBeLessThan(VIEW_W);
    expect(CX - R_OUTER).toBeGreaterThan(0);
    expect(CY + R_OUTER).toBeLessThan(VIEW_H);
    expect(CY - R_OUTER).toBeGreaterThan(0);

    for (const s of SECTORS) {
      expect(s.label.x).toBeGreaterThan(0);
      expect(s.label.x).toBeLessThan(VIEW_W);
      expect(s.label.y).toBeGreaterThan(0);
      expect(s.label.y).toBeLessThan(VIEW_H);
    }
  });

  it('U-D-12 gives every band a hit area of at least 44 units in both directions', () => {
    // Discomfort is the narrowest band by design, so it sets the floor. The
    // drawn sliver is thinner than this: the hit path is padded past the ring.
    const radial = R_OUTER - R_INNER + 32;
    expect(radial).toBeGreaterThanOrEqual(44);
    for (const s of SECTORS) {
      expect(arcLen(s.span + SECTOR_GAP, R_INNER - 16)).toBeGreaterThanOrEqual(44);
    }
  });

  it('keeps the viewBox near-square, which a dial needs and a banner did not', () => {
    const aspect = VIEW_W / VIEW_H;
    expect(aspect).toBeGreaterThan(0.9);
    expect(aspect).toBeLessThan(1.6);
  });
});
