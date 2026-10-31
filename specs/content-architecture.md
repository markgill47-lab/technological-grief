# Content Architecture: Layered Composition

**Version**: 2.0 (new in v2.0)
**Last updated**: 2026-10-31
**Read before**: authoring any content block, or implementing the assembly layer.

---

## 1. The problem this solves

Explore-mode content must do two things that pull against each other:

1. **Be framework-consistent.** Two users reading about Discomfort must get the same account of what Discomfort is. The tool's authority rests on a documented theory; if the theory renders differently each time, there is no theory.
2. **Read as though written for this person.** A faculty member and an illustrator in the same stage are grieving different losses and need different first steps. Generic content is content nobody acts on.

v1 chose generation, and the system prompt instructed Claude to "vary your explanations naturally." That satisfies (2) at the cost of (1), plus latency and per-click cost.

The naive alternative — write every combination — satisfies both and is not writable. Six stages × five domains × seven threats is **210 full stage descriptions**. At the quality of v1's Stage 3 prose that is a book, and it would need re-editing as a book every time the framework moved.

**Layered composition** gets both properties from 49 authored blocks.

---

## 2. The four layers

Every assembled page is a stack of four block types. Each layer answers a different question.

```
┌──────────────────────────────────────────────────────────────┐
│  STAGE CORE                                    6 blocks      │
│  "What is this stage?"                         ~400 words    │
│  Invariant. Framework truth. Never personalized.             │
├──────────────────────────────────────────────────────────────┤
│  DOMAIN LENS                      6 × 5 = 30 blocks          │
│  "What does it look like in my work?"          ~120 words    │
│  Plus THE concrete first experiment for this stage+domain.   │
├──────────────────────────────────────────────────────────────┤
│  THREAT RESPONSE                   7 threats, 8 blocks       │
│  "What about the specific thing I'm losing?"   ~100 words    │
│  Stage-agnostic, except skills_obsolescence (2 variants).    │
├──────────────────────────────────────────────────────────────┤
│  PACE NOTE                                     5 blocks      │
│  "Is my pace a problem?"                        ~60 words    │
│  Keyed to Rogers position, modulated by gap sign.            │
└──────────────────────────────────────────────────────────────┘
                     6 + 30 + 8 + 5  =  49 blocks
```

### Why these four and not others

Each layer is a **separate axis of variation**, which is what makes composition legal. Stage is what the user navigates. Domain determines examples and vocabulary. Threat determines emotional register. Rogers position determines whether their pace needs defending or challenging. Changing one does not require rewriting another — that independence is the whole mechanism.

A fifth candidate layer, *institutional pressure*, was considered and rejected: it correlates too strongly with both threat and Rogers position to vary independently, and folding it in doubled the block count for marginal differentiation.

---

## 3. Block schema

All blocks share one shape. Content lives in typed TypeScript modules, bundled at build time — not fetched, not in a CMS, not in a database.

```typescript
type BlockKind = 'stage_core' | 'domain_lens' | 'threat_response' | 'pace_note';

interface ContentBlock {
  /** Stable composite id. Format: `<kind>.<keys joined by '.'>` */
  id: string;
  kind: BlockKind;

  /** Which slots of the matrix this block fills. */
  stage?: Stage;            // required for stage_core, domain_lens
  domain?: Domain;          // required for domain_lens
  threat?: ThreatId;        // required for threat_response
  rogers?: RogersPosition;  // required for pace_note

  /** For blocks with stage-sensitive variants: which stages this variant serves.
   *  Omitted means "all stages". The resolver prefers the most specific match. */
  stageScope?: Stage[];

  /** Markdown. Inline formatting only — no headings, no lists at block level
   *  except where the schema says so. Assembly supplies all structure. */
  body: string;

  /** domain_lens only: the one concrete thing to try. Rendered as a callout,
   *  not as prose, so it cannot be skimmed past. */
  firstExperiment?: string;

  /** Review metadata. Every block carries provenance. */
  meta: {
    author: string;
    lastReviewed: string;   // ISO date
    reviewedBy?: string;
    /** Set true when a domain expert has signed off on domain-specific claims. */
    domainVerified?: boolean;
  };
}
```

### Block id examples

```
stage_core.discomfort
domain_lens.discomfort.teaching
threat_response.verification
threat_response.skills_obsolescence@early      // stageScope: [loss, doubt]
threat_response.skills_obsolescence@late       // stageScope: [understanding, integration]
pace_note.late_majority
```

---

## 4. Assembly

### 4.1 Resolution order

Given a `Diagnosis` (see [software-design-document.md](software-design-document.md) §6) and a target stage, the assembler resolves blocks in this order:

```
1. stage_core.<stage>                                    always
2. domain_lens.<stage>.<domain>                           if domain known
3. threat_response.<threats[0]>                           if threat known
4. threat_response.<threats[1]>                           only if §4.3 permits
5. pace_note.<rogers>                                     if rogers known
```

Every layer after the first is **optional**. With no diagnosis at all, a page is its stage core alone — complete, correct, and readable. This is the anonymous-browse case and it must be good on its own; the other layers are enrichment, never load-bearing.

### 4.2 Variant selection

For blocks with `stageScope`, prefer the most specific match:

