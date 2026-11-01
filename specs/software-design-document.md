# Software Design Document

**Version**: 2.0
**Last updated**: 2026-10-31
**Status**: Draft for review

---

## 1. Summary

### 1.1 Purpose

Architecture and implementation strategy for the Technological Grief Interactive — an educational and reflective tool that helps users locate themselves in the Change Grief Cycle relative to AI adoption.

### 1.2 Modes

- **Explore** — navigate the six stages. Static content, assembled at render time from authored blocks.
- **Diagnose** — six multiple-choice questions, deterministic client-side scoring.

Both are entirely local. **The application makes no network requests after the page loads.**

### 1.3 Requirements

- Single-page application; no accounts, no server, no server-side user data
- **No network requests.** Not optional, not configurable — it is the property that lets the tool be shared as a public link at zero marginal cost, and it is enforced in CI (§7.1)
- Session-scoped state only (sessionStorage), plus client-side export
- Responsive: phone through desktop
- WCAG 2.1 AA

### 1.4 What changed from v1

| | v1 | v2.1 |
|---|---|---|
| Explore content | Generated live per stage click | Static, bundled, assembled from blocks |
| Diagnosis | Model-classified | Deterministic pure function |
| API calls per session | ~8–12 | **0** |
| Anthropic SDK | Browser bundle | Not a dependency |
| API key | `VITE_ANTHROPIC_API_KEY` in client | None exists |
| UI control | 4 Claude-callable tools | None — the app owns its own UI |
| Deployment | SPA + key management | Static files |
| Works offline | No | Yes, completely |

See [README.md](README.md) for the rationale on each, and **D-8** for why the Conversation path that v2.0 specified and built was then removed.

---

## 2. Architecture

```
╔══════════════════════════════════════════════════════════════════╗
║                       Browser  (everything)                       ║
║                                                                   ║
║   ┌────────────────┐   ┌──────────────┐   ┌───────────────────┐  ║
║   │  Terrain (SVG) │   │ Content Pane │   │ Quick Survey      │  ║
║   └───────┬────────┘   └──────┬───────┘   └─────────┬─────────┘  ║
║           │                   │                     │             ║
║           └───────────┬───────┴─────────────────────┘             ║
║                       ▼                                           ║
║             ┌───────────────────┐                                 ║
║             │  Store (zustand)  │───▶ sessionStorage              ║
║             └─────────┬─────────┘                                 ║
║         ┌─────────────┼───────────────┐                           ║
║         ▼             ▼               ▼                           ║
║  ┌────────────┐ ┌───────────┐  ┌────────────┐                    ║
║  │  Content   │ │  Scorer   │  │  Export    │                    ║
║  │  Assembler │ │  (pure)   │  │ (md/print) │                    ║
║  │  (pure)    │ └───────────┘  └────────────┘                    ║
║  └─────┬──────┘                                                   ║
║        ▼                                                          ║
║  ┌────────────────────────┐                                       ║
║  │ Content blocks         │   49 authored blocks, bundled         ║
║  │ (bundled TS modules)   │                                       ║
║  └────────────────────────┘                                       ║
║                                                                   ║
╚═══════════════════════════ no exit ═══════════════════════════════╝

        After the page loads, nothing crosses this boundary.
```

There is no second box. The diagram has no network edge because the application has none — no API, no proxy, no analytics, no fonts or scripts from a CDN, no beacon. This is checked in CI rather than trusted (§7.1).

### 2.1 Stack

**Client**
- React 19 + TypeScript 5.7
- Vite 6
- Zustand 5 — session state
- **Plain CSS with custom properties** — no Tailwind
- No animation library. The reveal sequence ([ui-specification.md](ui-specification.md) §7.2) is a handful of CSS transitions; v1's Framer Motion dependency buys nothing here and costs ~34KB gzipped.

Three runtime dependencies in total: `react`, `react-dom`, `zustand`.

> **Changed during implementation.** This specified Tailwind 4. The design is already expressed as CSS custom properties ([ui-specification.md](ui-specification.md) §6), and the interface is one SVG graphic — where Tailwind does not apply — plus a single prose column with about ten section treatments. That came to ~600 lines of hand-written CSS, 3.1KB gzipped, against a build-tool dependency that would have earned nothing. Recorded here rather than left as a silent divergence.

