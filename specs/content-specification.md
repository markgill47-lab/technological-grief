# Content Specification: Tone, Voice, and Guardrails

**Version**: 2.0
**Last updated**: 2026-10-31

---

## 1. Scope

This document is the **style guide**. It governs every word the application shows a user, whether authored into a content block or generated on the Conversation path.

### What moved out of this document in v2

v1's content specification contained three different kinds of thing. They are now separated, because they are maintained by different people on different cadences:

| v1 content | Now lives in |
|---|---|
| Per-stage baseline prose (six stages) | [content-blocks.md](content-blocks.md) §2 — it is content, not specification |
| Survey question bank | [survey-methodology.md](survey-methodology.md) §3 — it is the instrument, with scoring weights attached |
| Tone, voice, pitfalls, examples | **Here** |

What remains is the part that applies to all content equally and that a reviewer checks against.

---

## 2. Voice

### 2.1 The four tensions

Every piece of content holds four tensions. Collapsing any of them produces a recognizable failure.

| Hold | Not | Collapse looks like |
|---|---|---|
| **Empathetic** | Clinical | "Subjects in this stage exhibit avoidance behaviors." |
| **Educational** | Preachy | "It's important to understand that change is inevitable." |
| **Honest** | Harsh | "Your skills are obsolete and you need to accept that." |
| **Hopeful** | Pollyannaish | "This is actually an exciting opportunity for growth!" |

The hardest is honest-not-harsh, because the framework's substance includes real losses. The test: would a colleague who respects you say this to you directly? They would tell you the truth. They would not relish it.

### 2.2 Banned vocabulary

**Build-enforced.** The tone scan in [content-architecture.md](content-architecture.md) §5 fails the build on any of these in a content block:

```
symptom, symptoms, patient, treatment, diagnosis of, disorder,
pathology, pathological, prognosis, clinical, therapy, dysfunction,
coping mechanism, maladaptive
```

"Diagnosis" alone is permitted — it is the feature name and it is used in the UI. "Diagnosis of" is not; the preposition is what turns a positioning exercise into a medical claim.

Also avoid, though not mechanically blocked because they have legitimate uses:

- **"Just"** — "just try it," "just embrace it." Minimizes the difficulty the framework exists to take seriously.
- **"Simply"** — same.
- **"Obviously" / "of course"** — if it were obvious, the reader would not be here.
- **"Journey"** — exhausted, and it implies a destination the framework does not promise.
- **"Embrace"** — nobody in Loss is going to embrace anything, and asking makes the tool sound like it was not listening.

### 2.3 Avoid

- **Judgment about position.** Never "you should be further along," never an implication that a later stage is better as a person. Stages describe where someone is, not how they are doing.
- **Dismissing legitimate concerns.** Never "AI won't really affect your field." The framework's position is that much resistance is a rational response to real losses ([grief-framework-context.md](grief-framework-context.md) §12).
- **False promises.** Never "everything will be fine if you just…" Nothing in the framework supports that and the economic threat in particular cannot be reassured away.
- **Oversimplification.** "Change is hard but worth it" is true, useless, and indistinguishable from a poster.

### 2.4 Embrace

- **Validation of feelings** — "It makes sense that this lands the way it does."
- **Specificity** — "In teaching, this usually shows up as…" beats "in your field this may manifest."
- **Agency** — "You have choices here" and then naming them.
- **Reality** — "This is genuinely difficult" when it is.
- **Forward momentum** — one small concrete thing, not a strategy.

### 2.5 Second person, no exceptions

Content addresses the reader as **you**. Never "users in this stage," never "people experiencing Discomfort often." The reader is the person in the stage, not someone studying one.

This is the single most consistent difference between content that lands and content that reads like a textbook, and it is easy to drift out of while writing about a framework.

---

## 3. Register by stage

The voice is constant. What changes is what the content is allowed to ask for.

