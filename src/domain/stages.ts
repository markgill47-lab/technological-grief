import type { Stage, StageData } from './types';
import { STAGE_IDS } from './types';

/**
 * The six stages.
 *
 * The Danger Zone is Stage 3 (Discomfort) ALONE. v1 of the spec defined it
 * three different ways across three documents - as Stage 3, as a boundary
 * between Stages 2 and 3, and as a flag on both Doubt and Discomfort.
 * Settled in specs/grief-framework-context.md section 2.1: Discomfort is the
 * Danger Zone; Doubt is where regression lands, which is what
 * `regressionTarget` records.
 */
export const STAGES: Record<Stage, StageData> = {
  loss: {
    id: 'loss',
    name: 'Loss',
    position: 1,
    emotion: 'Fear',
    cognition: 'Denial',
    behavior: 'Withdrawn',
    color: '#C83737',
    isDangerZone: false,
    regressionTarget: null,
  },
  doubt: {
    id: 'doubt',
    name: 'Doubt',
    position: 2,
    emotion: 'Resentment',
    cognition: 'Skeptical',
    behavior: 'Defensive',
    color: '#B83A4B',
    isDangerZone: false,
    regressionTarget: null,
  },
  discomfort: {
    id: 'discomfort',
    name: 'Discomfort',
    position: 3,
    emotion: 'Anxiety',
    cognition: 'Confused',
    behavior: 'Unproductive',
    color: '#E8A547',
    isDangerZone: true,
    regressionTarget: 'doubt',
  },
  discovery: {
    id: 'discovery',
    name: 'Discovery',
    position: 4,
    emotion: 'Anticipation',
    cognition: 'Resourceful',
    behavior: 'Experimental',
    color: '#F4C542',
    isDangerZone: false,
    regressionTarget: null,
  },
  understanding: {
    id: 'understanding',
    name: 'Understanding',
    position: 5,
    emotion: 'Confidence',
    cognition: 'Pragmatic',
    behavior: 'Productive',
    color: '#4A9B8E',
    isDangerZone: false,
    regressionTarget: null,
  },
  integration: {
    id: 'integration',
    name: 'Integration',
    position: 6,
    emotion: 'Satisfaction',
    cognition: 'Flexible',
    behavior: 'Generous',
    color: '#2F6B5D',
    isDangerZone: false,
    regressionTarget: null,
  },
};

/** Stages in path order. */
export const STAGE_ORDER: readonly Stage[] = STAGE_IDS;

export const POSITION: Record<Stage, number> = Object.fromEntries(
  STAGE_IDS.map((id) => [id, STAGES[id].position]),
) as Record<Stage, number>;

export function stageAtPosition(position: number): Stage {
  const found = STAGE_IDS.find((id) => STAGES[id].position === position);
  if (!found) throw new Error(`No stage at position ${position}`);
  return found;
}

/**
 * The breadcrumb does NOT wrap. Integration has no next and Loss has no
 * previous - v1 specified wrapping, which asserts a closed cycle the
 * framework explicitly denies.
 */
export function previousStage(stage: Stage): Stage | null {
  const p = STAGES[stage].position;
  return p === 1 ? null : stageAtPosition(p - 1);
}

export function nextStage(stage: Stage): Stage | null {
  const p = STAGES[stage].position;
  return p === 6 ? null : stageAtPosition(p + 1);
}
