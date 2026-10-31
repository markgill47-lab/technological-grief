/**
 * Sliding-window rate limiter.
 *
 * In-memory, so it is per-instance. Serverless containers are ephemeral and
 * there may be several at once, which means the effective limit is looser
 * than the numbers below — this raises the cost of abuse rather than making
 * it impossible. That is the right trade for a public tool with no accounts:
 * a shared store (KV, Redis, Durable Object) would be stricter, and is the
 * upgrade path if abuse actually materialises.
 *
 * Documented rather than silently approximate.
 */

export interface Window {
  /** Max requests allowed in the window. */
  limit: number;
  /** Window length in milliseconds. */
  ms: number;
}

/** Roughly three honest sessions per ten minutes. */
export const WINDOWS: Window[] = [
  { limit: 20, ms: 10 * 60_000 },
  { limit: 120, ms: 60 * 60_000 },
];

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller may retry. Only meaningful when blocked. */
  retryAfter: number;
}

export class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly windows: Window[] = WINDOWS,
    private readonly maxKeys = 10_000,
  ) {}

  check(key: string, now: number): RateLimitResult {
    const longest = Math.max(...this.windows.map((w) => w.ms));
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < longest);

    for (const w of this.windows) {
      const inWindow = recent.filter((t) => now - t < w.ms);
      if (inWindow.length >= w.limit) {
        const oldest = Math.min(...inWindow);
        return {
          allowed: false,
          retryAfter: Math.ceil((w.ms - (now - oldest)) / 1000),
        };
      }
    }

    recent.push(now);
    this.hits.set(key, recent);

    // Bound memory: a long-lived instance must not accumulate keys forever.
    if (this.hits.size > this.maxKeys) this.evict(now, longest);

    return { allowed: true, retryAfter: 0 };
  }

  private evict(now: number, longest: number): void {
    for (const [key, times] of this.hits) {
      if (times.every((t) => now - t >= longest)) this.hits.delete(key);
    }
    // Still over budget means genuine concurrent load, not stale entries.
    if (this.hits.size > this.maxKeys) {
      const excess = this.hits.size - this.maxKeys;
      let i = 0;
      for (const key of this.hits.keys()) {
        if (i++ >= excess) break;
        this.hits.delete(key);
      }
    }
  }

  /** Test seam. */
  reset(): void {
    this.hits.clear();
  }
}
