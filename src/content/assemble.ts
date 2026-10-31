import { STAGES } from '../domain/stages';
import { gapSign } from '../domain/gap';
import { threatsAreRedundant } from '../domain/taxonomies';
import type { Diagnosis, Stage } from '../domain/types';
import { findDomainLens, resolveThreatResponse } from './index';
import { PACE_NOTES } from './paceNotes';
import { STAGE_CORES } from './stageCores';
import { splitStageCore } from './schema';

export type SectionKind =
  | 'overview'
  | 'experience'
  | 'lens'
  | 'experiment'
  | 'threat'
  | 'why'
  | 'forward'
  | 'pace';

export interface AssembledSection {
  key: string;
  kind: SectionKind;
  /** null means the section renders without a heading. */
  heading: string | null;
  body: string;
  /** Which authored block this came from. Useful in tests and the export. */
  blockId: string | null;
}

export interface AssembledPage {
  stage: Stage;
  sections: AssembledSection[];
}

/**
 * Compose a page from the four content layers.
 *
 * Every layer after the stage core is optional. With `diagnosis === null`
 * the page is the stage core alone - complete, correct, and readable. That
 * is the anonymous-browse case and the other layers are enrichment, never
 * load-bearing. See specs/content-architecture.md section 4.1.
 */
export function assemble(stage: Stage, diagnosis: Diagnosis | null): AssembledPage {
  const core = STAGE_CORES[stage];
  const { overview, why, forward } = splitStageCore(core.body);
  const data = STAGES[stage];

  const sections: AssembledSection[] = [];

  sections.push({
    key: 'overview',
    kind: 'overview',
    heading: null,
    body: overview,
    blockId: core.id,
  });

  sections.push({
    key: 'experience',
    kind: 'experience',
    heading: 'What you might experience',
    // Rendered as a table by the component; the body carries the triad.
    body: [data.emotion, data.cognition, data.behavior].join('\u001f'),
    blockId: null,
  });

  // --- personalized layers -------------------------------------------------

  const lens = diagnosis ? findDomainLens(stage, diagnosis.domain) : null;
  const threatSections = diagnosis ? buildThreatSections(diagnosis, stage) : [];
  const isEthical = diagnosis?.ethicalPosition === 'primary';

  const lensSections: AssembledSection[] = [];
  if (lens) {
    lensSections.push({
      key: 'lens',
      kind: 'lens',
      heading: 'In your work',
      body: lens.body,
      blockId: lens.id,
    });

    // Offering someone a fun experiment immediately after they have told you
    // they consider the tool unethical is the worst failure mode available
    // here. The suppression is not stylistic.
    if (lens.firstExperiment && !isEthical) {
      lensSections.push({
        key: 'experiment',
        kind: 'experiment',
        heading: 'Try this',
        body: lens.firstExperiment,
        blockId: lens.id,
      });
    }
  }

  // Ethical override: the threat response comes BEFORE the domain lens.
  if (isEthical) {
    sections.push(...threatSections, ...lensSections);
  } else {
    sections.push(...lensSections, ...threatSections);
  }

  // --- back to invariant core ---------------------------------------------

  sections.push({
    key: 'why',
    kind: 'why',
    heading: 'Why this happens',
    body: why,
    blockId: core.id,
  });

  sections.push({
    key: 'forward',
    kind: 'forward',
    heading: stage === 'integration' ? 'What to do with it' : 'Moving forward',
    body: forward,
    blockId: core.id,
  });

  if (diagnosis?.rogers) {
    const pace = PACE_NOTES[diagnosis.rogers];
    if (pace) {
      sections.push({
        key: 'pace',
        kind: 'pace',
        heading: 'Your pace',
        body: pace.framings[gapSign(diagnosis.gap)],
        blockId: pace.id,
      });
    }
  }

  return {
    stage,
    // A section with no resolved content is omitted, never rendered empty.
    sections: sections.filter((s) => s.body.trim().length > 0),
  };
}

/**
 * At most two threat responses, and the second only when it is not redundant
 * with the first. Three or more produce a page that reads as a catalogue of
 * the user's complaints rather than a response to a person.
 */
function buildThreatSections(diagnosis: Diagnosis, stage: Stage): AssembledSection[] {
  const [primary, secondary] = diagnosis.threats;
  if (!primary) return [];

  const keep = [primary];
  if (secondary && !threatsAreRedundant(primary, secondary)) {
    keep.push(secondary);
  }

  return keep
    .map((threat, i): AssembledSection | null => {
      const block = resolveThreatResponse(threat, stage);
      if (!block) return null;
      return {
        key: `threat-${i}`,
        kind: 'threat',
        heading: i === 0 ? 'About what you said' : null,
        body: block.body,
        blockId: block.id,
      };
    })
    .filter((s): s is AssembledSection => s !== null);
}

export const TRIAD_SEPARATOR = '\u001f';
