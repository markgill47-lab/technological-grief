# Software Design Document

**Version**: 2.0
**Last updated**: 2026-10-31
**Status**: Draft for review

---

## 1. Summary

### 1.1 Purpose

Architecture and implementation strategy for the Technological Grief Interactive — an educational and reflective tool that helps users locate themselves in the Change Grief Cycle relative to AI adoption.

### 1.2 Modes

- **Explore** — navigate the six stages. Static content, assembled from authored blocks. Zero network calls.
- **Diagnose** — locate the user's stage, via one of two paths:
  - **Quick**: six multiple-choice questions, deterministic client-side scoring, zero network calls.
  - **Conversation**: adaptive dialogue, ~6 model calls through a proxy, ending in one structured-output classification.

### 1.3 Requirements

- Single-page application; no accounts, no server-side user data
- **Fully functional with no Anthropic API access.** The Conversation path is additive; its absence degrades the feature set, not the product.
- Session-scoped state only (sessionStorage), plus client-side export
- Responsive: phone through desktop
- WCAG 2.1 AA

### 1.4 What changed from v1

| | v1 | v2 |
|---|---|---|
| Explore content | Generated live per stage click | Static, bundled, assembled from blocks |
| API calls per session | ~8–12 | 0 (Quick) or ~6 (Conversation) |
| Anthropic SDK location | Browser bundle | Server proxy only |
| API key | `VITE_ANTHROPIC_API_KEY` in client | Never leaves the proxy |
| UI control | 4 Claude-callable tools | None — the app owns its own UI |
| Diagnosis mechanism | Forced `tool_choice` | Structured outputs |
| Model | `claude-sonnet-4-20250514` | `claude-opus-5-5` |
| Works offline | No | Yes, except Conversation |

See [README.md](README.md) for the full rationale on each.

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          Browser                                  │
│                                                                   │
│   ┌────────────────┐   ┌──────────────┐   ┌───────────────────┐  │
│   │  Terrain (SVG) │   │ Content Pane │   │ Diagnostic Flow   │  │
│   └───────┬────────┘   └──────┬───────┘   └─────────┬─────────┘  │
│           │                   │                     │             │
│           └───────────┬───────┴─────────────────────┘             │
│                       ▼                                           │
│             ┌──────────────────┐                                  │
│             │   Store (zustand) │                                 │
│             └─────────┬────────┘                                  │
│         ┌─────────────┼──────────────┬──────────────┐             │
│         ▼             ▼              ▼              ▼             │
│  ┌────────────┐ ┌───────────┐ ┌────────────┐ ┌───────────┐       │
│  │  Content   │ │  Quick    │ │ Conversation│ │  Export   │       │
│  │  Assembler │ │  Scorer   │ │   Client    │ │  (md/print)│      │
│  │  (pure)    │ │  (pure)   │ │             │ │           │       │
│  └─────┬──────┘ └───────────┘ └──────┬──────┘ └───────────┘       │
│        │                             │                            │
│  ┌─────▼──────────────────┐          │                            │
│  │ Content blocks         │          │                            │
│  │ (bundled TS modules)   │          │                            │
│  └────────────────────────┘          │                            │
│                                       │ HTTPS, same-origin         │
└───────────────────────────────────────┼────────────────────────────┘
                                        ▼
                        ┌───────────────────────────────┐
                        │  Serverless proxy              │
                        │  /api/converse                 │
                        │  • holds the API key           │
                        │  • rate limits per IP          │
                        │  • logs no request bodies      │
                        │  OPTIONAL — absent is fine     │
                        └───────────────┬───────────────┘
                                        ▼
                             ┌─────────────────────┐
                             │  Anthropic Messages  │
                             └─────────────────────┘
