# Technological Grief Interactive — Specification Suite

**Suite version**: 2.1
**Last revised**: 2026-11-01
**Supersedes**: v1.0 (2026-01-24), preserved in [`archive/v1/`](archive/v1/)

> **The application makes no network requests.** It is a static page: no API key, no proxy, no server, no per-visitor cost, and nothing a visitor enters ever leaves their browser. See **D-8** below for how it got that way, and what was given up for it.

---

## Reading order

| # | Document | What it is | Status |
|---|---|---|---|
| 1 | [grief-framework-context.md](grief-framework-context.md) | The theory. Canonical source for stages, taxonomies, and the Grief Gap. Everything else defers to this. | Revised |
| 2 | [content-architecture.md](content-architecture.md) | How content is composed from layered blocks. Read before authoring any content. | New |
| 3 | [content-blocks.md](content-blocks.md) | The authored content itself, plus authoring templates for the remaining blocks. | New |
| 4 | [content-specification.md](content-specification.md) | Tone, voice, and generation guardrails. | Revised |
| 5 | [survey-methodology.md](survey-methodology.md) | Both diagnostic paths, question bank, and the deterministic scoring algorithm. | Revised |
| 6 | [ui-specification.md](ui-specification.md) | The terrain visualization and the full interface. | Revised |
| 7 | [software-design-document.md](software-design-document.md) | Architecture, data shapes, API surface, deployment. | Revised |
| 8 | [test-scenarios.md](test-scenarios.md) | Test plan. | Revised, trimmed |

---

## What changed in v2.0, and why

v1.0 was written in January 2026 against the AI landscape and the Claude API of that moment. Three of its core architectural assumptions no longer hold, and three of its design decisions were working against the framework they were meant to serve.

### D-1 — Mode 1 no longer calls the API

**v1**: every stage click triggered a Claude request that generated the educational prose live, with the system prompt instructing Claude to "vary your explanations naturally."

**v2**: all explore-mode content is static, bundled, and assembled from authored blocks.

**Why**: the variation instruction was a liability, not a feature. Two users exploring the same stage received different accounts of the same framework, which is unacceptable in a tool whose authority rests on a documented theory. Live generation also charged money per click, added ~2s of latency to an action that should feel instant, and made the whole explore mode fail when the API was unreachable. The content spec already contained complete baseline prose for all six stages; v2 treats that as the product rather than as a fallback.

### D-2 — Personalization is layered composition, not a cross-product

**v1**: optional `personalized_context` string passed to Claude, which wove it into generated prose.

**v2**: content is assembled at render time from four layers — stage core, domain lens, threat response, pace note. See [content-architecture.md](content-architecture.md).

**Why**: the user wanted content that varies with what the person does and fears. Doing that by generation reintroduces D-1's problems; doing it by writing out every combination would mean 6 × 5 × 7 = 210 stage descriptions, which cannot be authored at quality. Layering gets personalized output from 49 authored blocks, and every assembled page is framework-consistent by construction.

### D-3 — Segmentation is domain × threat, not occupation

**v1**: a single `context` field with values `faculty | creative | business | technical | general`.

**v2**: two independent axes — five **domains** (what AI displaces in the work) and seven **threats** (what loss is being grieved). Both defined in [grief-framework-context.md](grief-framework-context.md).

**Why**: occupation is the wrong predictor. A composition professor and a graphic designer have different jobs and near-identical grief; that professor and the campus IT director share a collar and grieve nothing alike. What varies is the loss. Domain is retained because it is what makes the concrete first experiment concrete — and `general` was dropped as an option, because a residual bucket can only produce residual content.

### D-4 — The wheel is replaced by a terrain cross-section

**v1**: a closed six-segment clockwise wheel with a crimson Danger Zone overlay.

**v2**: a side-elevation path with six stations, climbing to a narrow saddle at Discomfort where the path visibly forks forward or back downhill. See [ui-specification.md](ui-specification.md).

