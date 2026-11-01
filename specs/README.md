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
| 6 | [ui-specification.md](ui-specification.md) | The dial and the full interface. | Revised |
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

### D-9 — "Diagnose" is now "Locate"

**v2.0**: the second mode was called Diagnose — in the toggle, in the route (`#/diagnose`), and throughout these documents.

**Now**: the mode is **Locate**, the route is `#/locate`, and the button that opens it reads "Find your station".

**Why**: "diagnose" puts the tool in the clinician's chair and the reader in the patient's, which is the one frame this material works hardest against — the framework's central claim is that these stages are a normal response to real loss, not a pathology. It also sat badly next to the result screen's own promise that this is a reflection and not a judgment. "Locate" is a verb about the path rather than about the person, and it borrows the vocabulary the stations already use.

**Not renamed**: the internal identifiers — `Mode = 'explore' | 'diagnose'`, `Diagnosis`, `DiagnosisResult`, `DiagnoseView` — and the framework's own use of "diagnosis" as a construct. Those are a separate pass, deferred until the word has settled in use.

### D-10 — The terrain becomes an open dial

**v2.0**: a terrain cross-section — a wide, short side elevation with six stations, climbing to a narrow saddle at Discomfort and descending into a widening valley (D-4).

**Now**: an **open dial** — six bands around a 297° ring with a 63° opening at the bottom, read clockwise from the lower left. Band width encodes available options, the two markers and the gap sweep live inside the ring, and the hole is a readout. See [ui-specification.md](ui-specification.md) §2 and §4.

**Why**: the terrain was right about the content and wrong about the object. Every structural claim D-4 made for it survives the move — the path still opens rather than closing, the Grief Gap is still two marks and a span, the retreat still runs from Discomfort to Doubt and nowhere else, the triad still lives in a table rather than on the graphic. What the terrain did not have was any reason to look at it twice. A ring is the more engaging object, and v1 was right to reach for one; it was the *closing* of the ring that was wrong, not the shape.

Where each of D-4's claims now sits:

| D-4 said the terrain carried it as | The dial carries it as |
|---|---|
| A path with a start and an end, not a circle | A 63° opening at the bottom, asserted by `U-D-03` |
| The hardest point is the narrowest point | A 20° band against Integration's 74° |
| Both exits downhill, so people cycle | The retreat arc, drawn backward, with the forward band adjacent |
| Width is available options | Angular span, ordered and asserted by `U-D-04` |
| The Grief Gap as a distance | An arc at `R_GAP` between two markers, signed by its sweep direction |

**What it cost**: elevation. "This is the hard part" was more immediate as height than it is as narrowness, and the saddle's two-downhill-exits reading has no exact equivalent. The 20° sliver carries most of it, and the `danger zone` annotation carries the rest in a word.

**What is not reinstated**: v1's wheel. The ring does not close, nothing is written on a rotated baseline, the hole holds a readout rather than a gear, and the emotion/cognition/behavior triad stays out of the ring. The objections in [ui-specification.md](ui-specification.md) §1 all still hold against v1 — they were objections to a closed pie of rotated text, not to radial geometry.

**Known cost of the span ordering**: making width mean options and centring the narrow band at twelve o'clock are mutually exclusive, because Integration has to be the widest and it has to end at the bottom right. Width won. Discomfort sits at −34°, upper left, and the dial has no summit.

### D-11 — The page becomes a panel and two doors

**Before**: the dial sat in a full-width banner with the whole assembled page — two to eight sections of prose — in one column beneath it.

**Now**: two columns. The dial is a sticky column on the left. The right column holds the stage name, the **description**, **what you might be feeling** as three cards across, and two buttons: **Why this happens** and **What to do about it**. Each opens a modal with the text on one side and an image on the other. The Locate survey has its own overlay. Nothing sits below the fold any more.

