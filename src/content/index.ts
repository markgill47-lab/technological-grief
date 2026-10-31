import type { ContentBlock, DomainLensBlock, ThreatResponseBlock } from './schema';
import { STAGE_CORES } from './stageCores';
import { DOMAIN_LENSES } from './domainLenses';
import { THREAT_RESPONSES } from './threatResponses';
import { PACE_NOTES } from './paceNotes';
import type { Domain, Stage, ThreatId } from '../domain/types';

export * from './schema';
export { STAGE_CORES, DOMAIN_LENSES, THREAT_RESPONSES, PACE_NOTES };

/** Every authored block, for validation and counting. */
export const ALL_BLOCKS: ContentBlock[] = [
  ...Object.values(STAGE_CORES),
  ...DOMAIN_LENSES,
  ...THREAT_RESPONSES,
  ...Object.values(PACE_NOTES),
];

export function findDomainLens(stage: Stage, domain: Domain): DomainLensBlock | null {
  return (
    DOMAIN_LENSES.find((b) => b.stage === stage && b.domain === domain) ?? null
  );
}

/**
 * Prefer the most specific variant. Ambiguity is a build-time error, not a
 * runtime coin flip - see validate.test.ts.
 */
export function resolveThreatResponse(
  threat: ThreatId,
  stage: Stage,
): ThreatResponseBlock | null {
  const candidates = THREAT_RESPONSES.filter((b) => b.threat === threat);

  const scoped = candidates.filter((b) => b.stageScope?.includes(stage));
  if (scoped.length > 1) {
    throw new Error(
      `Ambiguous threat_response variant for ${threat} at ${stage}: ` +
        scoped.map((b) => b.id).join(', '),
    );
  }
  if (scoped.length === 1) return scoped[0];

  return candidates.find((b) => !b.stageScope) ?? null;
}
