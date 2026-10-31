import { z } from 'zod';

/**
 * The shape the classifier must return.
 *
 * Deliberately absent: `gap`. It is a pure function of domain and stage, both
 * of which the application already owns, so it is always computed client-side.
 * Letting a model return it would introduce drift in the one number the whole
 * visualization depends on.
 */

export const STAGES = [
  'loss',
  'doubt',
  'discomfort',
  'discovery',
  'understanding',
  'integration',
] as const;

export const DOMAINS = [
  'teaching',
  'craft',
  'analysis',
  'building',
  'coordination',
] as const;

export const THREATS = [
  'skills_obsolescence',
  'identity_authority',
  'verification',
  'authenticity_quality',
  'economic',
  'ethical',
  'control_opacity',
] as const;

export const ROGERS = [
  'innovator',
  'early_adopter',
  'early_majority',
  'late_majority',
  'laggard',
] as const;

export const DiagnosisSchema = z.object({
  stage: z.enum(STAGES),
  stageConfidence: z.enum(['high', 'moderate', 'low']),
  transitionToward: z.enum(STAGES).nullable(),
  domain: z.enum(DOMAINS),
  threats: z.array(z.enum(THREATS)),
  rogers: z.enum(ROGERS),
  rationale: z.string(),
  signalConflict: z.boolean(),
  /** Set when the person's objection is a position rather than a stage. */
  ethicalPosition: z.boolean(),
});

export type ClassifiedDiagnosis = z.infer<typeof DiagnosisSchema>;

export const CLASSIFY_INSTRUCTION = [
  'That is enough to go on. Do not reply to the person.',
  'Return the classification only, as structured output.',
  '',
  'For `rationale`: two or three sentences addressed to them, in the second',
  'person, citing specific things they actually said. Do not name the',
  'framework and do not explain the model. Do not mention the stage name —',
  'it is shown separately.',
  '',
  'For `threats`: one or two, most important first, mapped onto the canonical',
  'ids even where their wording did not match one.',
  '',
  'Set `ethicalPosition` true only when their primary objection is an ethical',
  'one. Set `signalConflict` true when what they do and what they feel point',
  'to stages two or more apart.',
].join('\n');