**Test tooling**: Vitest **3**, not 2. Vitest 2 bundles its own Vite 5, which type-conflicts with Vite 6 in the same tree; Vitest 3 dedupes onto Vite 6.

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
        ├── QuickSurvey
        │   └── QuestionScreen
        └── DiagnosisResult
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
    quickAnswers: Partial<QuickAnswers>;
    quickIndex: number;                // 0..5
    transcript: Turn[];
    status: 'idle' | 'asking' | 'thinking' | 'classifying' | 'done' | 'failed';
  };

  reveal: { active: boolean; startedAt: number | null };

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

`sessionStorage` only, under one key (`tgi.session.v2`), holding `{mode, selectedStage, diagnosis, rationale, quickAnswers, quickIndex, status}` — enough that a refresh mid-survey does not lose the answers already given.

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

**None.** The application makes no network requests of any kind after the page loads.

v2.0 specified a Conversation diagnostic path through a serverless proxy, and it was built: `claude-opus-5-5`, a cached system prompt generated from the framework document, structured-output classification, rate limiting, and a universal fallback to the Quick path on any failure. It worked.

It was removed on 2026-11-01. The reasoning is recorded in [README.md](README.md) **D-8**; in short, the tool is shared as a public link and a per-visitor model cost makes that a different product. Dormant code that can charge you is not neutral, so it went rather than being left configured-off.

The removal is one commit (`d97cd46`), recoverable with `git revert`. Should it ever come back, the three things that were hard-won and should not be re-derived:

- **Forced tool choice returns HTTP 400** on current models. Classification used structured outputs (`output_config.format` with `zodOutputFormat` + `messages.parse()`), not a compelled tool call.
- **`budget_tokens` returns 400.** Thinking is `{ type: 'adaptive' }`, depth is `output_config.effort`, and the default on `claude-opus-5-5` is `medium` — `low` had to be set explicitly.
- **The cached system prompt must be byte-identical across turns**, or prompt caching silently stops and per-session input cost roughly quadruples. There was a test asserting it.


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
  rationale?: string;               // why this stage, in the user's answers
  path: 'quick';                    // one path; named so metrics stay stable
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

### 7.1 No network, enforced

v1 contradicted itself here: §5.1 constructed an `Anthropic` client in the browser with `VITE_ANTHROPIC_API_KEY`, while §7.1 asserted "No API key exposed to client (if using proxy)" and filed the proxy under "Alternative Architecture." v2.0 resolved that with a mandatory proxy. **D-8 resolved it further: there is no key, because there is no request.**

"Nothing you enter leaves your browser" is the product's defining property, not an implementation detail — it is what lets the tool be shared as a public link with no key, no server and no per-visitor cost. A claim that load-bearing is enforced, not trusted:

| ID | Check | Where |
|---|---|---|
| **S-00** | No source file calls `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource`, or imports a remote URL | `src/`, CI |
| **S-01** | `@anthropic-ai/sdk` is absent from both dependency lists **and** from every import | `package.json` + `src/`, CI |
| **S-02** | Built bundle contains no `sk-ant-` | `dist/`, CI |
| **S-03** | Built bundle contains no reference to `api.anthropic.com` | `dist/`, CI |
| **S-05** | No `localStorage` anywhere — session state is `sessionStorage` only | `src/`, CI |
| **S-06** | CSP sets `connect-src 'self'`, so even reintroduced code could not reach a third party | headers |

S-00 and S-01 are each **verified against a deliberately planted violation**, because a security check that has never failed is a check nobody knows works.

Two consequences worth stating plainly, since they are easy to erode later:

- **No analytics, ever.** Not a page-view counter, not an error reporter. Any of them breaks S-00.
- **No CDN assets.** Fonts and scripts are self-hosted or absent. A Google Fonts link is a network request to a third party on every page load, and it would make the privacy claim false.

> **Corrected during implementation (2026-10-31), then superseded (2026-11-01).** While the proxy existed, S-01 could not be a dependency-list check: the serverless function needed the SDK at the project root, and npm hoists it into root `node_modules` regardless, so it stayed importable from `src/`. The check was import-graph based for that reason. With the proxy gone the dependency list is meaningful again, so S-01 now checks **both**.

### 7.2 Data handling

| Data | Where it lives | Leaves the browser? |
|---|---|---|
| Survey answers | memory + sessionStorage | **Never** |
| Diagnosis | memory + sessionStorage | **Never** |
| Export file | user's disk | Generated locally; no network call |

Every row says never, which is why the claim can be made without an asterisk. v2.0's version of this table had two rows that said "yes, to the proxy" and an opt-in metrics row; D-8 removed all three.

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

