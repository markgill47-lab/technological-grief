import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { SYSTEM_PROMPT } from './_system-prompt';
import {
  CLASSIFY_INSTRUCTION,
  DiagnosisSchema,
  type ClassifiedDiagnosis,
} from './_schema';
import { RateLimiter } from './_rateLimit';

/**
 * The proxy's core, as a pure-ish function so it can be tested without HTTP.
 *
 * Responsibilities, in priority order:
 *  1. Hold the API key. It never reaches the client.
 *  2. Own the request. Model, system prompt, effort and schema are decided
 *     here; the client sends turns and nothing else. A crafted client cannot
 *     change the model, enlarge max_tokens, or replace the system prompt.
 *  3. Rate limit.
 *  4. Cap input.
 *  5. Log nothing from the body.
 */

export const MODEL = 'claude-opus-5-5';
export const MAX_TURNS = 12;
export const MAX_CHARS = 8_000;

export interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConverseRequest {
  messages: Turn[];
  classify?: boolean;
}

export type ConverseResult =
  | { status: 200; body: { content: string } }
  | { status: 200; body: { diagnosis: ClassifiedDiagnosis } }
  | { status: 400 | 413 | 429 | 500 | 502 | 503; body: { error: string }; retryAfter?: number };

/** The slice of the SDK this handler uses. Keeps the tests honest. */
export interface ModelClient {
  messages: {
    create(params: Record<string, unknown>): Promise<{
      content: Array<{ type: string; text?: string }>;
      stop_reason?: string | null;
    }>;
    parse(params: Record<string, unknown>): Promise<{
      parsed_output: unknown;
    }>;
  };
}

export interface HandlerDeps {
  client: ModelClient;
  limiter: RateLimiter;
  now?: () => number;
}

function systemBlocks() {
  // One stable, cached block. Byte-identical on every request, which is what
  // makes turns 2..n read the ~7.6K prompt at the cache rate instead of the
  // input rate.
  return [
    {
      type: 'text' as const,
      text: SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' as const },
    },
  ];
}

export function validateRequest(body: unknown): ConverseRequest | { error: string } {
  if (typeof body !== 'object' || body === null) return { error: 'Malformed request.' };

  const { messages, classify } = body as Record<string, unknown>;

  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: 'No messages.' };
  }
  if (messages.length > MAX_TURNS) {
    return { error: `Too many turns (max ${MAX_TURNS}).` };
  }

  let chars = 0;
  const turns: Turn[] = [];
  for (const m of messages) {
    if (typeof m !== 'object' || m === null) return { error: 'Malformed turn.' };
    const { role, content } = m as Record<string, unknown>;
    if (role !== 'user' && role !== 'assistant') return { error: 'Bad role.' };
    if (typeof content !== 'string') return { error: 'Bad content.' };
    chars += content.length;
    turns.push({ role, content });
  }

  if (chars > MAX_CHARS) return { error: `Too long (max ${MAX_CHARS} characters).` };
  if (turns[0].role !== 'user') return { error: 'Conversation must start with the user.' };

  return { messages: turns, classify: classify === true };
}

export async function handleConverse(
  rawBody: unknown,
  clientKey: string,
  deps: HandlerDeps,
): Promise<ConverseResult> {
  const now = deps.now ?? Date.now;

  const gate = deps.limiter.check(clientKey, now());
  if (!gate.allowed) {
    return {
      status: 429,
      body: { error: 'Too many requests. Try again shortly.' },
      retryAfter: gate.retryAfter,
    };
  }

  const parsed = validateRequest(rawBody);
  if ('error' in parsed) return { status: 400, body: { error: parsed.error } };

  try {
    return parsed.classify
      ? await classify(parsed.messages, deps.client)
      : await nextTurn(parsed.messages, deps.client);
  } catch (err) {
    return mapError(err);
  }
}

async function nextTurn(messages: Turn[], client: ModelClient): Promise<ConverseResult> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: systemBlocks(),
    // Thinking cannot be disabled on this model and `budget_tokens` is a 400.
    // Depth is controlled by effort alone, and the default here is `medium` —
    // these turns are short, warm, single-purpose questions, so `low` has to
    // be set explicitly to get it.
    thinking: { type: 'adaptive' },
    output_config: { effort: 'low' },
    messages,
  });

  const text = response.content
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('')
    .trim();

  if (!text) return { status: 502, body: { error: 'Empty response.' } };
  return { status: 200, body: { content: text } };
}

async function classify(messages: Turn[], client: ModelClient): Promise<ConverseResult> {
  // Structured outputs, not a forced tool call: `tool_choice` of "any" or
  // "tool" returns HTTP 400 on current models.
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 1024,
    system: systemBlocks(),
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'low',
      format: DIAGNOSIS_FORMAT,
    },
    messages: [...messages, { role: 'user', content: CLASSIFY_INSTRUCTION }],
  });

  const result = DiagnosisSchema.safeParse(response.parsed_output);
  if (!result.success) {
    return { status: 502, body: { error: 'Classification failed.' } };
  }

  const d = result.data;
  return {
    status: 200,
    body: {
      diagnosis: {
        ...d,
        // Belt and braces: the schema permits any array length, so the
        // two-threat rule is enforced here as well as at assembly.
        threats: d.threats.slice(0, 2),
        rationale: d.rationale.slice(0, 600),
      },
    },
  };
}

/** Built once: the schema never changes, and conversion is not free. */
const DIAGNOSIS_FORMAT = zodOutputFormat(DiagnosisSchema);

function mapError(err: unknown): ConverseResult {
  const status = (err as { status?: number })?.status;

  if (status === 429) {
    return { status: 429, body: { error: 'Upstream rate limit.' }, retryAfter: 5 };
  }
  if (status === 529 || status === 503) {
    return { status: 503, body: { error: 'Upstream overloaded.' }, retryAfter: 3 };
  }
  // Everything else is ours to own, and the client falls back either way.
  return { status: 502, body: { error: 'Upstream error.' } };
}