```

Everything left of the proxy boundary works with no network. The dashed dependency is the point of the architecture.

### 2.1 Stack

**Client**
- React 19 + TypeScript 5.7
- Vite 6
- Zustand 5 — session state
- **Plain CSS with custom properties** — no Tailwind
- No animation library. The reveal sequence ([ui-specification.md](ui-specification.md) §7.2) is a handful of CSS transitions; v1's Framer Motion dependency buys nothing here and costs ~34KB gzipped.
- **No `@anthropic-ai/sdk`.** It must not appear in `package.json` `dependencies`. See §7.1.

> **Changed during implementation.** This specified Tailwind 4. The design is already expressed as CSS custom properties ([ui-specification.md](ui-specification.md) §6), and the interface is one SVG graphic — where Tailwind does not apply — plus a single prose column with about ten section treatments. That came to ~600 lines of hand-written CSS, 3.1KB gzipped, against a build-tool dependency that would have earned nothing. Recorded here rather than left as a silent divergence.

**Test tooling**: Vitest **3**, not 2. Vitest 2 bundles its own Vite 5, which type-conflicts with Vite 6 in the same tree; Vitest 3 dedupes onto Vite 6.

**Proxy** (optional)
- A single serverless function — Vercel, Netlify, or Cloudflare Workers
- `@anthropic-ai/sdk` lives here and only here

**Tooling**
- Vitest — unit and integration
- Playwright — E2E
- ESLint + Prettier
- `axe-core` via `@axe-core/playwright`

### 2.2 Why Zustand survived the rewrite

With Explore mode now synchronous and pure, the store holds very little: current mode, selected stage, the diagnosis, and survey progress. A `useReducer` in context would do. Zustand is retained because the terrain subscribes to a narrow slice (position, confidence, gap) and re-renders on nothing else, and selector-based subscription is the thing it does well. It is a 1.2KB dependency doing real work.

---

## 3. Components

```
App
├── Terrain                       SVG, subscribes to {stage, confidence, gap, domain}
│   ├── Ridge                     generated path
│   ├── TrailBand                 variable-width fill
│   ├── RegressionPath
│   ├── SaddleGlow                only when stage === 'discomfort'
│   ├── Station ×6
│   ├── UncertaintyBand
│   ├── YouMarker
│   ├── FieldMarker
│   ├── GapSpan
│   └── TextView                  the a11y table alternative
├── Controls
│   ├── ModeToggle
│   ├── SessionReset
│   └── PrivacyBadge
└── ContentPane
    ├── ExploreView
    │   ├── StageHeader
    │   ├── Breadcrumb            no wrap at the ends
    │   ├── AssembledContent      renders the block stack
    │   └── ExperienceTable
    └── DiagnoseView
        ├── WelcomeScreen
        ├── PathChoice            Conversation card hidden with no proxy
        ├── QuickSurvey
        │   └── QuestionScreen
        ├── ConversationSurvey
        │   └── Transcript
        └── DiagnosisResult
            ├── AccuracyPrompt
            └── ExportButton
```

### 3.1 Key interfaces

```typescript
interface TerrainProps {
  stage: Stage | null;
  confidence: Confidence | null;
  transitionToward: Stage | null;
  gap: number | null;
  domain: Domain | null;
  mode: Mode;
  onStageSelect?: (s: Stage) => void;
  revealing: boolean;
}

interface AssembledContentProps {
  stage: Stage;
  diagnosis: Diagnosis | null;   // null = anonymous browse, core only
}
```

`Terrain` is a pure function of its props. It holds no state except the memoized path-length table ([ui-specification.md](ui-specification.md) §4.5).

---

## 4. State

```typescript
interface AppState {
  mode: Mode;                          // 'explore' | 'diagnose'
  selectedStage: Stage | null;
  diagnosis: Diagnosis | null;

  survey: {
    path: 'quick' | 'conversation' | null;
    quickAnswers: Partial<QuickAnswers>;
    quickIndex: number;                // 0..5
    transcript: Turn[];
    status: 'idle' | 'asking' | 'thinking' | 'classifying' | 'done' | 'failed';
  };

  reveal: { active: boolean; startedAt: number | null };
  proxyAvailable: boolean;             // probed once at mount

