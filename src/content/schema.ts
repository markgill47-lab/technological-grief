import type { Domain, RogersPosition, Stage, ThreatId } from '../domain/types';
import type { GapSign } from '../domain/gap';

export type BlockKind = 'stage_core' | 'domain_lens' | 'threat_response' | 'pace_note';

export interface BlockMeta {
  author: string;
  /** ISO date. The build warns at twelve months. */
  lastReviewed: string;
  reviewedBy?: string;
  /** Set true only once a practitioner in the domain has signed off. */
  domainVerified?: boolean;
  /** Any note a reviewer needs to see before editing. */
  note?: string;
}

interface BaseBlock {
  id: string;
  kind: BlockKind;
  meta: BlockMeta;
}

/**
 * Invariant framework truth. Body carries three sections split on
 * `<!--@why-->` and `<!--@forward-->`.
 */
export interface StageCoreBlock extends BaseBlock {
  kind: 'stage_core';
  stage: Stage;
  body: string;
}

export interface DomainLensBlock extends BaseBlock {
  kind: 'domain_lens';
  stage: Stage;
  domain: Domain;
  body: string;
  /**
   * The one concrete thing to try. The highest-stakes field in the library -
   * at Discomfort this IS the intervention.
   *
   * Absent by design for Loss and Doubt: the framework is explicit that you
   * do not offer a tool at those stages. Enforced in validate.test.ts.
   */
  firstExperiment?: string;
}

export interface ThreatResponseBlock extends BaseBlock {
  kind: 'threat_response';
  threat: ThreatId;
  /** Omitted means "all stages". The resolver prefers the most specific match. */
  stageScope?: Stage[];
  body: string;
}

/**
 * Pace notes replace `body` with three framings, because the gap sign changes
 * the sentence rather than adding to it.
 */
export interface PaceNoteBlock extends BaseBlock {
  kind: 'pace_note';
  rogers: RogersPosition;
  framings: Record<GapSign, string>;
}

export type ContentBlock =
  | StageCoreBlock
  | DomainLensBlock
  | ThreatResponseBlock
  | PaceNoteBlock;

export const WHY_MARKER = '<!--@why-->';
export const FORWARD_MARKER = '<!--@forward-->';

export interface StageCoreSections {
  overview: string;
  why: string;
  forward: string;
}

export function splitStageCore(body: string): StageCoreSections {
  const [beforeWhy, afterWhy = ''] = splitOnce(body, WHY_MARKER);
  const [why, forward = ''] = splitOnce(afterWhy, FORWARD_MARKER);
  return {
    overview: beforeWhy.trim(),
    why: why.trim(),
    forward: forward.trim(),
  };
}

function splitOnce(s: string, marker: string): [string, string?] {
  const i = s.indexOf(marker);
  if (i === -1) return [s];
  return [s.slice(0, i), s.slice(i + marker.length)];
}
