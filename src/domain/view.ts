import { computeGap } from './gap';
import type { Diagnosis, Domain } from './types';

/**
 * The diagnosis as it is being read, which is not always the diagnosis that
 * was made.
 *
 * Q2 asks what kind of work you do, and plenty of people sit between two
 * answers — a faculty member who also runs a programme is in teaching and in
 * coordination. The domain is therefore switchable after the fact, and this
 * is the one place that applies the switch.
 *
 * The **gap moves with the domain**, because the gap is defined as the
 * distance between where you are and where *that field* sits
 * ([grief-framework-context.md](../../specs/grief-framework-context.md) §5).
 * Pinning it to the surveyed domain while showing another field's content
 * would put a number on screen that belongs to neither. Your own position
 * never moves: `stage`, `threats` and the confidence are what you answered
 * and are passed through untouched.
 *
 * The stored diagnosis is never mutated — it is the record of what someone
 * actually said, and an export has to be able to reproduce it.
 */
export function viewDiagnosis(
  diagnosis: Diagnosis | null,
  viewDomain: Domain | null,
): Diagnosis | null {
  if (!diagnosis) return null;
  if (!viewDomain || viewDomain === diagnosis.domain) return diagnosis;

  return {
    ...diagnosis,
    domain: viewDomain,
    gap: computeGap(diagnosis.stage, viewDomain),
  };
}

/** True when the reader is looking at a field other than the one they chose. */
export function isBorrowedDomain(
  diagnosis: Diagnosis | null,
  viewDomain: Domain | null,
): boolean {
  return !!diagnosis && !!viewDomain && viewDomain !== diagnosis.domain;
}