  setMode(m: Mode): void;
  selectStage(s: Stage): void;
  answerQuick<K extends keyof QuickAnswers>(k: K, v: QuickAnswers[K]): void;
  backQuick(): void;
  submitQuick(): void;                 // runs scoreQuick, pure
  sendTurn(text: string): Promise<void>;
  acceptDiagnosis(d: Diagnosis): void;
  resetSession(): void;
}
```

### 4.1 Persistence

`sessionStorage` only, under one key (`tgi.session.v2`), holding `{mode, selectedStage, diagnosis, survey}`. The transcript is included so a refresh mid-conversation does not lose it.

Cleared on: tab close (by the browser), `Start fresh`, and a schema-version mismatch on read. No inactivity timeout — v1 proposed 30 minutes, which would discard someone's diagnosis while they read it in another tab.

**Never `localStorage`.** Enforced by an ESLint rule (`no-restricted-globals`) rather than by convention.

### 4.2 URL state

`#/explore/<stage>` and `#/diagnose`. Stage selections are linkable and the back button works. The diagnosis is never in the URL — it would survive in history and in anything that logs referrers.

Three pieces are required and only the first is obvious:

1. **Write** on every mode or stage change, with `history.pushState`. Not `replaceState`: that creates no history entry, so the back button cannot work.
2. **Read back** on `popstate` (back/forward) and `hashchange` (a hash typed or pasted into the address bar). `pushState` fires neither, so there is no feedback loop with the write.
3. **Parse** through one pure function (`parseHash`), which rejects an unknown stage rather than guessing, and is unit-tested without a document.

> **Found during implementation.** The first cut wrote the hash and never read it. Deep links worked only on a cold load, in-app hash changes did nothing, and the back button was inert — while this document already claimed both were supported. Browser-testing the claim is what surfaced it; no unit test would have, since the defect was the absence of a listener.

A deep link wins over the restored session: if someone opens `#/explore/doubt`, that is the page they asked for.

---

## 5. Model integration

Only the Conversation path. Only through the proxy.

### 5.1 Model

```typescript
const MODEL = 'claude-opus-5-5';
```

v1 specified `claude-sonnet-4-20250514`, which was current in January 2026.

### 5.2 Request shape

```typescript
// Conversation turn
{
  model: MODEL,
  max_tokens: 512,
  system: [{
    type: 'text',
    text: SYSTEM_PROMPT,                   // framework doc + diagnostic instructions
    cache_control: { type: 'ephemeral' },  // stable prefix, ~8K tokens
  }],
  thinking: { type: 'adaptive' },
  output_config: { effort: 'low' },
  messages: transcript,
}
```

Notes on each, because three of these are places v1 would now fail:

- **`cache_control` on the system block.** The system prompt is ~8K stable tokens re-sent every turn. Cached, turns 2–6 read it at the cache rate instead of the input rate — roughly a 4× saving on the dominant cost component. The prompt must be byte-identical across turns: no timestamps, no session ids, nothing interpolated.
- **`thinking: {type: 'adaptive'}`.** `budget_tokens` now returns **400**. On this model thinking also cannot be disabled, so depth is controlled by `effort` alone.
- **`effort: 'low'`.** The default on `claude-opus-5-5` is `medium`. These turns are short, warm, single-purpose questions; `low` is both sufficient and cheaper, and it must be set explicitly to get it.
- **No `temperature`.** Sampling parameters return 400 on current models.
- **No assistant prefill.** Returns 400.

### 5.3 Classification

One call at the end of the conversation, using structured outputs.

```typescript
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';

const DiagnosisSchema = z.object({
  stage:            z.enum(STAGES),
  stageConfidence:  z.enum(['high', 'moderate', 'low']),
  transitionToward: z.enum(STAGES).nullable(),
  domain:           z.enum(DOMAINS),
  threats:          z.array(z.enum(THREATS)),
  rogers:           z.enum(ROGERS),
  rationale:        z.string(),
  signalConflict:   z.boolean(),
  ethicalPosition:  z.boolean(),
});

const DIAGNOSIS_FORMAT = zodOutputFormat(DiagnosisSchema);   // built once

await client.messages.parse({
  model: MODEL,
  max_tokens: 1024,
  system: [{ type: 'text', text: SYSTEM_PROMPT,
             cache_control: { type: 'ephemeral' } }],
  thinking: { type: 'adaptive' },
  output_config: { effort: 'low', format: DIAGNOSIS_FORMAT },
  messages: [...transcript, { role: 'user', content: CLASSIFY_INSTRUCTION }],
});
// → response.parsed_output, which is null when parsing failed. Guard it.
```

