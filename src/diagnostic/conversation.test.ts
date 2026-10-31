import { describe, expect, it, vi } from 'vitest';
import {
  ConversationUnavailable,
  atTurnCap,
  classify,
  nextTurn,
  probeProxy,
  validateDiagnosis,
  type Turn,
} from './conversation';
import { computeGap } from '../domain/gap';

const noSleep = async () => {};
const TURNS: Turn[] = [{ role: 'user', content: 'I teach composition.' }];

function res(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

const VALID = {
  stage: 'discomfort',
  stageConfidence: 'high',
  transitionToward: null,
  domain: 'teaching',
  threats: ['verification'],
  rogers: 'early_majority',
  rationale: 'You said you had been to a session but not tried anything yet.',
  signalConflict: false,
  ethicalPosition: false,
};

describe('transport', () => {
  it('I-01 returns the assistant turn on success', async () => {
    const f = vi.fn(async () => res(200, { content: 'What have you tried?' }));
    await expect(nextTurn(TURNS, f as never, noSleep)).resolves.toBe('What have you tried?');
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('I-02 retries a 429 and succeeds', async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce(res(429, { error: 'slow down' }, { 'retry-after': '1' }))
      .mockResolvedValueOnce(res(429, { error: 'slow down' }))
      .mockResolvedValueOnce(res(200, { content: 'ok' }));
    await expect(nextTurn(TURNS, f as never, noSleep)).resolves.toBe('ok');
    expect(f).toHaveBeenCalledTimes(3);
  });

  it('I-03 gives up after three 429s', async () => {
    const f = vi.fn(async () => res(429, { error: 'slow down' }));
    await expect(nextTurn(TURNS, f as never, noSleep)).rejects.toBeInstanceOf(
      ConversationUnavailable,
    );
    expect(f).toHaveBeenCalledTimes(3);
  });

  it('I-04 retries a 503', async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce(res(503, { error: 'overloaded' }))
      .mockResolvedValueOnce(res(200, { content: 'ok' }));
    await expect(nextTurn(TURNS, f as never, noSleep)).resolves.toBe('ok');
  });

  it('I-05 does not retry a 500', async () => {
    const f = vi.fn(async () => res(500, { error: 'boom' }));
    await expect(nextTurn(TURNS, f as never, noSleep)).rejects.toBeInstanceOf(
      ConversationUnavailable,
    );
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('does not retry a 400 — it will not become a 200', async () => {
    const f = vi.fn(async () => res(400, { error: 'too long' }));
    await expect(nextTurn(TURNS, f as never, noSleep)).rejects.toBeInstanceOf(
      ConversationUnavailable,
    );
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('I-06 retries a timeout once, then gives up', async () => {
    const f = vi.fn(async () => {
      throw new DOMException('timed out', 'TimeoutError');
    });
    await expect(nextTurn(TURNS, f as never, noSleep)).rejects.toBeInstanceOf(
      ConversationUnavailable,
    );
    expect(f).toHaveBeenCalledTimes(3);
  });

  it('does not retry a hard network failure', async () => {
    const f = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(nextTurn(TURNS, f as never, noSleep)).rejects.toBeInstanceOf(
      ConversationUnavailable,
    );
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('I-07 rejects malformed JSON', async () => {
    const f = vi.fn(async () => new Response('not json', { status: 200 }));
    await expect(nextTurn(TURNS, f as never, noSleep)).rejects.toBeTruthy();
  });

  it('rejects an empty completion', async () => {
    const f = vi.fn(async () => res(200, { content: '   ' }));
    await expect(nextTurn(TURNS, f as never, noSleep)).rejects.toBeInstanceOf(
      ConversationUnavailable,
    );
  });

  it('I-15 reports an unconfigured proxy as unavailable', async () => {
    const f = vi.fn(async () => new Response(null, { status: 404 }));
    await expect(probeProxy(f as never)).resolves.toBe(false);
    const ok = vi.fn(async () => new Response(null, { status: 200 }));
    await expect(probeProxy(ok as never)).resolves.toBe(true);
  });

  it('treats a probe that throws as unavailable', async () => {
    const f = vi.fn(async () => {
      throw new Error('offline');
    });
    await expect(probeProxy(f as never)).resolves.toBe(false);
  });
});

describe('diagnosis validation', () => {
  it('accepts a well-formed diagnosis', () => {
    const d = validateDiagnosis(VALID);
    expect(d.stage).toBe('discomfort');
    expect(d.path).toBe('conversation');
    expect(d.threats).toEqual(['verification']);
  });

  it('I-12 ignores a model-supplied gap and recomputes it', () => {
    const d = validateDiagnosis({ ...VALID, gap: 99 });
    expect(d.gap).toBe(computeGap('discomfort', 'teaching'));
    expect(d.gap).toBe(0.1);
  });

  it('I-08 rejects an unknown stage', () => {
    expect(() => validateDiagnosis({ ...VALID, stage: 'bargaining' })).toThrow(
      ConversationUnavailable,
    );
  });

  it('I-09 rejects an unknown domain', () => {
    expect(() => validateDiagnosis({ ...VALID, domain: 'general' })).toThrow(
      ConversationUnavailable,
    );
  });

  it('I-10 drops unrecognised threats and keeps the rest', () => {
    const d = validateDiagnosis({ ...VALID, threats: ['nonsense', 'economic'] });
    expect(d.threats).toEqual(['economic']);
  });

  it('rejects a diagnosis with no usable threat', () => {
    expect(() => validateDiagnosis({ ...VALID, threats: ['nonsense'] })).toThrow(
      ConversationUnavailable,
    );
    expect(() => validateDiagnosis({ ...VALID, threats: [] })).toThrow(
      ConversationUnavailable,
    );
  });

  it('I-11 omits the pace note for an unknown Rogers position', () => {
    const d = validateDiagnosis({ ...VALID, rogers: 'enthusiast' });
    expect(d.rogers).toBeNull();
  });

  it('I-13 truncates an overlong rationale', () => {
    const d = validateDiagnosis({ ...VALID, rationale: 'y'.repeat(5000) });
    expect(d.rationale).toHaveLength(600);
  });

  it('I-14 strips markup from the rationale', () => {
    const d = validateDiagnosis({
      ...VALID,
      rationale: 'You said <img src=x onerror=alert(1)> this.',
    });
    expect(d.rationale).not.toContain('<');
    expect(d.rationale).toContain('You said');
  });

  it('falls back to low confidence rather than trusting a bad value', () => {
    expect(validateDiagnosis({ ...VALID, stageConfidence: 'certain' }).stageConfidence).toBe(
      'low',
    );
  });

  it('caps threats at two', () => {
    const d = validateDiagnosis({
      ...VALID,
      threats: ['economic', 'ethical', 'verification'],
    });
    expect(d.threats).toHaveLength(2);
  });

  it('marks an ethical position from either signal', () => {
    expect(validateDiagnosis({ ...VALID, ethicalPosition: true }).ethicalPosition).toBe(
      'primary',
    );
    expect(validateDiagnosis({ ...VALID, threats: ['ethical'] }).ethicalPosition).toBe(
      'primary',
    );
    expect(validateDiagnosis(VALID).ethicalPosition).toBeNull();
  });

  it('rejects a non-object', () => {
    for (const bad of [null, undefined, 'x', 42, []]) {
      expect(() => validateDiagnosis(bad)).toThrow();
    }
  });

  it('round-trips through classify()', async () => {
    const f = vi.fn(async () => res(200, { diagnosis: VALID }));
    const d = await classify(TURNS, f as never, noSleep);
    expect(d.stage).toBe('discomfort');
    expect(d.gap).toBe(0.1);
  });
});

describe('turn cap', () => {
  it('counts user turns only', () => {
    const t: Turn[] = [];
    for (let i = 0; i < 7; i++) {
      t.push({ role: 'assistant', content: 'q' }, { role: 'user', content: 'a' });
    }
    expect(atTurnCap(t)).toBe(false);
    t.push({ role: 'assistant', content: 'q' }, { role: 'user', content: 'a' });
    expect(atTurnCap(t)).toBe(true);
  });
});