**Why**: a closed circle asserts endless cycling, while the framework describes a progression with one specific regression path and a genuine endpoint. The wheel also could not show direction of travel, the regression path, diagnostic uncertainty, or the Grief Gap — and a circle with three stacked attributes per wedge is the worst available shape for a 360px screen and for a screen reader. Terrain carries all five natively: the hardest point simply *is* the steepest, narrowest point, and retreat is visibly downhill.

### D-5 — The Grief Gap became visible

**v1**: named in the framework and in the system prompt; absent from the interface.

**v2**: rendered as two markers on the same terrain — the user's position and their field's — with the span between them labelled. The gap is now signed: negative values (ahead of your field) mean isolation rather than grief, a case v1 did not consider.

**Why**: it is the framework's most original claim and the only one the v1 UI structurally could not express.

### D-6 — Live Claude is confined to one optional path

**v1**: four UI-manipulation tools (`update_wheel_state`, `display_stage_content`, `show_comparison`, `suggest_resources`) available throughout both modes.

**v2**: no UI-manipulation tools at all. Two diagnostic paths — **Quick** (multiple choice, deterministic scoring, zero API calls) and **Conversation** (adaptive questioning, ~6 calls, ending in one structured-output classification). Quick doubles as the fallback whenever the API is unavailable.

**Why**: three of the four tools asked Claude to tell the app something the app already knew — when a user clicks Discomfort, `update_wheel_state('discomfort')` is a round trip to learn the click. Adaptive questioning is the one capability that genuinely cannot be faked by static logic, so that is where the API budget goes.

Two API facts also forced this independently of the design argument:

- **Forced tool choice is gone.** `tool_choice: {type: "any"}` and `{type: "tool", name: ...}` return HTTP 400 on current models. The v1 pattern of compelling a diagnosis tool call would fail outright. v2 uses structured outputs (`output_config.format`).
- **`budget_tokens` is gone.** Returns 400. Thinking is configured with `{type: "adaptive"}` and depth with `output_config.effort`.

### D-8 — Zero API. The app makes no network requests at all

**Added 2026-11-01, superseding part of D-6.**

**D-6** confined live Claude to one optional diagnostic path, with Quick as the default and the universal fallback. That path was built and worked — a serverless proxy holding the key, adaptive questioning, structured-output classification, with every failure landing cleanly in Quick.

**It has been removed.** There is one diagnostic path, it is deterministic, and the application makes **no network requests of any kind** after the page loads.

**Why**: the tool is meant to be shared as a public link. A per-visitor model cost makes that a different product — one whose owner has to think about who they give the link to. The project owner's call, and the right one: *"I don't want to pay for the tokens for everyone I share the link with."*

Two things made it an easy removal rather than a loss:

- **Quick was already the default and already good enough.** It is deterministic, instant, exhaustively tested, and its diagnostic logic is the part the product is actually judged on. The Conversation path added nuance at the margin; it was never carrying the product.
- **Leaving it in place, dormant, would have been worse than removing it.** With no key configured the path already hid itself, so nothing *required* removal. But dormant code is still ~2,000 lines to maintain, two dependencies, a generated prompt to keep in sync, and a live API surface one environment variable away from a surprise bill. Dead weight that can charge you is not neutral.

It is recoverable: the whole path is one commit (`d97cd46`), and `git revert` of its removal restores it.

**What this bought, beyond cost**:

| | |
|---|---|
| Deployment | Pure static files. Any host, no serverless function, no secrets to manage |
| Privacy claim | Absolute rather than conditional. Nothing you enter leaves your browser, with no asterisk |
| Failure modes | None to speak of. No rate limits, no upstream errors, no retries, no fallback |
| API drift | Immune. v1's spec broke twice in nine months on parameter removals; there is now no API surface to break |
| Maintenance | ~2,000 fewer lines, two fewer dependencies, 59 fewer tests |