> **Corrected during implementation.** This specified a hand-written
> `{ type: 'json_schema', schema }` object. The documented TypeScript path is
> `zodOutputFormat(schema)` passed to `messages.parse()`, which also returns a
> parsed, typed `parsed_output` instead of text to deserialize. Array
> `min`/`max` constraints are not relied on to survive schema conversion, so
> the two-threat rule is enforced in code — at the proxy and again at assembly.

> **This is the single most important correction in v2.** v1 planned to force a diagnosis with `tool_choice: {type: 'tool', name: '...'}`. On current models **forced tool choice returns HTTP 400** — both `{type: 'any'}` and `{type: 'tool', name}` have been removed. v1's diagnostic path would not run at all.
>
> Structured outputs are also the better mechanism independently: schema-validated output, no tool round trip, no tool-result message to append.

Note `gap` is absent from the schema. It is always computed client-side from the domain and stage ([survey-methodology.md](survey-methodology.md) §4.6).

### 5.4 Cost

Per Conversation session: ~8K cached system prompt, 6 turns, ~1,050 output tokens total.

| Model | Input / Output per MTok | **Per session** | 1,000 sessions/mo |
|---|---|---|---|
| `claude-opus-5-5` *(default)* | $4.00 / $20.00 | **~$0.08** | ~$83 |
| `claude-sonnet-5-5` | $2.00 / $10.00 | ~$0.05 | ~$46 |
| `claude-haiku-5-5` | $0.10 / $0.50 | ~$0.002* | ~$2 |

\* Haiku cache-read rate not confirmed from first-party pricing at time of writing; the figure assumes the standard 0.1× ratio. Verify before relying on it.

**Quick path: $0.00, always.** It is the default path, so the realistic bill is driven by what fraction of users choose Conversation — expected to be a minority, since Quick is presented first and is sufficient.

Model choice is the project owner's call and is a one-line change. Opus 5.5 is the default because this is a conversation about someone's professional identity conducted in roughly six sentences, where tone and the ability to hear what someone is actually saying are the entire product. That said, this is a well-bounded classification-and-rephrasing task with a detailed framework in context — a strong candidate for a cheaper model if a side-by-side on real transcripts shows no quality difference. Worth measuring rather than assuming in either direction.

### 5.5 Error handling

```typescript
async function callProxy(body: ProxyRequest): Promise<ProxyResponse> {
  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch('/api/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });

      if (res.ok) return await res.json();

      // 429 / 529 are the retryable ones.
      if (res.status === 429 || res.status === 529) {
        const retryAfter = Number(res.headers.get('retry-after')) * 1000;
        await sleep(retryAfter || 1000 * 2 ** attempt);
        continue;
      }
      throw new ProxyError(res.status);           // 4xx — do not retry
    } catch (e) {
      if (e instanceof DOMException && e.name === 'TimeoutError' &&
          attempt < MAX_ATTEMPTS) continue;
      throw e;
    }
  }
  throw new ProxyExhausted();
}
```

**Every failure falls back to the Quick path**, carrying over whatever was already gathered:

> Something went wrong on my end. Rather than make you start over — here are six quick questions instead. They stay entirely in your browser.

This is the structural payoff of having a zero-dependency path: there is no error state in which the user is simply stuck. v1 had no such fallback, so every API failure was a dead end in the product's primary feature.

### 5.6 System prompt

**Generated** at build time from [grief-framework-context.md](grief-framework-context.md) plus diagnostic instructions, by `scripts/build-system-prompt.mjs` into `api/_system-prompt.ts` (~7,600 tokens). The output is committed, so the serverless function does not depend on `specs/` being present in the deployment, and a test fails if the committed prompt no longer matches the document — the framework stays a single source of truth rather than being hand-copied into a second one that drifts.

The generator strips the document's housekeeping sections and **all** cross-document references — markdown links, `(see foo.md)` parentheticals, and bare filenames alike — so the model is never invited to cite a spec filename at the user.

Byte-stable, so it caches. Nothing is interpolated at request time, and `_system-prompt.test.ts` asserts the absence of timestamps and template markers for exactly that reason.