**Why**: all of that text is worth keeping and none of it was worth reading first. A stage arrived as a wall, so the thing the reader actually needed — which stage am I looking at, and what does it feel like — was the smallest element on the screen. Putting the explanation and the advice behind named doors makes the panel answerable at a glance and makes each piece of long-form prose a thing someone chose to open.

**How the split is made**: in [panels.ts](../src/content/panels.ts), not in a component, so it is testable. The invariant that matters is that nothing is lost: `U-P-01` asserts that every section of the assembled page lands in exactly one of the four groups, for every stage and for three diagnosis shapes. "Moved behind a button" and "quietly dropped" look identical from the outside.

| Group | Sections |
|---|---|
| Panel | `overview`, `experience` |
| Why this happens | `why`, then `lens`, `threat` |
| What to do about it | `forward`, then `experiment`, `pace` |

The invariant core leads each modal because the modal is named after it; the personalized layers follow in page order, which is what preserves the ethical override from D-2 (`U-P-04`).

**The images**: twelve, one per stage per door, not yet generated — the modals show a dashed placeholder with the brief's caption. Briefs and house rules are in [imageBriefs.ts](../src/content/imageBriefs.ts) and summarised in [ui-specification.md](ui-specification.md) §12.1. The rules exist because the obvious stock image for any of these stages — head in hands, glowing brain, robot hand — would contradict the writing on the same screen.

**What it costs**: the explanation is now two clicks from the stage rather than zero, and someone who wants the whole page has to open both dialogs. Each door's hint says what is behind it and how much ("what is driving it, and 2 more for your situation"), because an unlabelled button that hides an unknown quantity of text gets opened exactly once. The export (§9) is unchanged and still contains everything in one file, which remains the way to read it all at once.

**Also**: the dial now takes `selected` separately from `stage`, so with a result on the dial you can click through the other five bands without the marker following you. The terrain could not do this — it had one position and used it for both — and the dial drawing "You" at whatever you were reading was the thing D-10 had just fixed in the other direction.

### D-12 — The app takes the NextEd design system, in two themes

**Before**: the v1 look — charcoal `#2A2D34`, cyan `#00D9FF`, Inter, 8px corners, and the red → amber → teal stage ramp. Not one NextEd value appeared anywhere in `src/`. The design canvas was in NextEd and the running app was not.

**Now**: the app is in the design system. [tokens.css](../src/styles/tokens.css) carries NextEd's palette in light and dark, mirrored in [palette.ts](../src/theme/palette.ts) so the rules can be tested. Roboto Condensed for display and Roboto for body; square corners; borders over shadows; 44px targets; a 3px focus ring with a 3px offset. Spirit Red on the primary button and on the 4px rule above each card; the NextEd mark in a `surface-inverse` masthead; the Minnesota State line in the colophon.

**The hard part was the stage ramp.** Six stages need six ordered, distinguishable fills, and NextEd reserves red for the institution and for errors, Bold Orange for warnings, and blue for forward motion — so v1's ramp was unavailable in full. Each stage is now a design system token (Steel, Border Strong, Bold Orange, Glacier Blue, Gateway Blue, Gateway Deep), and because each token carries its own light and dark value, the dark theme is the same ramp rather than a second palette. The Danger Zone landing on the system's warning colour is the one place where the brand's semantics and the framework's agree exactly. Full table in [ui-specification.md](ui-specification.md) §6.1.

**Colour became a fill and stopped being type.** Bold Orange is 2.59:1 on white and Glacier Blue is 3.5:1; neither can carry text. The stage name, the triad values and the result headline are `--ink`, and the stage's colour appears as a swatch, a band, or a 4px rule. This is a visible change from v2.3, where headings were tinted by stage.

**Two themes.** Light by default, `prefers-color-scheme` until the reader touches the toggle, their choice after that, kept as one word in `localStorage` under `grief.theme`. It is the only thing the app keeps across tabs; the session itself still dies with the tab. See [ui-specification.md](ui-specification.md) §7.4.