**What it cost**: adaptive questioning — branching on answers, rephrasing a non-answer, challenging a self-contradiction in the moment — which static logic genuinely cannot approximate. The Quick path detects a signal conflict and says so (see [survey-methodology.md](survey-methodology.md) §3.5), but it cannot ask about it. That is the real trade, and it is a reasonable one for a tool that has to be free to share.

**Also dropped with it**: the accuracy-measurement endpoint (formerly survey-methodology §7). It was opt-in and aggregate-only, but any endpoint at all forfeits the zero-network property, and an accuracy rate is not worth that. The "does this feel accurate?" prompt is gone rather than left asking a question whose answer is discarded.

### D-7 — Export moved into Phase 1

**v1**: strict ephemerality, with export listed as a Phase 2 enhancement, and the survey script telling users "you might want to note it somewhere."

**v2**: a downloadable one-page summary ships in Phase 1. Ephemerality is unchanged — the file is generated client-side and never touches a server.

**Why**: asking someone to hand-transcribe a result the tool just produced is a poor ending to an otherwise careful experience, and it is solvable without weakening the privacy stance at all.

---

## Contradictions resolved

These were genuine conflicts between v1 documents. Each is now settled, with the canonical answer living in the framework document.

| Conflict | v1 said | v2 settles |
|---|---|---|
| **What is the Danger Zone?** | Framework: Stage 3 *is* the Danger Zone. UI spec: an overlay "spanning the border between Discomfort and the previous stages." SDD: `inDangerZone: true` on both Doubt and Discomfort. | Stage 3 (Discomfort) alone is the Danger Zone. Doubt is not in it — Doubt is where regression *lands*. Modelled as `isDangerZone` on Discomfort plus an explicit `regressionTarget`. |
| **Is Mode 2 a wizard or a conversation?** | UI spec: "Question 2 of 6," radio buttons, Likert sliders, Back button. Survey methodology: adaptive branching, rephrasing, early termination, challenging self-contradiction. | A wizard. v1 specified one UI and a different behaviour, which could not both hold; v2.0 built both as named paths, and D-8 kept the wizard. The adaptive behaviours are not approximated in static logic — they are simply not offered. |
| **Where does the API key live?** | SDD §5.1 ships `VITE_ANTHROPIC_API_KEY` to the browser. SDD §7.1 claims "No API key exposed to client." | Nowhere. There is no key, because there is no API call. Superseded by D-8; v2.0 answered this with a mandatory serverless proxy. |
| **Can we measure diagnostic accuracy?** | Survey methodology asks to track accuracy, stage distribution, and transition patterns. SDD forbids all persistence and server-side logging. | No. v2.0 settled this as an opt-in aggregate-only endpoint; D-8 drops it, because any endpoint forfeits the zero-network property. The contradiction is resolved by dropping the measurement, not the privacy. |
| **Which model?** | `claude-sonnet-4-20250514`. | None. Superseded by D-8 — the application calls no model. v2.0 answered `claude-opus-5-5`. |

---

## Open items

Decisions deliberately left to the project owner, flagged where they appear:

1. **Field-maturity constants.** The terrain's second marker needs a per-domain position for where each field now sits. v2 proposes values with reasoning, but these are editorial judgments about five professional fields and should be reviewed by someone with standing in each. See [grief-framework-context.md](grief-framework-context.md) §5.3.
2. **The remaining 25 domain lenses.** v2 authors all six stage cores, all seven threat responses, all five pace notes, and a complete five-domain lens set for Stage 3. The other 25 lenses are templated and ready to write — left open deliberately, because they should carry the project owner's voice and domain knowledge rather than a generated approximation. See [content-blocks.md](content-blocks.md) §6.
3. **Facilitator view.** The framework's intervention strategy is organizational (tiered access, cohort diagnosis, shadow-AI governance) but the application diagnoses individuals. Whether an aggregate or facilitator mode is the real product remains undecided; it is not specified here.
4. **Version control.** This folder is not a git repository. v1 survived only because it was copied to `archive/v1/` before this revision. Recommend `git init` before any further editing.
