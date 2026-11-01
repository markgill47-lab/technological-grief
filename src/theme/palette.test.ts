import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  STAGE_RAMP,
  THEMES,
  TOKENS,
  contrastRatio,
  inkOn,
  relativeLuminance,
} from './palette';
import { STAGE_IDS } from '../domain/types';
import type { Theme } from './palette';

const CSS = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

/** Pull the custom properties out of one rule block. */
function declarations(selector: string): Record<string, string> {
  const i = CSS.indexOf(selector);
  if (i === -1) throw new Error(`tokens.css has no block for ${selector}`);
  const open = CSS.indexOf('{', i);
  const close = CSS.indexOf('}', open);
  const out: Record<string, string> = {};
  for (const line of CSS.slice(open + 1, close).split('\n')) {
    const m = /^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/.exec(line);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const BLOCK: Record<Theme, Record<string, string>> = {
  light: declarations(':root {'),
  dark: declarations(":root[data-theme='dark']"),
};
/** The same dark values, applied when the OS asks and nothing overrides. */
const PREFERS_DARK = declarations(":root:not([data-theme='light'])");

describe('NextEd palette', () => {
  it('U-N-01 tokens.css matches the palette record', () => {
    for (const theme of THEMES) {
      for (const [name, value] of Object.entries(TOKENS[theme])) {
        expect(BLOCK[theme][`--${name}`]?.toLowerCase(), `${theme} --${name}`).toBe(
          value.toLowerCase(),
        );
      }
    }
  });

  it('U-N-02 the toggle and the OS preference resolve to the same dark theme', () => {
    // Two rule blocks have to carry the dark values: one for the explicit
    // choice and one for prefers-color-scheme. They drift silently.
    for (const [name, value] of Object.entries(BLOCK.dark)) {
      expect(PREFERS_DARK[name], `media-query ${name}`).toBe(value);
    }
    expect(Object.keys(PREFERS_DARK).sort()).toEqual(Object.keys(BLOCK.dark).sort());
  });

  it('U-N-03 the stage ramp in CSS matches the ramp record', () => {
    for (const theme of THEMES) {
      for (const stage of STAGE_IDS) {
        expect(BLOCK[theme][`--stage-${stage}`]?.toLowerCase(), `${theme} ${stage}`).toBe(
          STAGE_RAMP[theme][stage].toLowerCase(),
        );
      }
    }
  });

  it('U-N-04 each station number passes 4.5:1 on its own band', () => {
    for (const theme of THEMES) {
      for (const stage of STAGE_IDS) {
        const band = STAGE_RAMP[theme][stage];
        const ink = inkOn(band);
        expect(contrastRatio(ink, band), `${theme} ${stage}`).toBeGreaterThanOrEqual(4.5);
        expect(BLOCK[theme][`--stage-${stage}-ink`]?.toLowerCase()).toBe(ink.toLowerCase());
      }
    }
  });

  it('U-N-05 every band has a boundary that passes 3:1 against the surface', () => {
    // The fills cannot carry this on their own. Bold Orange — the Danger
    // Zone, and the only colour NextEd offers for a warning — is 2.59:1 on
    // white, which is why the design system allows it as a fill and never as
    // text. Every band therefore carries a Border Strong keyline, and that is
    // what makes the ring legible as a shape.
    for (const theme of THEMES) {
      const keyline = TOKENS[theme]['border-strong'];
      for (const bg of [TOKENS[theme].surface, TOKENS[theme]['surface-subtle']]) {
        expect(contrastRatio(keyline, bg), `${theme} keyline`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('U-N-05b keeps the dark fills off the dark surface', () => {
    // The reason dark takes the lighter value of each stage token rather than
    // repeating the light hexes: Steel is 1.9:1 and Gateway Deep 2.2:1 on the
    // dark surface, so the bands would read as holes in the ring.
    for (const stage of STAGE_IDS) {
      const ratio = contrastRatio(STAGE_RAMP.dark[stage], TOKENS.dark.surface);
      expect(ratio, `dark ${stage}`).toBeGreaterThanOrEqual(2.5);
    }
  });

  it('U-N-06 light bands step in lightness, peaking at the Danger Zone', () => {
    // Colour is never the only carrier — every band has its number and its
    // label — but in the light theme the ramp also reads in greyscale, and
    // it peaks at stage 3. Documented as not holding in dark (D-12).
    const ls = STAGE_IDS.map((s) => relativeLuminance(STAGE_RAMP.light[s]));
    for (let i = 1; i < ls.length; i++) {
      expect(Math.abs(ls[i] - ls[i - 1]), `gap ${i}`).toBeGreaterThanOrEqual(0.05);
    }
    expect(Math.max(...ls)).toBe(ls[2]);
  });

  it('U-N-07 body and secondary text pass AA on the surfaces they are used on', () => {
    for (const theme of THEMES) {
      const t = TOKENS[theme];
      const pairs: Array<[string, string, string]> = [
        ['ink on surface', t.ink, t.surface],
        ['ink-body on surface', t['ink-body'], t.surface],
        ['ink-body on surface-raised', t['ink-body'], t['surface-raised']],
        ['ink-muted on surface', t['ink-muted'], t.surface],
        ['link on surface', t.link, t.surface],
        ['link on surface-raised', t.link, t['surface-raised']],
        ['brand-text on surface', t['brand-text'], t.surface],
        ['on-brand on brand', t['on-brand'], t.brand],
        ['on-brand on surface-inverse', t['on-brand'], t['surface-inverse']],
        ['link-on-dark on surface-inverse', t['link-on-dark'], t['surface-inverse']],
      ];
      for (const [what, fg, bg] of pairs) {
        expect(contrastRatio(fg, bg), `${theme}: ${what}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('U-N-08 the focus ring reads against every surface it can land on', () => {
    for (const theme of THEMES) {
      const t = TOKENS[theme];
      for (const bg of [t.surface, t['surface-subtle'], t['surface-raised']]) {
        expect(contrastRatio(t.focus, bg), `${theme} focus`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('U-N-09 Spirit Red and Granite Black are present in both themes', () => {
    // "Every piece carries Spirit Red and Granite Black" — the one brand
    // requirement that a palette file can actually assert.
    for (const theme of THEMES) {
      expect(TOKENS[theme].brand.toLowerCase()).toBe('#cd1041');
      expect(TOKENS[theme].granite.toLowerCase()).toBe('#000000');
    }
  });
});