**What is tested** (`palette.test.ts`, U-N-01 to U-N-09): that `tokens.css` and the palette record agree; that the two dark rule blocks — the media query and the attribute — stay identical; that every band's number clears 4.5:1 on its own band; that every band keyline clears 3:1; that the text pairs the app uses clear AA in both themes; and that Spirit Red and Granite Black are present in both.

**What the tests could not see.** Token-level checks pass while the page still fails, because what matters is the colour an element actually computes against the background it actually has. The rendered page was walked in both themes, measuring every text node, and it found four failures the token tests could not: the skip link still carrying a v1 hex, the Danger Zone flag and the triad values in Bold Orange, and `--ink-muted` at 14px on `--surface-subtle` — which is the 4.4:1 case the design system itself warns about. All four are fixed; the walk now reports nothing in either theme, modals included.

**What was not done**: the fonts are not loaded from Google. NextEd says to, but a request to `fonts.googleapis.com` on every page load breaks D-8, and the zero-network claim is printed next to the survey. The app uses the design system's own stacks, fallbacks included. Self-hosting the two woff2 files satisfies both and is the right fix when the real condensed face is wanted.

**Known limitation**: in light the ramp reads in greyscale and peaks at stage 3; in dark, Discovery and Understanding sit within 0.03 luminance of each other. They are told apart by hue, by their numbers and by their labels — colour is never the only carrier — but the dark ramp is less expressive than the light one.

### D-13 — The field is switchable, and it is visible before you open a door

**Before**: Q2 recorded a domain, the domain selected a lens block, and the lens appeared only inside the "Why this happens" modal. Since only the five Discomfort lenses were ever authored, the domain changed what you read at **one stage out of six**, in the least visible place in the app, and changing it meant answering the survey again.

**Now**: the panel carries an **In your work** section with a field selector and a one-line note, and the field can be changed at any time without retaking anything.

**Why switchable at all**: Q2 asks what kind of work you do, and plenty of people sit between two answers — a faculty member who also runs a programme is in teaching and in coordination. Making the answer a commitment put weight on a question that cannot carry it. It is now the default rather than a verdict, which also lowers the stakes of getting it wrong.

**The gap follows the field, and that is the whole decision in this change.** The Grief Gap is defined as the distance between where you are and where *that field* sits ([grief-framework-context.md](grief-framework-context.md) §5), so reading as Coordination & Care while showing Craft's distance would put a number on screen that belongs to neither. Switching therefore recomputes it — and at Discomfort, switching from Craft to Coordination takes the gap from +1.2 to −0.6 and flips its meaning from adaptive pressure to isolation. What never moves is the reader: `stage`, `threats`, `rogers` and the confidence are passed through untouched, the marker stays where the result put it, and the stored diagnosis is never rewritten, because it is the record of what someone actually answered and the export has to reproduce it. `viewDiagnosis()` in [view.ts](../src/domain/view.ts) is the only place that applies the switch; `U-V-01` to `U-V-06` assert all of it.

A line appears under the note whenever the field being read is not the one they answered with, because a number that changed for a reason the reader did not connect is worse than no number.

**The new content field**: `DomainLensBlock.summary`, one sentence, shown in the panel. It is the thing that makes the switcher worth operating — the full lens stays behind the door. Five exist, condensed from the five Discomfort bodies; the other 25 are authored with their blocks.

**What this sets up, and what it is waiting for.** [content-architecture.md](content-architecture.md) §3 always drew the lens layer as 6 × 5 = 30 blocks; five are written, all at one stage. The mechanism is now in place for the other 25 plus a parallel image matrix — `briefFor(stage, door, domain)` already resolves a per-domain image and falls back to the stage-level one, so `DOMAIN_IMAGE_BRIEFS` can be filled in a cell at a time without touching a component.