```
You are conducting a brief, warm conversation to help someone locate
themselves in the Change Grief Cycle with respect to AI in their work.

<framework>
{{ grief-framework-context.md }}
</framework>

Conduct 5-8 turns. One question at a time. Short — two or three sentences.
Adapt to what they say; do not work through a fixed list.

You are establishing four things:
  - stage (six stages; behavior outranks emotion outranks self-report)
  - domain (exactly one of five)
  - threat (one or two of seven)
  - Rogers position

Rules:
- Never diagnose an ethical objection as a stage symptom. Framework section 7.1.
- Attended training but tried nothing is near-conclusive for Discomfort.
- Stop early if Stage 1 is clear by turn 4. Further questions read as interrogation.
- If someone describes distress beyond work frustration, reproduce this text
  exactly, and then stop: "{{ DISTRESS_TEXT }}"
- Never claim anything is saved. Nothing is.
- Do not mention stage names or the framework during questioning. It biases
  the answers and it is not a quiz about a model.
```

The last rule matters more than it looks. A user told they are "probably in Discomfort" at turn 3 will answer turn 4 as a person in Discomfort.

### 5.7 Proxy

```
POST /api/converse
  body: { messages: Turn[], classify?: boolean }
  → { content: string } | { diagnosis: Diagnosis }
```

Responsibilities, in priority order:

1. **Hold the API key.** `ANTHROPIC_API_KEY` as a server-side env var. Never a `VITE_`-prefixed name — that prefix is what puts a value into the client bundle, which is exactly how v1's design leaked it.
2. **Build the request.** The client sends only turns. Model, system prompt, effort, and schema are all server-side, so a crafted client cannot change the model, enlarge `max_tokens`, or replace the system prompt.
3. **Rate limit.** 20 requests per IP per 10 minutes, 120 per hour — roughly three honest sessions per 10 minutes. The window is **in-memory and therefore per-instance**: serverless containers are ephemeral and several may run at once, so the effective limit is looser than those numbers. This raises the cost of abuse rather than making it impossible, which is the right trade for a public tool with no accounts. A shared store (KV, Redis, a Durable Object) is the upgrade path if abuse actually materialises. Stated here rather than left as a silently approximate guarantee.
4. **Cap input.** Reject transcripts over 12 turns or 8,000 characters total — the flow never produces more, so anything larger is abuse.
5. **Log nothing from the body** — but do log. One line per request carrying request shape, status and latency (`[converse] turn 502 205ms`), and nothing else: never messages, never the diagnosis, never the client key. This has to be explicit in the handler on both counts. Most platform loggers capture request bodies on the error path by default, and a handler that catches everything and logs nothing leaves a failing deployment completely silent, which is its own kind of unoperable.
6. **Same-origin only.** No CORS headers; the proxy is deployed alongside the app.
7. **Answer the availability probe.** `HEAD /api/converse` returns 200 with a key configured and 404 without, which is what hides the Conversation card rather than offering a button that fails.

#### Running it locally

Vite loads `.env` into `import.meta.env` for the **client**, and only for `VITE_`-prefixed names. The handler runs in Node and reads `process.env.ANTHROPIC_API_KEY` — deliberately unprefixed so it can never reach the bundle. Those two facts together mean a key in a local `.env` is invisible to the dev middleware, and the Conversation path cannot be exercised locally at all.

The dev-server plugin therefore bridges the two explicitly, via `loadEnv` in its `config` hook. Without it the endpoint 404s in development, the probe fails, and the path silently disappears — which looks identical to a deliberate static-only deployment and is very easy to misread as a client bug.

---

## 6. Data models

```typescript
type Stage = 'loss' | 'doubt' | 'discomfort'
           | 'discovery' | 'understanding' | 'integration';

type Domain = 'teaching' | 'craft' | 'analysis' | 'building' | 'coordination';

type ThreatId = 'skills_obsolescence' | 'identity_authority' | 'verification'
              | 'authenticity_quality' | 'economic' | 'ethical' | 'control_opacity';

type RogersPosition = 'innovator' | 'early_adopter' | 'early_majority'
                    | 'late_majority' | 'laggard';

type Confidence = 'high' | 'moderate' | 'low';
type Mode = 'explore' | 'diagnose';

interface StageData {
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

interface Diagnosis {
  stage: Stage;
  stageConfidence: Confidence;
  transitionToward: Stage | null;
  domain: Domain;
  threats: ThreatId[];              // ordered, primary first, length 1-2
  /** Null when unknown, which omits the pace note instead of guessing one. */
  rogers: RogersPosition | null;
  gap: number;                      // signed, stations. Always computed locally.
  signalConflict: boolean;
  ethicalPosition: 'primary' | null;
  rationale?: string;               // Conversation path only
  path: 'quick' | 'conversation';
}

interface Turn {
  role: 'user' | 'assistant';
  content: string;
}
```