```typescript
function resolveVariant(candidates: ContentBlock[], stage: Stage): ContentBlock | null {
  const scoped = candidates.filter(b => b.stageScope?.includes(stage));
  if (scoped.length === 1) return scoped[0];
  if (scoped.length > 1) throw new Error(`Ambiguous variant for ${stage}`);
  return candidates.find(b => !b.stageScope) ?? null;   // fall back to unscoped
}
```

Ambiguity is a build-time error, not a runtime coin flip. See §5.

### 4.3 The two-threat rule

At most **two** threat responses render, and the second only when it is not redundant with the first.

Redundancy pairs — never render together, keep the primary:

| | |
|---|---|
| `skills_obsolescence` + `identity_authority` | both are "what I knew no longer distinguishes me" |
| `verification` + `control_opacity` | both are "I can't confirm what I'm accountable for" |
| `authenticity_quality` + `ethical` | distinct in substance, but stacking them reads as piling on |

Three or more threat blocks produce a page that reads as a catalogue of the user's complaints rather than a response to a person. This limit is a content judgment, enforced in code.

### 4.4 Ethical threat override

When `threats[0] === 'ethical'`, the threat response renders **above** the domain lens rather than below it, and the domain lens's `firstExperiment` is suppressed.

Offering someone a fun experiment to try immediately after they have told you they consider the tool unethical is the single worst failure mode available to this application. The override is not stylistic.

### 4.5 Pace note modulation

The pace note is selected by Rogers position but its framing depends on the **sign of the Grief Gap** (see [grief-framework-context.md](grief-framework-context.md) §5.2). Each pace note block therefore carries two framings in one body, and the assembler passes the gap sign as a render flag:

- `gap > +0.5` → "your field is ahead of you, and here's why that is structural"
- `gap < −0.5` → "you are ahead of your field, and that is a different problem"
- otherwise → neutral framing

This is the only place content varies on something other than a taxonomy key, and it is handled inside the block rather than by multiplying blocks.

### 4.6 Rendered page structure

The assembled page, in order:

| Section | Source | Notes |
|---|---|---|
| Stage header | stage table | Name, station number, color |
| Overview | `stage_core.body` | 2–3 paragraphs |
| What you might experience | stage table | Emotion / cognition / behavior triad |
| In your work | `domain_lens.body` | Omitted entirely with no domain |
| **Try this** | `domain_lens.firstExperiment` | Callout treatment. Suppressed per §4.4 |
| About what you said | threat response(s) | Promoted above "In your work" per §4.4 |
| Why this happens | `stage_core` §2 | Part of the core block, split on a marker |
| Moving forward | `stage_core` §3 | Part of the core block |
| Your pace | `pace_note.body` | Modulated per §4.5 |

Sections with no resolved block are omitted, not rendered empty. The page must never show a heading above nothing.

---

## 5. Build-time validation

Composition without validation produces silent holes. These checks run in CI and fail the build.

| Check | Rule |
|---|---|
| **Completeness** | All 6 stage cores and all 5 pace notes exist. Every stage has either all 5 domain lenses or none. |
| **Uniqueness** | No two blocks share an `id`. |
| **Variant sanity** | No stage resolves to more than one variant of the same block (§4.2). |
| **Coverage** | For every (stage, domain, threat, rogers) combination, assembly produces a page with no empty section and no duplicate paragraph. 6 × 5 × 7 × 5 = 1,050 combinations; exhaustively enumerable and fast. |
| **Length** | Each block within ±40% of its target word count. Prevents one block quietly becoming the page. |
| **Review freshness** | Warn on `lastReviewed` older than 12 months. |
| **Domain claims** | Any `domain_lens` with `domainVerified !== true` emits a warning naming it. |
| **Tone scan** | No block contains the clinical vocabulary banned in [content-specification.md](content-specification.md) §2 (`symptom`, `patient`, `treatment`, `disorder`, `pathology`, `prognosis`). |

The coverage check is the important one: it is what makes it safe to add a block without re-reading the whole library.

---

## 6. Phased authoring

The matrix can ship incomplete, because §4.1 degrades cleanly. Recommended order:

| Phase | Blocks | Why this order |
|---|---|---|
| **1** | 6 stage cores | The app is complete and useful with only these. |
| **2** | 5 pace notes, 7 threat responses | Cheap, stage-agnostic, high perceived personalization per word. |
| **3** | 5 domain lenses for **Discomfort** | Stage 3 is the Danger Zone, the highest-population stage, and the one where a concrete first step is the actual intervention. |
| **4** | 10 lenses for Discovery + Doubt | The adjacent stages, where most remaining traffic sits. |
| **5** | 15 lenses for Loss, Understanding, Integration | Completes the matrix. |

Phases 1–3 are authored in [content-blocks.md](content-blocks.md). Phases 4–5 are left open deliberately — see that document's §6 for the template and the reason.

---

## 7. What this architecture rules out

Stated plainly so it is not reintroduced by accident:

- **No live generation of explore-mode prose.** Not as a feature, not as an enhancement, not behind a flag.
- **No per-user content caching.** There is nothing to cache; assembly is a synchronous function over bundled data, measured in microseconds.
- **No CMS.** Blocks are code, reviewed in pull requests, versioned with the application. Content changes ship as deploys.
- **No free-text interpolation into block bodies.** The user's own words are never spliced into authored prose. This prevents both injection and the uncanny effect of seeing your sentence quoted back inside someone else's paragraph. Where the diagnosis references what the user said, it does so in the diagnosis summary — which is clearly the tool's own synthesis — not inside educational content.