The SVG is authored, not user-supplied, so v1's "SVG sanitization" concern does not apply. What does apply: the diagnosis rationale is **rendered as text, never as markup** - it is built from authored strings, and the renderer emits React nodes rather than using `dangerouslySetInnerHTML` anywhere.

No user text is ever interpolated into authored content ([content-architecture.md](content-architecture.md) §7), which closes the injection path v1's `personalized_context` string opened.

---

## 8. Performance

### 8.1 Where the work went

| Operation | v1 | v2 |
|---|---|---|
| Stage switch | API call, ~2s | Synchronous assembly, <1ms |
| Initial content | API call | Bundled |
| Quick diagnosis | n/a | Pure function, <1ms |

Explore mode's cost went to zero, because assembling four bundled strings is not an operation that needs optimizing. v1's §8 specified memoization of the wheel, debounced input, and per-session content caching — all of which existed to manage a latency that no longer exists.

### 8.2 Targets

| Metric | Target |
|---|---|
| First contentful paint | <1.2s |
| Time to interactive | <2.0s |
| Stage switch | <50ms, perceptually instant |
| Quick question advance | <50ms |
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
npm run check:bundle         # network, secret, storage and size checks
```

### 10.2 Hosting

**Static files.** `dist/` is three files and some assets. Anything that serves a directory will do: GitHub Pages, Netlify drop, Cloudflare Pages, S3, a university web server, a USB stick.

No serverless function, no runtime, no secrets to manage, no environment to configure, nothing to keep warm, and no per-visitor cost. The deployment story is `npm run build` and copy the folder.

Serve it over HTTPS with the headers in §7.3. That is the entire operational requirement.

### 10.3 Environment

**None.** There are no environment variables. There is nothing to configure.

v2.0 had three (`ANTHROPIC_API_KEY`, `VITE_CONVERSATION_ENABLED`, `VITE_METRICS_ENDPOINT`) and an availability probe at mount to detect a misconfigured deployment. All of that disappeared with D-8, along with the class of bug where the app behaves differently depending on which variables someone remembered to set.

---

## 11. Maintenance

### 11.1 What needs periodic attention

| Item | Cadence | Why |
|---|---|---|
| Field-maturity constants | 6 months | Fields move. They drive the gap, which drives the second marker. |
| Content block review | 12 months | `lastReviewed` warns at build time. |
| Dependencies | 6 months | Three runtime packages. A small surface, but not zero. |

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
| 2.2 | 2026-11-01 | **Conversation path and proxy removed** ([README.md](README.md) D-8). The application now makes no network requests at all: no API, no key, no serverless function, no environment variables, no analytics. §5 is a removal note retaining the three API facts worth not re-deriving. S-00 added (§7.1) and S-01 restored to check dependencies as well as imports, both verified against planted violations. Accuracy measurement dropped rather than kept as the one thing that reaches the network. `rogers` back to non-nullable and `DiagnosticPath` narrowed to `'quick'`, since the only producer always sets them. Deployment is now static files with nothing to configure (§10). |
| 2.1 | 2026-10-31 | Conversation path implemented. Corrections made against the running code: structured outputs use `zodOutputFormat` + `messages.parse()`, not a hand-written `json_schema` (§5.3); the system prompt is generated from the framework document and committed, with a test guarding drift (§5.6); the S-01 guarantee is import-based rather than dependency-list-based, because the latter cannot hold (§7.1); the rate limiter is per-instance and says so (§5.7); the proxy logs shape, status and latency, because logging nothing at all is unoperable (§5.7); a dev-server bridge is required to run the path locally at all (§5.7); `rogers` is nullable so an unrecognised position omits the pace note rather than guessing (§6). |
| 1.0 | 2026-01-24 | Initial design document |
| 2.0 | 2026-10-31 | Static-first architecture: Explore mode makes no API calls (§1.4). Removed all four Claude-callable UI tools. Replaced forced `tool_choice` with structured outputs (§5.3) — the v1 mechanism now returns 400. Moved the API key to a required proxy and added CI enforcement (§7.1), resolving v1's self-contradiction. Updated model to `claude-opus-5-5` with a cost table (§5.4). Added `thinking: adaptive` / `effort` in place of the removed `budget_tokens`. Added prompt caching on the system block. Added the two-path diagnostic with universal Quick fallback (§5.5). Added domain and threat taxonomies to the data model (§6). Settled `isDangerZone` to Discomfort only, with `regressionTarget`. Removed Framer Motion. Dropped v1's performance measures that existed only to mask API latency (§8.1). |
