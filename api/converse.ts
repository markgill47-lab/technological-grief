import Anthropic from '@anthropic-ai/sdk';
import { handleConverse, type ModelClient } from './_handler';
import { RateLimiter } from './_rateLimit';

/**
 * Serverless entry point. Vercel-style (req, res) signature, typed
 * structurally so this needs no @vercel/node dependency.
 *
 * The key is read from ANTHROPIC_API_KEY — server-side, unprefixed. A
 * VITE_-prefixed name would be inlined into the client bundle, which is
 * exactly how v1's design leaked it.
 */

interface Req {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}

interface Res {
  status(code: number): Res;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
  end(): void;
}

// Module scope, so the window survives across invocations on a warm instance.
const limiter = new RateLimiter();

let client: ModelClient | null = null;
function getClient(): ModelClient {
  if (!client) client = new Anthropic() as unknown as ModelClient;
  return client;
}

export function clientKeyFrom(req: Req): string {
  const forwarded = req.headers['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return (first?.split(',')[0] ?? req.socket?.remoteAddress ?? 'unknown').trim();
}

export default async function handler(req: Req, res: Res): Promise<void> {
  // Availability probe. The client hides the Conversation path entirely when
  // this is not 200, rather than offering a button that fails.
  if (req.method === 'HEAD') {
    res.status(process.env.ANTHROPIC_API_KEY ? 200 : 404).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: 'Conversation is not configured.' });
    return;
  }

  const started = Date.now();
  const result = await handleConverse(req.body, clientKeyFrom(req), {
    client: getClient(),
    limiter,
  });

  if ('retryAfter' in result && result.retryAfter) {
    res.setHeader('Retry-After', String(result.retryAfter));
  }

  // Shape, status and latency only — never the body, and never the client
  // key. Most platform loggers capture request bodies on the error path by
  // default, so the useful signal has to be logged explicitly and narrowly
  // rather than left to the default. Without this a failing deployment is
  // completely silent, which is its own kind of unoperable.
  const kind = (req.body as { classify?: boolean })?.classify ? 'classify' : 'turn';
  // eslint-disable-next-line no-console
  console.log(`[converse] ${kind} ${result.status} ${Date.now() - started}ms`);

  res.status(result.status).json(result.body);
}
