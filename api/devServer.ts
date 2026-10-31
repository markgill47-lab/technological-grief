import { loadEnv, type Connect, type Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Serves /api/converse during `vite dev`, so the Conversation path can be
 * exercised locally exactly as it behaves in production.
 *
 * Without this the dev server 404s the endpoint, the availability probe
 * fails, and the path silently disappears — which looks identical to a
 * deliberate static-only deployment and is very easy to misread as a bug in
 * the client.
 */
export function apiDevServer(): Plugin {
  return {
    name: 'grief-api-dev',

    config(_, { mode }) {
      // Vite loads .env into import.meta.env for the CLIENT, and only for
      // VITE_-prefixed names. The handler runs in Node and reads
      // process.env.ANTHROPIC_API_KEY — deliberately unprefixed, so it can
      // never reach the bundle. Without this bridge the key in a local .env
      // is invisible to the dev middleware and the Conversation path cannot
      // be run locally at all.
      const env = loadEnv(mode, process.cwd(), '');
      if (env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY) {
        process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
      }
      return undefined;
    },

    configureServer(server) {
      server.middlewares.use('/api/converse', async (req, res, next) => {
        try {
          await serve(req, res);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[api] handler threw:', (err as Error).message);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ error: 'Handler error.' }));
          } else {
            next(err as Error);
          }
        }
      });
    },
  };
}

async function serve(
  req: Connect.IncomingMessage & IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  // Imported lazily so a missing key or SDK does not break `vite dev` for
  // everything else.
  const { default: handler } = await import('./converse');

  const body = req.method === 'POST' ? await readJson(req) : undefined;

  const shim = {
    _status: 200,
    status(code: number) {
      this._status = code;
      return this;
    },
    setHeader(name: string, value: string) {
      res.setHeader(name, value);
    },
    json(payload: unknown) {
      res.statusCode = this._status;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(payload));
    },
    end() {
      res.statusCode = this._status;
      res.end();
    },
  };

  await handler(
    {
      method: req.method,
      body,
      headers: req.headers as Record<string, string | string[] | undefined>,
      socket: { remoteAddress: req.socket?.remoteAddress },
    },
    shim,
  );
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: Buffer | string) => {
      raw += chunk;
      // Hard stop well above the handler's own 8,000-character cap.
      if (raw.length > 100_000) raw = raw.slice(0, 100_000);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(undefined);
      }
    });
  });
}