### 6.1 Stage configuration

```typescript
export const STAGES: Record<Stage, StageData> = {
  loss: { id: 'loss', name: 'Loss', position: 1,
    emotion: 'Fear', cognition: 'Denial', behavior: 'Withdrawn',
    color: '#C83737', isDangerZone: false, regressionTarget: null },

  doubt: { id: 'doubt', name: 'Doubt', position: 2,
    emotion: 'Resentment', cognition: 'Skeptical', behavior: 'Defensive',
    color: '#B83A4B', isDangerZone: false, regressionTarget: null },

  // The Danger Zone. Stage 3 only — see framework §2.1 for why v1's
  // three conflicting definitions were settled this way.
  discomfort: { id: 'discomfort', name: 'Discomfort', position: 3,
    emotion: 'Anxiety', cognition: 'Confused', behavior: 'Unproductive',
    color: '#E8A547', isDangerZone: true, regressionTarget: 'doubt' },

  discovery: { id: 'discovery', name: 'Discovery', position: 4,
    emotion: 'Anticipation', cognition: 'Resourceful', behavior: 'Experimental',
    color: '#F4C542', isDangerZone: false, regressionTarget: null },

  understanding: { id: 'understanding', name: 'Understanding', position: 5,
    emotion: 'Confidence', cognition: 'Pragmatic', behavior: 'Productive',
    color: '#4A9B8E', isDangerZone: false, regressionTarget: null },

  integration: { id: 'integration', name: 'Integration', position: 6,
    emotion: 'Satisfaction', cognition: 'Flexible', behavior: 'Generous',
    color: '#2F6B5D', isDangerZone: false, regressionTarget: null },
};

/** Where each field sits, 1-6. OPEN ITEM — see framework §5.3. */
export const FIELD_POSITION: Record<Domain, number> = {
  building: 5.0,
  craft: 4.2,
  analysis: 3.8,
  teaching: 3.1,
  coordination: 2.4,
};
```

---

## 7. Security and privacy

### 7.1 API key

v1 contradicted itself: §5.1 constructed an `Anthropic` client in the browser with `VITE_ANTHROPIC_API_KEY`, while §7.1 asserted "No API key exposed to client (if using proxy)" and filed the proxy under "Alternative Architecture."

**There is one architecture.** The key lives on the proxy. The client bundle contains no Anthropic SDK and no key.

Enforced, not merely intended:

- **No file under `src/` imports `@anthropic-ai/sdk`.** Checked by CI, and the check is verified against a deliberate violation so it is known to be capable of failing.
- A CI check greps the built bundle for `sk-ant-` and for `anthropic.com`, and fails on a hit — the same guarantee from the output end.
- `VITE_`-prefixed secrets are banned; the proxy's key is `ANTHROPIC_API_KEY`, unprefixed.
- `connect-src 'self'` means the client cannot reach api.anthropic.com even if code to try were reintroduced.

> **Corrected during implementation.** The original check was "`@anthropic-ai/sdk` is absent from the client `package.json` dependencies." That cannot hold and was never the real guarantee. The SDK has to be a root dependency because the serverless function under `api/` needs it and Vercel's zero-config build resolves `/api` against the root package — and moving it to a workspace would not help either, since npm hoists into root `node_modules` regardless, leaving it importable from `src/` all the same. What actually keeps the key out of the browser is the import graph, so that is what is checked.

### 7.2 Data handling