None of that authoring has started, deliberately. The evidence review running against this framework was asked whether domain-specific content is worth authoring at all, or whether the stage dominates the field; a finding that it does not would shrink this matrix rather than fill it, and writing 25 blocks before that answer arrives would be the expensive order to do it in.

**Note on the completeness rule**: [content-architecture.md](content-architecture.md) §5 requires every stage to have all five lenses or none. The empty state in the panel — "Nothing specific to this field at this stage yet" — is what that rule looks like from the reader's side at the five unauthored stages, and it goes away as each stage is completed.

### D-14 — The ephemeral badge becomes a Sources button

**Before**: a lock glyph and the words "Ephemeral session" sat beside Start fresh, asserting a privacy property.

**Now**: a **Sources** button in the same place, opening a modal with the reading behind the tool.

**Why the badge went**: it was a claim rather than an affordance, and the same claim is already made twice elsewhere, in better places — the colophon on every screen ("Nothing you enter leaves this browser") and the Locate overlay itself, immediately above the questions, which is where someone actually weighs it. A badge that restates a promise next to nothing it can act on spends the most visible control slot in the app on reassurance. The promise is unchanged; only the badge is gone.

**What the modal holds**, in three groups, because a reader arrives with one of three questions:

| Group | Answers |
|---|---|
| The model, and the case against it | Is any of this real? |
| In *your kind of work* | Does it apply to me? |
| What actually helps | What do I do? |

The middle group follows the field selector (D-13), so switching from Craft to Coordination changes the reading as well as the text. With no field chosen it says so and tells the reader how to get one, rather than showing a heading above nothing.

**The group names matter.** It is "the model, **and the case against it**", and the list contains the work that goes against this tool: the one direct empirical test of stage theory, which found the predicted first stage was not first, and the paper warning clinicians against walking people through stages. `U-S-05` asserts both are present, because the pressure to quietly drop them later is real and a sources list that only flatters the thing it supports is an advertisement.

Above the groups sits a short answer to "how much of this is established?" — that the stages are a practitioner model, their order is a convention rather than a finding, and the Grief Gap is our own untested hypothesis. It is placed *above* the citations rather than under them, because a caveat printed after the evidence reads as a disclaimer.

**Provenance**: every entry comes from [research/evidence-review.md](research/evidence-review.md), the assessment of this framework against the literature. Nothing is listed that was not read there, and the review's own caveats travel with the entries: preprints, vendor-published surveys and self-selected samples each carry their own warning rather than a blanket note at the bottom. `U-S-06` asserts the caveats exist and `U-S-03` that every entry says in our own words why it is there — a bare citation is a reading list, not an answer to "where does this come from".

**Still open**: the review is on an unmerged branch and proposes 15 edits to [grief-framework-context.md](grief-framework-context.md), including corrections to two of the five field-maturity constants that this tool displays. The sources modal cites the review's evidence; the framework document has not yet been changed by it.

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

1. **Field-maturity constants.** The dial's second marker needs a per-domain position for where each field now sits. v2 proposes values with reasoning, but these are editorial judgments about five professional fields and should be reviewed by someone with standing in each. See [grief-framework-context.md](grief-framework-context.md) §5.3.
2. **The remaining 25 domain lenses.** v2 authors all six stage cores, all seven threat responses, all five pace notes, and a complete five-domain lens set for Stage 3. The other 25 lenses are templated and ready to write — left open deliberately, because they should carry the project owner's voice and domain knowledge rather than a generated approximation. See [content-blocks.md](content-blocks.md) §6.
3. **Facilitator view.** The framework's intervention strategy is organizational (tiered access, cohort diagnosis, shadow-AI governance) but the application diagnoses individuals. Whether an aggregate or facilitator mode is the real product remains undecided; it is not specified here.
4. **Version control.** This folder is not a git repository. v1 survived only because it was copied to `archive/v1/` before this revision. Recommend `git init` before any further editing.
