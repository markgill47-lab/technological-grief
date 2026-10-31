import { computeGap } from '../domain/gap';
import {
  isDomain,
  isRogers,
  isStage,
  isThreatId,
  type Confidence,
  type Diagnosis,
  type ThreatId,
} from '../domain/types';

export interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

export const ENDPOINT = '/api/converse';
export const MAX_TURNS = 8;
const TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;

export class ConversationUnavailable extends Error {
  constructor(public readonly reason: string) {
    super(reason);
    this.name = 'ConversationUnavailable';
  }
}

/** Probe once at mount. A non-200 hides the Conversation path entirely. */
export async function probeProxy(fetchImpl: typeof fetch = fetch): Promise<boolean> {
  try {
    const res = await fetchImpl(ENDPOINT, {
      method: 'HEAD',
      signal: AbortSignal.timeout(4_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function call(
  body: unknown,
  fetchImpl: typeof fetch,
  sleep: (ms: number) => Promise<void>,
): Promise<unknown> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let res: Response;
    try {
      res = await fetchImpl(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      // A timeout is worth one more try; anything else is not.
      const timedOut = err instanceof DOMException && err.name === 'TimeoutError';
      if (timedOut && attempt < MAX_ATTEMPTS) continue;
      throw new ConversationUnavailable('network');
    }

    if (res.ok) return res.json();

    // 429 and 503 are the retryable ones. Everything else fails immediately:
    // a 400 will not become a 200 on the third attempt.
    if (res.status === 429 || res.status === 503) {
      if (attempt === MAX_ATTEMPTS) break;
      const header = Number(res.headers.get('retry-after'));
      await sleep(Number.isFinite(header) && header > 0 ? header * 1000 : 1000 * 2 ** attempt);
      continue;
    }

    throw new ConversationUnavailable(`http_${res.status}`);
  }

  throw new ConversationUnavailable('exhausted');
}

export async function nextTurn(
  messages: Turn[],
  fetchImpl: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = defaultSleep,
): Promise<string> {
  const data = await call({ messages }, fetchImpl, sleep);
  const content = (data as { content?: unknown })?.content;
  if (typeof content !== 'string' || content.trim() === '') {
    throw new ConversationUnavailable('empty');
  }
  return content.trim();
}

export async function classify(
  messages: Turn[],
  fetchImpl: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = defaultSleep,
): Promise<Diagnosis> {
  const data = await call({ messages, classify: true }, fetchImpl, sleep);
  return validateDiagnosis((data as { diagnosis?: unknown })?.diagnosis);
}

/**
 * The returned diagnosis is NOT trusted.
 *
 * Anything unrecognised is dropped rather than rendered, and `gap` is ignored
 * entirely even if present — it is recomputed from domain and stage, both of
 * which the application owns. Letting a model supply it would introduce drift
 * in the one number the visualization depends on.
 */
export function validateDiagnosis(raw: unknown): Diagnosis {
  if (typeof raw !== 'object' || raw === null) {
    throw new ConversationUnavailable('malformed');
  }
  const d = raw as Record<string, unknown>;

  if (!isStage(d.stage)) throw new ConversationUnavailable('bad_stage');
  if (!isDomain(d.domain)) throw new ConversationUnavailable('bad_domain');

  const threats = Array.isArray(d.threats)
    ? (d.threats.filter(isThreatId) as ThreatId[]).slice(0, 2)
    : [];
  if (threats.length === 0) throw new ConversationUnavailable('bad_threats');

  const confidence: Confidence = ['high', 'moderate', 'low'].includes(
    d.stageConfidence as string,
  )
    ? (d.stageConfidence as Confidence)
    : 'low';

  const rationale =
    typeof d.rationale === 'string'
      ? stripMarkup(d.rationale).slice(0, 600)
      : undefined;

  return {
    stage: d.stage,
    stageConfidence: confidence,
    transitionToward: isStage(d.transitionToward) ? d.transitionToward : null,
    domain: d.domain,
    threats,
    // An unrecognised position omits the pace note rather than guessing.
    rogers: isRogers(d.rogers) ? d.rogers : null,
    gap: computeGap(d.stage, d.domain),
    signalConflict: d.signalConflict === true,
    ethicalPosition:
      d.ethicalPosition === true || threats[0] === 'ethical' ? 'primary' : null,
    rationale,
    path: 'conversation',
  };
}

/** The rationale is rendered as text; this is defence in depth, not escaping. */
function stripMarkup(s: string): string {
  return s.replace(/<[^>]*>/g, '').trim();
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * True once the conversation has gone on long enough to stop.
 * The model decides when it has enough; this is the hard ceiling.
 */
export function atTurnCap(messages: Turn[]): boolean {
  return messages.filter((m) => m.role === 'user').length >= MAX_TURNS;
}

export const OPENING_QUESTION =
  "Let's start simply: how would you describe your current relationship with AI in your work? There's no wrong answer — I'm just trying to understand where you're starting from.";