| Data | Where it lives | Leaves the browser? |
|---|---|---|
| Quick answers | memory + sessionStorage | **Never** |
| Quick diagnosis | memory + sessionStorage | **Never** |
| Conversation turns | memory + sessionStorage | Yes — to the proxy, to Anthropic, unlogged |
| Conversation diagnosis | memory + sessionStorage | Returns from the proxy; not logged |
| Accuracy answer | not stored | Only if opted in, and only as §7 of the survey doc's coarse payload |
| Export file | user's disk | Generated locally; no network call |

The Quick path makes a strong claim honestly: nothing you enter leaves your machine. That claim is the reason it is the default.

### 7.3 Content security

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'self';
  font-src 'self';
  frame-ancestors 'none';
  base-uri 'none';
  form-action 'none'
```

`connect-src 'self'` means the client cannot reach api.anthropic.com even if someone later reintroduces code that tries.

The SVG is authored, not user-supplied, so v1's "SVG sanitization" concern does not apply. What does apply: the `rationale` returned by the model is **rendered as text, never as markup**, and it is length-capped at the schema level and again at validation.

No user text is ever interpolated into authored content ([content-architecture.md](content-architecture.md) §7), which closes the injection path v1's `personalized_context` string opened.

---

## 8. Performance

### 8.1 Where the work went

| Operation | v1 | v2 |
|---|---|---|
| Stage switch | API call, ~2s | Synchronous assembly, <1ms |
| Initial content | API call | Bundled |
| Quick diagnosis | n/a | Pure function, <1ms |
| Conversation turn | ~2s | ~2s |

Explore mode's cost went to zero, because assembling four bundled strings is not an operation that needs optimizing. v1's §8 specified memoization of the wheel, debounced input, and per-session content caching — all of which existed to manage a latency that no longer exists.

### 8.2 Targets

| Metric | Target |
|---|---|
| First contentful paint | <1.2s |
| Time to interactive | <2.0s |
| Stage switch | <50ms, perceptually instant |
| Quick question advance | <50ms |
| Conversation turn | <3s |
| Reveal sequence | 1.5s, 60fps |
| JS bundle, gzipped | <180KB |
| Content blocks, gzipped | <40KB |

### 8.3 Measures that remain

- Route-level code splitting: `DiagnoseView` lazy-loads; a user who only explores never downloads the survey
- The content library is one chunk, imported eagerly — it is small, and it is the thing the app is for
- `Terrain` memoizes the path-length table; everything else is cheap enough to re-render
- Fonts: `font-display: swap`, subset to Latin, self-hosted (so `font-src 'self'` holds)

---

## 9. Testing

Detail in [test-scenarios.md](test-scenarios.md). Shape only here.

### 9.1 What became newly testable

The scoring algorithm is a **pure function** from answers to diagnosis. That means the diagnostic logic — the thing the product is actually judged on — is now exhaustively unit-testable with no mocking, no network, and no model.

```typescript
describe('scoreQuick', () => {
  it('diagnoses Discomfort from training without implementation', () => {
    expect(scoreQuick(FIXTURES.facultyStuck).stage).toBe('discomfort');
  });
  it('weights behavior over emotion on conflict', () => { /* ... */ });
  it('breaks ties toward the earlier stage', () => { /* ... */ });
  it('returns a negative gap for a leader in a lagging field', () => { /* ... */ });
  it('never returns a gap outside [-5, 5]', () => { /* property test */ });
});
```

Under v1 this logic lived inside a model call and could only be evaluated statistically.

### 9.2 Layers

| Layer | Tool | Covers |
|---|---|---|
| Unit | Vitest | Scoring, assembly, gap, variant resolution, path geometry |
| Content validation | Vitest, in CI | All eight checks in [content-architecture.md](content-architecture.md) §5 |
| Component | Vitest + Testing Library | Terrain states, survey flow, keyboard nav |
| Integration | Vitest, mocked proxy | Conversation flow, every failure → Quick fallback |
| E2E | Playwright | Both paths end to end, export, deep links |
| Accessibility | axe-core + manual | Automated on every view; manual screen-reader pass |

### 9.3 The content coverage test

The one that matters most. All 1,050 combinations of (stage, domain, threat, rogers) assemble, with no empty section, no duplicated paragraph, and no heading above nothing. It runs in well under a second and it is what makes adding a content block safe.

---

## 10. Deployment

### 10.1 Build

```bash
npm ci
npm run validate:content     # content checks, fails the build
npm run test
npm run build
npm run check:bundle         # greps for leaked secrets and the Anthropic SDK
```

### 10.2 Hosting

**Static hosting plus one function** — Vercel, Netlify, or Cloudflare Pages. The app is static files; the proxy is one serverless endpoint deployed alongside so that same-origin holds and no CORS is needed.

**Static-only deployment is explicitly supported.** Deploy without the function and the app runs, with the Conversation card hidden. This is a reasonable configuration for an institution that does not want to hold an API key, and it is not a degraded mode so much as a different product tier.

### 10.3 Environment

```env
# Proxy, server-side. Never VITE_-prefixed.
ANTHROPIC_API_KEY=sk-ant-...