| Stage | Register | May ask for | Must not |
|---|---|---|---|
| **Loss** | Gentle, unhurried | Naming what is ending | Suggest a tool. Suggest action of any kind. |
| **Doubt** | Direct, respectful of the objection | A falsifiable version of the objection; a credible peer | Argue. Persuade. Supply enthusiasm. |
| **Discomfort** | Warm, concrete, decisive | One small specific experiment | Offer options. Add information. |
| **Discovery** | Encouraging, curious | A second experiment; a record-keeping habit | Critique their attempts. Push for speed. |
| **Understanding** | Peer-to-peer | Depth, or helping one person | Leave them isolated. Congratulate. |
| **Integration** | Collegial, slightly demanding | Mentoring someone in Discomfort | Take their generosity for granted. |

Two of these are routinely got wrong and are worth stating as rules:

> **Never offer a tool to someone in Loss or Doubt.** The framework is explicit ([grief-framework-context.md](grief-framework-context.md) §10): for Loss, do not offer solutions; for Doubt, do not argue or add hype. A first experiment at these stages is a reflective one. This is enforced structurally by the stage constraints in [content-blocks.md](content-blocks.md) §6.

> **Never give someone in Discomfort more than one thing to do.** The stage *is* option paralysis. A list of three suggestions is a correct-looking answer that makes the condition worse.

---

## 4. The ethical objection

Content addressed to a user whose primary threat is `ethical` follows different rules. See [grief-framework-context.md](grief-framework-context.md) §7.1 and [content-architecture.md](content-architecture.md) §4.4.

1. **Validate on the merits, first, before anything else.** Not "I hear you, and…" — the concerns about provenance, consent, labor, and energy are genuinely unresolved, and the content says so plainly.
2. **Never imply that progression requires abandoning the position.** The framework does not claim that, and a tool that implies it is doing something both wrong and transparent.
3. **No first experiment.** Suppressed structurally.
4. **The only question available** is whether the position is unconditional or conditional — and it is put to the user, never decided for them.

This is the highest-sensitivity content in the product. Any edit to `threat_response.ethical` requires a second reviewer.

---

## 5. Pitfalls

### 5.1 Over-explaining the framework

**Wrong**: "According to the Change Cycle model developed by Salerno and Brock, Stage 3 represents the pivotal juncture at which…"

**Right**: "You know something has to change. You don't know what to do."

The user came to understand themselves, not the model. Framework vocabulary is scaffolding for the authors; it should be close to invisible in the output. Name a stage, because the stage name is the useful handle. Do not cite the literature.

### 5.2 Being prescriptive

**Wrong**: "You need to start using AI in your teaching immediately."

**Right**: "Here's one thing you could try this week, if you want to."

The product has no correct destination. Users may choose to stay where they are, and the framework treats that as legitimate ([survey-methodology.md](survey-methodology.md) §8).

### 5.3 Dismissing earlier stages

**Wrong**: "Once you get past the resistance phase…"

**Right**: "Doubt is where most people spend the longest, and the skepticism is usually doing real work."

Every stage is a reasonable response to its own circumstances. The content never looks back down the path with condescension.

### 5.4 False equivalence

**Wrong**: "Every technology felt like this — remember when people feared calculators?"

**Right**: "Previous shifts followed this shape too, though this one is arriving faster than most."

Minimizing by analogy is a reliable way to lose a reader who has thought about this more than the analogy has. The velocity claim is the honest version, and the framework supports it qualitatively ([grief-framework-context.md](grief-framework-context.md) §5.4 — note the data caveat there; do not cite specific adoption numbers without re-sourcing them).

### 5.5 Toxic positivity

**Wrong**: "This is an exciting opportunity to reinvent yourself!"

**Right**: "Something is ending. What replaces it isn't clear yet, and that's the uncomfortable part."

### 5.6 Quoting the user back at themselves

**Wrong**: Splicing a user's sentence into authored prose — "Given that you said *'I feel like I'm drowning in options,'* this stage…"

**Right**: Letting the diagnosis rationale do that work, where it is clearly the tool's own synthesis, and keeping authored content free of interpolation.

This is a hard architectural rule, not a preference ([content-architecture.md](content-architecture.md) §7). It closes an injection path and avoids the uncanny effect of reading your own words inside someone else's paragraph.

