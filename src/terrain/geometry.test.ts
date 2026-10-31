import { describe, expect, it } from 'vitest';
import {
  GROUND_FLOOR,
  RIDGE_D,
  STATIONS,
  TRAIL_BAND_D,
  UNCERTAINTY_HALF_WIDTH,
  VIEW_H,
  VIEW_W,
  pointAtPosition,
  widthAtPosition,
} from './geometry';
import { STAGE_IDS } from '../domain/types';

describe('terrain geometry', () => {
  it('U-T-01 returns exact station coordinates at integer positions', () => {
    for (const st of STATIONS) {
      const p = pointAtPosition(st.position);
      expect(p.x).toBeCloseTo(st.x, 6);
      expect(p.y).toBeCloseTo(st.y, 6);
    }
  });

  it('U-T-02 places a fractional position between its two stations', () => {
    const p = pointAtPosition(3.5);
    const a = STATIONS[2];
    const b = STATIONS[3];
    expect(p.x).toBeGreaterThan(a.x);
    expect(p.x).toBeLessThan(b.x);
    // The curve bows above the straight line between the saddle and
    // Discovery, so y must be at or above (numerically below) the chord.
    const chordY = a.y + ((b.y - a.y) * (p.x - a.x)) / (b.x - a.x);
    expect(p.y).toBeLessThanOrEqual(chordY + 1);
  });

  it('U-T-03 clamps positions outside the station range', () => {
    expect(pointAtPosition(0)).toEqual(pointAtPosition(1));
    expect(pointAtPosition(-10)).toEqual(pointAtPosition(1));
    expect(pointAtPosition(7)).toEqual(pointAtPosition(6));
    expect(pointAtPosition(99)).toEqual(pointAtPosition(6));
  });

  it('U-T-04 generates a ridge that passes through every station', () => {
    for (const st of STATIONS) {
      const p = pointAtPosition(st.position);
      expect(Math.hypot(p.x - st.x, p.y - st.y)).toBeLessThan(1);
    }
  });

  it('U-T-05 narrows to the saddle and widens after it', () => {
    const widths = STATIONS.map((s) => s.width);
    expect(widths[0]).toBeGreaterThan(widths[1]);
    expect(widths[1]).toBeGreaterThan(widths[2]);
    expect(widths[2]).toBe(Math.min(...widths));
    expect(widths[3]).toBeGreaterThan(widths[2]);
    expect(widths[4]).toBeGreaterThan(widths[3]);
    expect(widths[5]).toBeGreaterThan(widths[4]);
    expect(widths[5]).toBe(Math.max(...widths));
  });

  it('U-T-05b interpolates width monotonically between stations', () => {
    for (let p = 1; p < 3; p += 0.1) {
      expect(widthAtPosition(p)).toBeGreaterThanOrEqual(widthAtPosition(p + 0.1) - 1e-9);
    }
    for (let p = 3; p < 6; p += 0.1) {
      expect(widthAtPosition(p)).toBeLessThanOrEqual(widthAtPosition(p + 0.1) + 1e-9);
    }
  });

  it('U-T-06 derives the paths rather than hard-coding them', () => {
    // Every station coordinate must appear in the generated ridge, which can
    // only happen if the path was built from the station table.
    for (const st of STATIONS) {
      expect(RIDGE_D).toContain(`${st.x} ${st.y}`);
    }
    // The ridge must span edge to edge, or the ground fill leaves a gap.
    expect(RIDGE_D.startsWith('M 0 ')).toBe(true);
    expect(RIDGE_D).toMatch(new RegExp(`${VIEW_W} [\\d.]+$`));
    expect(TRAIL_BAND_D.endsWith('Z')).toBe(true);
    expect(TRAIL_BAND_D.length).toBeGreaterThan(1000);
  });

  it('U-T-07 widens the uncertainty band as confidence drops', () => {
    expect(UNCERTAINTY_HALF_WIDTH.high).toBeLessThan(UNCERTAINTY_HALF_WIDTH.moderate);
    expect(UNCERTAINTY_HALF_WIDTH.moderate).toBeLessThan(UNCERTAINTY_HALF_WIDTH.low);
  });

  it('has one station per stage, in path order', () => {
    expect(STATIONS.map((s) => s.stage)).toEqual([...STAGE_IDS]);
    expect(STATIONS.map((s) => s.position)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('keeps the viewBox wide and short enough for the banner', () => {
    // At 1000x420 against a 300px-tall banner the SVG letterboxed away a
    // third of its width. The aspect has to stay near the banner's own.
    expect(VIEW_W / VIEW_H).toBeGreaterThan(3);
  });

  it('keeps every station and the gap span inside the viewBox', () => {
    for (const st of STATIONS) {
      expect(st.y).toBeGreaterThan(0);
      expect(st.y + 30).toBeLessThan(GROUND_FLOOR);
      expect(st.x).toBeGreaterThan(0);
      expect(st.x).toBeLessThan(VIEW_W);
    }
  });

  it('puts the saddle at the highest point', () => {
    const minY = Math.min(...STATIONS.map((s) => s.y));
    expect(STATIONS.find((s) => s.y === minY)!.stage).toBe('discomfort');
  });

  it('makes both exits from the saddle downhill, which is why people cycle', () => {
    const [, doubt, discomfort, discovery] = STATIONS;
    expect(doubt.y).toBeGreaterThan(discomfort.y);
    expect(discovery.y).toBeGreaterThan(discomfort.y);
  });

  it('tightens x-spacing on the climb and widens it on the descent', () => {
    const gaps = STATIONS.slice(1).map((s, i) => s.x - STATIONS[i].x);
    expect(gaps[0]).toBeGreaterThan(gaps[1]); // 145 > 135, climb compresses
    expect(gaps[2]).toBeGreaterThan(gaps[1]); // descent opens out
    expect(gaps[3]).toBeGreaterThan(gaps[2]);
  });
});