# Client, optional
VITE_CONVERSATION_ENABLED=true      # false hides the Conversation path
VITE_METRICS_ENDPOINT=              # empty disables accuracy collection entirely
```

`proxyAvailable` is probed once at mount with a `HEAD /api/converse`, so a misconfigured deployment hides the Conversation path rather than offering a button that fails.

---

## 11. Maintenance

### 11.1 What needs periodic attention

| Item | Cadence | Why |
|---|---|---|
| Field-maturity constants | 6 months | Fields move. They drive the gap, which drives the second marker. |
| Content block review | 12 months | `lastReviewed` warns at build time. |
| Model id and pricing | On release | §5.4 is a point-in-time snapshot. |
| API surface | On release | v1 broke on two parameter removals in nine months. |

### 11.2 The lesson from v1

v1 specified `claude-sonnet-4-20250514`, forced `tool_choice`, and `budget_tokens`. Within nine months the model id was superseded and **both** mechanisms returned HTTP 400. The diagnostic feature would not have run.

The structural response is not more diligent version-watching. It is that the product's core — Explore, and the Quick diagnostic — has **no API surface to break**. API drift can now only disable an optional path that already falls back cleanly.

---

## 12. Not in scope

Deferred, and not specified here:

- **Facilitator / aggregate view.** The framework's intervention strategy is organizational but the application diagnoses individuals. Whether this is the real product is open — see [README.md](README.md) open item 3.
- **Multi-language.** Content blocks are keyed by id, so the architecture permits it; no translation plan exists, and the content's register would need a translator rather than a translation.
- **Longitudinal tracking.** Requires persistent identity, which the privacy model rules out. Genuinely incompatible, not merely unbuilt.
- **Comparison mode** (AI against earlier disruptions). Interesting, unspecified.
- **Resource library.** Would need maintenance commitment beyond this spec.

---

## Revision history

| Version | Date | Changes |
|---|---|---|
| 2.1 | 2026-10-31 | Conversation path implemented. Corrections made against the running code: structured outputs use `zodOutputFormat` + `messages.parse()`, not a hand-written `json_schema` (§5.3); the system prompt is generated from the framework document and committed, with a test guarding drift (§5.6); the S-01 guarantee is import-based rather than dependency-list-based, because the latter cannot hold (§7.1); the rate limiter is per-instance and says so (§5.7); the proxy logs shape, status and latency, because logging nothing at all is unoperable (§5.7); a dev-server bridge is required to run the path locally at all (§5.7); `rogers` is nullable so an unrecognised position omits the pace note rather than guessing (§6). |
| 1.0 | 2026-01-24 | Initial design document |
| 2.0 | 2026-10-31 | Static-first architecture: Explore mode makes no API calls (§1.4). Removed all four Claude-callable UI tools. Replaced forced `tool_choice` with structured outputs (§5.3) — the v1 mechanism now returns 400. Moved the API key to a required proxy and added CI enforcement (§7.1), resolving v1's self-contradiction. Updated model to `claude-opus-5-5` with a cost table (§5.4). Added `thinking: adaptive` / `effort` in place of the removed `budget_tokens`. Added prompt caching on the system block. Added the two-path diagnostic with universal Quick fallback (§5.5). Added domain and threat taxonomies to the data model (§6). Settled `isDangerZone` to Discomfort only, with `regressionTarget`. Removed Framer Motion. Dropped v1's performance measures that existed only to mask API latency (§8.1). |
