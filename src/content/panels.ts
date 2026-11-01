import type { AssembledPage, AssembledSection } from './assemble';

/**
 * The assembled page, split into what the panel shows and what the two
 * modals hold.
 *
 * The page is between two and eight sections of real prose. Showing all of it
 * at once made the stage itself hard to find, so the panel keeps the parts
 * that describe where you are and the modals hold the parts that explain and
 * advise. Nothing is dropped — `panels.test.ts` asserts that every section of
 * the page lands in exactly one group, because "we moved it behind a button"
 * and "we lost it" look identical from the outside.
 */
export interface PanelGroups {
  /** The stage as it is now. */
  description: AssembledSection | null;
  /** Emotion, cognition and behaviour, separator-joined. */
  experience: AssembledSection | null;
  /** Behind "Why this happens". */
  why: AssembledSection[];
  /** Behind "What to do about it". */
  forward: AssembledSection[];
  /** The one-line field note, shown in the panel beside the switcher. */
  lensSummary: string | null;
}

/** Sections that explain the situation. */
const WHY_LAYERS = ['lens', 'threat'] as const;
/** Sections that ask for something. */
const FORWARD_LAYERS = ['experiment', 'pace'] as const;

export function groupIntoPanels(page: AssembledPage): PanelGroups {
  const find = (kind: AssembledSection['kind']) =>
    page.sections.find((s) => s.kind === kind) ?? null;

  const core = (kind: AssembledSection['kind']) => {
    const s = find(kind);
    return s ? [s] : [];
  };

  // The invariant core leads each modal, because the modal is named after it.
  // The personalized layers follow in page order, which is what preserves the
  // ethical override (threat response before domain lens — see assemble.ts).
  const layers = (kinds: readonly AssembledSection['kind'][]) =>
    page.sections.filter((s) => kinds.includes(s.kind));

  return {
    description: find('overview'),
    experience: find('experience'),
    why: [...core('why'), ...layers(WHY_LAYERS)],
    forward: [...core('forward'), ...layers(FORWARD_LAYERS)],
    lensSummary: find('lens')?.summary ?? null,
  };
}

/** How many sections sit behind a button, for the button's own label. */
export function depth(sections: AssembledSection[]): number {
  return sections.length;
}
