/**
 * Core domain types.
 *
 * Canonical source: specs/grief-framework-context.md
 * Where this file and that document disagree, the document wins.
 */

export const STAGE_IDS = [
  'loss',
  'doubt',
  'discomfort',
  'discovery',
  'understanding',
  'integration',
] as const;

export type Stage = (typeof STAGE_IDS)[number];

export const DOMAIN_IDS = [
  'teaching',
  'craft',
  'analysis',
  'building',
  'coordination',
] as const;

export type Domain = (typeof DOMAIN_IDS)[number];

export const THREAT_IDS = [
  'skills_obsolescence',
  'identity_authority',
  'verification',
  'authenticity_quality',
  'economic',
  'ethical',
  'control_opacity',
] as const;

export type ThreatId = (typeof THREAT_IDS)[number];

export const ROGERS_IDS = [
  'innovator',
  'early_adopter',
  'early_majority',
  'late_majority',
  'laggard',
] as const;

export type RogersPosition = (typeof ROGERS_IDS)[number];

export type Confidence = 'high' | 'moderate' | 'low';
export type Mode = 'explore' | 'diagnose';
/**
 * Only one path exists. Kept as a named type rather than inlined because the
 * metrics payload reports it, and a second path returning later should not
 * silently change that field's meaning.
 */
export type DiagnosticPath = 'quick';

export interface StageData {
  id: Stage;
  name: string;
  position: 1 | 2 | 3 | 4 | 5 | 6;
  emotion: string;
  cognition: string;
  behavior: string;
  color: string;
  isDangerZone: boolean;
  regressionTarget: Stage | null;
}

export interface Diagnosis {
  stage: Stage;
  stageConfidence: Confidence;
  /** Set when the top two stages are adjacent and the margin is thin. */
  transitionToward: Stage | null;
  domain: Domain;
  /** Ordered, primary first. Length 1-2. */
  threats: ThreatId[];
  rogers: RogersPosition;
  /** Signed, in stations. fieldPosition(domain) - stagePosition. Always computed locally. */
  gap: number;
  /** True when behaviour and emotion point two or more stations apart. */
  signalConflict: boolean;
  /** Set when the primary threat is an ethical objection. Changes assembly. */
  ethicalPosition: 'primary' | null;
  /** Why this stage, in the user's own answers. */
  rationale?: string;
  path: DiagnosticPath;
}

export function isStage(v: unknown): v is Stage {
  return typeof v === 'string' && (STAGE_IDS as readonly string[]).includes(v);
}

export function isDomain(v: unknown): v is Domain {
  return typeof v === 'string' && (DOMAIN_IDS as readonly string[]).includes(v);
}

export function isThreatId(v: unknown): v is ThreatId {
  return typeof v === 'string' && (THREAT_IDS as readonly string[]).includes(v);
}

export function isRogers(v: unknown): v is RogersPosition {
  return typeof v === 'string' && (ROGERS_IDS as readonly string[]).includes(v);
}
