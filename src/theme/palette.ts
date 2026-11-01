import type { Stage } from '../domain/types';

export type Theme = 'light' | 'dark';

export const THEMES: readonly Theme[] = ['light', 'dark'];

/**
 * The NextEd palette, mirrored in TypeScript.
 *
 * `tokens.css` is what the app actually renders from; this record exists so
 * the contrast rules can be asserted rather than eyeballed, and
 * `palette.test.ts` fails if the two drift apart. Values come from the
 * design system's `tokens.json`.
 */
export const TOKENS: Record<Theme, Record<string, string>> = {
  light: {
    surface: '#ffffff',
    'surface-subtle': '#f7f8f9',
    'surface-raised': '#ffffff',
    'surface-sunken': '#f4f5f6',
    'surface-inverse': '#101010',
    ink: '#101010',
    'ink-body': '#2a2e31',
    'ink-muted': '#6b757c',
    'on-brand': '#ffffff',
    brand: '#cd1041',
    'brand-hover': '#a70d34',
    'brand-text': '#cd1041',
    granite: '#000000',
    border: '#e4e7e9',
    'border-strong': '#6b757c',
    link: '#0563f7',
    'link-strong': '#0a47b8',
    'link-on-dark': '#4d8bff',
    wash: '#e8f0fe',
    focus: '#0563f7',
    'warning-text': '#8a4a05',
    'warning-wash': '#fff4e8',
  },
  dark: {
    surface: '#151719',
    'surface-subtle': '#1f2225',
    'surface-raised': '#1f2225',
    'surface-sunken': '#2a2e31',
    'surface-inverse': '#101010',
    ink: '#f7f8f9',
    'ink-body': '#c9cfd3',
    'ink-muted': '#a6b0b7',
    'on-brand': '#ffffff',
    brand: '#cd1041',
    'brand-hover': '#a70d34',
    'brand-text': '#ff4d70',
    granite: '#000000',
    border: '#3f464b',
    'border-strong': '#6b757c',
    link: '#4d8bff',
    'link-strong': '#9ec0ff',
    'link-on-dark': '#4d8bff',
    wash: '#0a2a6b',
    focus: '#4d8bff',
    'warning-text': '#f0dfae',
    'warning-wash': '#1f2225',
  },
};

/**
 * The six stages, in NextEd colours.
 *
 * The v1 ramp ran red → amber → teal, which is unavailable here: NextEd
 * reserves red for the institution and for errors, and Bold Orange for
 * warnings. Each stage is therefore a design system token, and each token
 * carries its own light and dark value — so the ramp is the same six tokens
 * in both themes rather than two palettes to keep in step.
 *
 *   1 Loss          steel          — the ground the path starts on
 *   2 Doubt         border-strong  — a step lighter, still neutral
 *   3 Discomfort    bold-orange    — the Danger Zone, and the system's warning colour
 *   4 Discovery     glacier-blue   — the first cool band; the turn outward
 *   5 Understanding gateway-blue   — NextEd's "forward motion" blue
 *   6 Integration   gateway-deep   — the same blue, arrived at
 */
export const STAGE_RAMP: Record<Theme, Record<Stage, string>> = {
  light: {
    loss: '#3f464b',
    doubt: '#6b757c',
    discomfort: '#f58220',
    discovery: '#718c9a',
    understanding: '#0563f7',
    integration: '#0a47b8',
  },
  dark: {
    loss: '#6b757c',
    doubt: '#a6b0b7',
    discomfort: '#f58220',
    discovery: '#718c9a',
    understanding: '#4d8bff',
    integration: '#9ec0ff',
  },
};

/**
 * Ink for a station number sitting on its own band.
 *
 * No single ink clears 4.5:1 against all six fills in either theme, so it is
 * picked per band by luminance. The threshold is 0.21 rather than a tidy 0.5
 * because that is where the two awkward fills fall: Border Strong at 0.18
 * needs white, and Glacier Blue at 0.25 needs ink — white on Glacier is
 * 3.5:1 and fails. `palette.test.ts` asserts the result, not the threshold.
 */
export const INK_THRESHOLD = 0.21;

/**
 * Not the theme's `ink` token: in dark mode that is near-white, and a
 * station number on Silver Gray needs the opposite. The two values here are
 * `surface-inverse` and `on-brand`, which are the same in both themes.
 */
export function inkOn(hex: string): string {
  return relativeLuminance(hex) > INK_THRESHOLD ? '#101010' : '#ffffff';
}

export function relativeLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
