import { POSITION, STAGE_ORDER } from '../domain/stages';
import { computeGap } from '../domain/gap';
import type { Confidence, Diagnosis, Stage, ThreatId } from '../domain/types';
import { STAGE_IDS } from '../domain/types';
import {
  DANGER_ZONE_BONUS,
  IMPLEMENTED_KEYS,
  LAYER_WEIGHT,
  Q1_WEIGHTS,
  Q2_DOMAIN,
  Q3_WEIGHTS,
  Q4_WEIGHTS,
  Q6_ROGERS,
  type QuickAnswers,
  type StageWeights,
} from './quickQuestions';

export type Scores = Record<Stage, number>;

function zeroScores(): Scores {
  return {
    loss: 0,
    doubt: 0,
    discomfort: 0,
    discovery: 0,
    understanding: 0,
    integration: 0,
  };
}

function add(into: Scores, weights: StageWeights | undefined, factor: number): void {
  if (!weights) return;
  for (const stage of STAGE_IDS) {
    const w = weights[stage];
    if (w) into[stage] += w * factor;
  }
}

function argmax(scores: Scores): Stage {
  return STAGE_ORDER.reduce((best, s) => (scores[s] > scores[best] ? s : best));
}

export interface ScoreBreakdown {
  total: Scores;
  /** Unweighted behaviour subtotal, including the danger-zone bonus. */
  behavior: Scores;
  emotion: Scores;
  trainedWithoutImplementing: boolean;
  /** Descending by score, ties broken toward the earlier stage. */
  ranked: Stage[];
}

/**
 * The scoring core. Separated from `scoreQuick` so tests and the diagnosis
 * copy can inspect the weighting without re-deriving it.
 */
export function computeScores(answers: QuickAnswers): ScoreBreakdown {
  const total = zeroScores();

  add(total, Q1_WEIGHTS[answers.q1], LAYER_WEIGHT.selfReport);

  // Behaviour: sum every selected option, then apply the danger-zone rule
  // BEFORE weighting, so the bonus is weighted alongside the rest.
  const behavior = zeroScores();
  for (const key of answers.q3) add(behavior, Q3_WEIGHTS[key], 1);

  const trainedWithoutImplementing =
    answers.q3.includes('trained') &&
    !IMPLEMENTED_KEYS.some((k) => answers.q3.includes(k));
  if (trainedWithoutImplementing) behavior.discomfort += DANGER_ZONE_BONUS;

  add(total, behavior, LAYER_WEIGHT.behavior);

  const emotion = zeroScores();
  add(emotion, Q4_WEIGHTS[answers.q4], 1);
  add(total, Q4_WEIGHTS[answers.q4], LAYER_WEIGHT.emotion);

  // Ties break toward the EARLIER stage. A genuine tie means there is not
  // enough evidence to credit progression, and over-diagnosing someone as
  // further along is the more harmful error: it skips the validation they
  // need and offers next steps they are not positioned to take.
  const ranked = [...STAGE_ORDER].sort(
    (a, b) => total[b] - total[a] || POSITION[a] - POSITION[b],
  );

  return { total, behavior, emotion, trainedWithoutImplementing, ranked };
}

/**
 * Deterministic scoring for the Quick path. Pure function, no network, no
 * model. This is where the product's diagnostic correctness actually lives,
 * and it is exhaustively testable - under v1 the same logic sat inside a
 * model call and could only be evaluated statistically.
 */
export function scoreQuick(answers: QuickAnswers): Diagnosis {
  const { total, behavior, emotion, ranked } = computeScores(answers);

  const stage = ranked[0];
  const runnerUp = ranked[1];
  const margin = total[stage] - total[runnerUp];

  const stageConfidence: Confidence =
    margin >= 4 ? 'high' : margin >= 2 ? 'moderate' : 'low';

  // Adjacent stages with a thin margin means transition, not a coin flip.
  const adjacent = Math.abs(POSITION[stage] - POSITION[runnerUp]) === 1;
  const transitionToward =
    adjacent && margin < 3 && POSITION[runnerUp] > POSITION[stage]
      ? runnerUp
      : null;

  const domain = Q2_DOMAIN[answers.q2];
  const threats: ThreatId[] = answers.q5b
    ? [answers.q5, answers.q5b]
    : [answers.q5];

  return {
    stage,
    stageConfidence,
    transitionToward,
    domain,
    threats,
    rogers: Q6_ROGERS[answers.q6],
    gap: computeGap(stage, domain),
    signalConflict: detectConflict(behavior, emotion),
    ethicalPosition: answers.q5 === 'ethical' ? 'primary' : null,
    path: 'quick',
  };
}

/**
 * The weights already resolve a conflict correctly - behaviour at 2.0 beats
 * emotion at 1.5. Surfacing it does something the weighting cannot: it tells
 * the person the discrepancy was seen rather than silently overruled.
 */
export function detectConflict(behavior: Scores, emotion: Scores): boolean {
  const behaviorTotal = Object.values(behavior).reduce((a, b) => a + b, 0);
  const emotionTotal = Object.values(emotion).reduce((a, b) => a + b, 0);
  if (behaviorTotal === 0 || emotionTotal === 0) return false;

  return Math.abs(POSITION[argmax(behavior)] - POSITION[argmax(emotion)]) >= 2;
}

/**
 * Why this stage, in the user's own answers rather than in framework terms.
 * See specs/survey-methodology.md section 6.
 */
export function quickRationale(answers: QuickAnswers, d: Diagnosis): string {
  const { trainedWithoutImplementing } = computeScores(answers);

  if (trainedWithoutImplementing) {
    return "You've been to a session on this but haven't tried anything yet. That combination is the clearest marker there is for this stage — it means you're past denial and past arguing, and now stuck in the gap between knowing you should do something and knowing what.";
  }

  switch (d.stage) {
    case 'loss':
      return "You described keeping your distance from this, and the attention in your answers goes to what's being taken rather than to what might be built. That asymmetry is the stage itself, and it's doing a protective job.";
    case 'doubt':
      return "You've been taking this in — reading, watching — without trying it, and the feeling you named isn't curiosity. That's the signature of this stage: the change is undeniable, so the argument has moved to whether it works.";
    case 'discomfort':
      return "You told me you're trying to work out whether and how this applies, and that the main feeling is overwhelm. That pairing is this stage exactly: urgency without direction.";
    case 'discovery':
      return "You've tried things and you're curious about what else. The question in your answers has shifted from whether to how, which is the move that defines this stage.";
    case 'understanding':
      return "You're using this regularly in specific parts of your work and you sound calibrated about where it helps. That predictability — not excitement — is what marks this stage.";
    case 'integration':
      return "You're helping other people learn this, and you described it as settled. Generosity is reliable enough as a signal here that the framework treats it as the signature of this stage.";
  }
}