---

## 6. Worked examples

### 6.1 Faculty member, Discomfort, verification threat

> **You're in the Discomfort stage.**
>
> You've been to a session on this but haven't tried anything yet, and you described feeling overwhelmed. That combination is the clearest marker there is — you're past denial and past arguing, and now stuck between knowing you should do something and knowing what.
>
> One thing worth seeing: your field is standing in the same place you are. Teaching is the one domain where the profession itself is at this point. The paralysis is structural. You are not behind.

Why this works: cites their own answers rather than asserting; names the stage without explaining the model; and the gap sentence does something no amount of reassurance achieves, because it is a fact about their profession rather than an encouragement.

### 6.2 Illustrator, Doubt, ethical threat

> Your objection is not a stage, and this tool isn't going to treat it as one.
>
> The concerns about training data and consent are unresolved — not by you, and not by the people who have thought hardest about them. Declining to participate in something you consider wrong is a position, not a symptom.
>
> The one distinction worth drawing, and only you can draw it: is this *"not under any circumstances"* or *"not until certain conditions are met"*? Both are legitimate. They lead different places.

Why this works: leads with the override rather than burying it; no first experiment; and the question is genuinely open rather than rhetorical.

### 6.3 Operations manager, Understanding, negative gap

> **You're in the Understanding stage.**
>
> You've built this into several parts of your work and you're confident about where it helps. The feeling you described — irritation — is worth paying attention to, though, because it probably isn't about the technology.
>
> You're roughly two and a half stations ahead of your field. Coordination work is the least engaged of the five domains, which means you're likely the only person in most of your meetings who has thought this through. That's isolation, not grief, and it needs something different: people outside your organization to compare notes with.

Why this works: the negative gap is read as a different condition rather than as a good score, and the emotional answer (resentment at Understanding, which would otherwise look like a scoring error) is explained rather than ignored.

---

## 7. Review checklist

Before any content block is marked reviewed:

- [ ] Second person throughout
- [ ] No banned vocabulary (build-enforced, but read it anyway)
- [ ] No "just," "simply," "obviously," "journey," "embrace"
- [ ] All four tensions in §2.1 held
- [ ] Stage register respected per §3
- [ ] Nothing offered to Loss or Doubt that is a tool
- [ ] Nothing offered to Discomfort that is a list
- [ ] No framework citation; stage name only
- [ ] No specific adoption statistics unless freshly sourced
- [ ] Within ±40% of target word count
- [ ] Reads as though written by one person who has met the reader

The last one is the real test and it is not mechanizable. Read the assembled page, not the block.

---

## 8. Versioning

Content is code. Blocks live in TypeScript modules, ship as deploys, and are reviewed in pull requests ([content-architecture.md](content-architecture.md) §7 — there is no CMS).

| Change | Requires |
|---|---|
| Typo, phrasing | Normal review |
| Substantive edit to a stage core | Framework check — does it still match [grief-framework-context.md](grief-framework-context.md)? |
| Any edit to `threat_response.ethical` | Second reviewer |
| New domain lens | Practitioner review before `domainVerified: true` |
| Field-maturity constant | Framework §5.3 owner sign-off |
| System prompt | Must stay byte-stable within a release, or prompt caching silently stops working ([software-design-document.md](software-design-document.md) §5.2) |

Every block carries `lastReviewed`. The build warns at twelve months.

---

## Revision history

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-01-24 | Initial content specification |
| 2.0 | 2026-10-31 | Narrowed to a style guide. Moved per-stage prose to [content-blocks.md](content-blocks.md) and the question bank to [survey-methodology.md](survey-methodology.md). Added the banned-vocabulary list as a build-enforced check. Added the stage register table (§3) with the two structural rules about Loss/Doubt and Discomfort. Added §4 on ethical-objection content. Added the no-interpolation rule (§5.6). Replaced v1's three worked examples with three covering the cases v1 had no representation for: the aligned-gap faculty case, the ethical override, and the negative gap. |
