# Survey Methodology

**Version**: 2.2
**Last updated**: 2026-11-01

---

## 1. One path

**Six multiple-choice questions, scored deterministically in the browser. No network requests.**

v1 specified the diagnostic as one thing and described it as another. The UI specification laid out a wizard — "Question 2 of 6," radio buttons, a Likert slider, a Back button, a fixed progress indicator. The survey methodology described an adaptive conversation that branches on answers, rephrases when the user stalls, terminates early for a clear Stage 1, and challenges self-contradiction. A fixed-widget wizard structurally cannot do any of the adaptive behaviours, and a conversation cannot have a progress bar. Those were two designs sharing a document.

v2.0 resolved it by building both as named paths with one shared output shape. **D-8 kept the wizard and removed the conversation** — the tool is shared as a public link, and a per-visitor model cost makes that a different product. §4 records what that lost.

What the remaining path is:

| | |
|---|---|
| Interaction | 6 multiple-choice questions, about two minutes |
| Scoring | Deterministic pure function, client-side |
| Network requests | **0** |
| Latency | Instant |
| Cost per use | £0 |
| Works offline | Yes, completely |
| Catches contradiction | Detects and names it (§3.5); cannot ask about it |
| Captures nuance | Only what the seven threats and six options express |

The deterministic scoring is also the part of the product that is most thoroughly checkable: being a pure function, it is tested exhaustively over every answer combination rather than sampled. See [test-scenarios.md](test-scenarios.md) §2.

---

## 2. Core principles

Carried from v1, unchanged — they were right.

1. **Conversational, not clinical.** A thoughtful exchange, not a psychological assessment.
2. **Minimum viable questions.** Accurate diagnosis in 5–7 questions. Quality of insight over quantity of data.
3. **Multi-signal.** Combine emotional state, behavioral pattern, cognitive state, and context.
4. **Graceful ambiguity.** Between-stage positions are common and legitimate. Acknowledge the transition rather than forcing a single stage.
5. **Actionable output.** The point is not to label someone but to help them see where they are and what makes sense next.

And one added in v2:

6. **Never diagnose an ethical objection as a stage.** See [grief-framework-context.md](grief-framework-context.md) §7.1. This applies to both paths and is enforced in scoring (§3.6).

---

## 3. The survey

Six questions. Deterministic scoring. No model involved.

### Q1 — Current relationship
*Single select. Signal: stage (self-report).*

> How would you describe your current relationship with AI in your work? There's no wrong answer — I'm just trying to understand where you're starting from.

| # | Option | Contributes |
|---|---|---|
| a | I actively avoid thinking about or using it | `loss +3` |
| b | I'm aware it exists but haven't really engaged | `loss +2`, `doubt +2` |
| c | I'm trying to work out if and how it applies to my work | `doubt +2`, `discomfort +3` |
| d | I'm experimenting with it but still learning | `discovery +3` |
| e | I use it regularly as part of my work | `understanding +3` |
| f | It's just part of how I work now | `integration +3` |

**Layer weight: ×1.0** — self-report is the weakest of the three stage signals.

### Q2 — Domain
*Single select. Signal: domain. No stage contribution.*

> What kind of work do you do? I'm asking so the suggestions are concrete rather than generic.

| # | Option | Sets |
|---|---|---|
| a | Teaching, training, or assessing people's learning | `teaching` |
| b | Making things — writing, design, image, sound, video | `craft` |
| c | Analysis or advisory — research, law, consulting, accounts, policy | `analysis` |
| d | Building or running technical systems | `building` |
| e | Coordinating people, operations, admin, or care | `coordination` |

No "other" and no "general." Every option is a real domain, and a user who fits two picks the one they want advice about. A residual bucket can only produce residual content — see [grief-framework-context.md](grief-framework-context.md) §6.

### Q3 — Behavior
*Multi select. Signal: stage (behavioral). **Strongest signal.***

> In the past couple of months, what have you actually done related to AI — if anything?

| # | Option | Key | Contributes |
|---|---|---|---|
| a | Nothing at all | `nothing` | `loss +3`, `doubt +1` |
| b | Read articles or watched videos about it | `consumed` | `doubt +3` |
| c | Attended a workshop, training, or talk | `trained` | `discomfort +2` |
| d | Tried a tool once or twice out of curiosity | `tried` | `discomfort +1`, `discovery +2` |
| e | Used it several times for specific tasks | `used` | `discovery +2`, `understanding +2` |
| f | Built it into how I do some part of my work | `built` | `understanding +3` |
| g | Helped colleagues or students learn it | `taught` | `integration +3` |

**Layer weight: ×2.0** — behavior outranks everything, per [grief-framework-context.md](grief-framework-context.md) §8.1.

> **The training-without-implementation rule.** If `trained` is selected and **none** of `tried`, `used`, `built`, or `taught` is selected, add `discomfort +5` before weighting.
>
> This is the framework's single highest-value diagnostic pattern: someone who has invested the effort to attend training and has still not tried anything is in the Danger Zone almost by definition. The bonus is large enough to be decisive on its own, which is intended.

### Q4 — Emotion
*Single select. Signal: stage (emotional).*

> When you think about AI and your work, what's the main feeling?

| # | Option | Contributes |
|---|---|---|
| a | Fear, or a kind of grief | `loss +3` |
| b | Resentment or irritation | `doubt +3` |
| c | Anxiety, or feeling overwhelmed | `discomfort +3` |
| d | Curiosity, maybe some anticipation | `discovery +3` |
| e | Confidence — I know roughly what I'm doing | `understanding +3` |
| f | Satisfaction. It's settled | `understanding +1`, `integration +2` |
| g | Honestly, mostly indifference | `loss +2` |

**Layer weight: ×1.5.**

Option (g) is new in v2. v1 had no path for indifference, which read as a gap in the instrument — people in Loss often present as uninterested rather than afraid, and offering only "fear" invites a false negative.

### Q5 — Primary threat
*Single select, plus optional second. Signal: threat.*

> Which of these is closest to what actually bothers you?

| # | Option | Sets |
|---|---|---|
| a | I spent years getting good at something that's now widely available | `skills_obsolescence` |
| b | I'm supposed to be the one who knows, and that's slipping | `identity_authority` |
| c | I can't tell what's genuine, learned, or actually someone's own work | `verification` |
| d | The output is competent and hollow, and that matters | `authenticity_quality` |
| e | I'm not sure my role survives this | `economic` |
| f | It was built on other people's work without consent | `ethical` |
| g | I'm accountable for results from a process I can't inspect | `control_opacity` |

Followed by: *"Anything else on that list also ring true?"* — optional, single additional selection. Ordered primary-first. The second is dropped at assembly time if it is redundant with the first (see [content-architecture.md](content-architecture.md) §4.3).

No stage contribution. Threat and stage are independent axes by design.

### Q6 — Pace
*Single select. Signal: Rogers position. No stage contribution.*

> Last one, and it's about disposition rather than AI. When something new comes along in your field, which is usually you?

| # | Option | Sets |
|---|---|---|
| a | I'm usually among the first to try it, before it's proven | `innovator` |
| b | I move early, once it looks like it's real | `early_adopter` |
| c | I wait until I've seen it work for people I trust | `early_majority` |
| d | I come to it when it becomes necessary | `late_majority` |
| e | I rarely adopt new things, and that's served me well | `laggard` |

Option (e) is phrased to be chooseable without self-criticism. The framework's position is that a laggard disposition is strategic, not deficient ([grief-framework-context.md](grief-framework-context.md) §3), and a question that makes it embarrassing to select will produce a skewed instrument.

### 3.1 Scoring algorithm

```typescript
const LAYER_WEIGHT = { selfReport: 1.0, behavior: 2.0, emotion: 1.5 } as const;

function scoreQuick(answers: QuickAnswers): Diagnosis {
  const score: Record<Stage, number> = {
    loss: 0, doubt: 0, discomfort: 0,
    discovery: 0, understanding: 0, integration: 0,
  };

  add(score, Q1_WEIGHTS[answers.q1],  LAYER_WEIGHT.selfReport);

  // Behavior: sum every selected option, then apply the danger-zone rule
  // BEFORE weighting, so the +5 is weighted alongside the rest.
  const behavior: Record<Stage, number> = zeroScores();
  for (const key of answers.q3) add(behavior, Q3_WEIGHTS[key], 1);

  const IMPLEMENTED = ['tried', 'used', 'built', 'taught'] as const;
  if (answers.q3.includes('trained') &&
      !IMPLEMENTED.some(k => answers.q3.includes(k))) {
    behavior.discomfort += 5;
  }
  add(score, behavior, LAYER_WEIGHT.behavior);

  add(score, Q4_WEIGHTS[answers.q4], LAYER_WEIGHT.emotion);

  const ranked = (Object.keys(score) as Stage[])
    .sort((a, b) => score[b] - score[a] || POSITION[a] - POSITION[b]);

  const [top, runnerUp] = ranked;
  const margin = score[top] - score[runnerUp];

  const confidence = margin >= 4 ? 'high' : margin >= 2 ? 'moderate' : 'low';

  // Adjacent stages with a thin margin means transition, not a coin flip.
  const adjacent = Math.abs(POSITION[top] - POSITION[runnerUp]) === 1;
  const transitionToward =
    adjacent && margin < 3
      ? (POSITION[runnerUp] > POSITION[top] ? runnerUp : null)
      : null;

  const domain = Q2_DOMAIN[answers.q2];
  const stagePosition = POSITION[top];
  const gap = FIELD_POSITION[domain] - stagePosition;

  return {
    stage: top,
    stageConfidence: confidence,
    transitionToward,
    domain,
    threats: [answers.q5, answers.q5b].filter(Boolean) as ThreatId[],
    rogers: Q6_ROGERS[answers.q6],
    gap: round1(gap),
    signalConflict: detectConflict(behavior, Q4_WEIGHTS[answers.q4]),
    ethicalPosition: answers.q5 === 'ethical' ? 'primary' : null,
    path: 'quick',
  };
}
```

Ties break toward the **earlier** stage. A genuine tie means insufficient evidence to credit progression, and over-diagnosing someone as further along is the more harmful error — it skips the validation they need and offers next steps they are not positioned to take.

### 3.2 Worked example — the canonical Stage 3 faculty case

Answers: Q1=c, Q2=a, Q3=[`consumed`, `trained`], Q4=c, Q5=`verification` (+`identity_authority`), Q6=c.

| Signal | Raw | ×Weight | Result |
|---|---|---|---|
| Q1 (c) | doubt 2, discomfort 3 | ×1.0 | doubt 2.0, discomfort 3.0 |
| Q3 (`consumed`,`trained`) | doubt 3, discomfort 2 | | |
| Q3 danger-zone rule | discomfort **+5** | | |
| Q3 total | doubt 3, discomfort 7 | ×2.0 | doubt 6.0, discomfort 14.0 |
| Q4 (c) | discomfort 3 | ×1.5 | discomfort 4.5 |

Totals: **discomfort 21.5**, doubt 8.0, all others 0.

- `stage: 'discomfort'`, margin 13.5 → `confidence: 'high'`
- `transitionToward: null` (margin ≥ 3)
- `domain: 'teaching'`, `rogers: 'early_majority'`
- `gap = 3.1 − 3 = +0.1` → roughly aligned; **the field is at the saddle too**
- `threats: ['verification', 'identity_authority']` → both render. These are not one of the redundancy pairs in [content-architecture.md](content-architecture.md) §4.3: losing the ability to verify someone's work and losing standing as the one who knows are genuinely different losses. The pair that *would* collapse here is `verification` + `control_opacity`.

The gap result is the point of the whole construct. This person is not behind — their entire profession is standing where they are. The dial shows both markers nearly superimposed on the narrow band, and the pace note renders its `neutral` framing rather than the apologetic `fieldAhead` one.

### 3.3 Worked example — the negative-gap case

Answers: Q1=e, Q2=e, Q3=[`used`,`built`], Q4=b, Q5=`economic`, Q6=b.

Totals: understanding (3.0 + 10.0) = 13.0, discovery 4.0, doubt 4.5, integration 0.

- `stage: 'understanding'`, margin 8.5 → `high`
- `domain: 'coordination'`, `gap = 2.4 − 5 = −2.6`

Strongly negative. This person is well ahead of a field that has barely engaged, and `pace_note.early_adopter` renders its `userAhead` framing. Note the emotion answer (resentment) and the threat (`economic`) — the content speaks to isolation and to institutional slowness, not to grief about the technology. v1 had no representation for this person at all.

### 3.4 Confidence and output phrasing

| Confidence | Diagnosis opens with |
|---|---|
| `high` | "You're in the **[stage]** stage." |
| `moderate` | "You look like you're in **[stage]**, with some signs of **[runner-up]**." |
| `low` | "Based on this, I'm seeing signs of both **[stage]** and **[runner-up]** — which often means you're in transition between them." |

A `low`-confidence result says so and stops there. v2.0 used this moment to offer the Conversation path; with that gone, the honest move is to report the uncertainty rather than imply a better answer exists somewhere. Being told "this reading is on the uncertain side, which often means you are between stages" is itself useful information about where someone is.

### 3.5 Signal conflict

```typescript
function detectConflict(
  behavior: Record<Stage, number>,
  emotion: Record<Stage, number>,
): boolean {
  const topBehavior = argmax(behavior);
  const topEmotion = argmax(emotion);
  return Math.abs(POSITION[topBehavior] - POSITION[topEmotion]) >= 2;
}
```

When set, the diagnosis adds one sentence before the stage content:

> Worth noting: what you're doing and what you're feeling are pointing in different directions. You described [emotion] but you've also been [behavior]. Feelings often lag actions by a while — this reading follows the actions.

The weights already resolve the conflict correctly (behavior ×2.0 beats emotion ×1.5). Surfacing it does something the weighting cannot: it tells the person the discrepancy was seen rather than silently overruled.

### 3.6 Ethical-position handling

When `Q5 = ethical`, three things change:

1. `ethicalPosition: 'primary'` is set on the diagnosis.
2. The threat response renders **above** the domain lens and the `firstExperiment` is suppressed ([content-architecture.md](content-architecture.md) §4.4).
3. The diagnosis text does not frame the stage as a position to move out of. The stage is still reported — it is real information — but the framing is descriptive rather than developmental.

Stage scoring is **not** altered. Someone with an ethical objection still occupies a stage, and pretending otherwise would be its own kind of condescension. What changes is what the tool does with that fact.

---

## 4. The removed Conversation path

v2.0 specified, and v2.1 built, a second diagnostic path: adaptive dialogue through a serverless proxy, 5-8 turns, ending in one structured-output classification, with every failure falling back to the Quick path.

It was removed on 2026-11-01. See [README.md](README.md) **D-8** — the tool is shared as a public link, and a per-visitor model cost makes that a different product.

What was genuinely lost, stated plainly rather than minimised:

| Capability | Status now |
|---|---|
| Branching on an answer | Gone. Question order is fixed. |
| Rephrasing a non-answer | Gone. Every question has an option that fits, which is the static substitute. |
| Stopping early for a clear Stage 1 | Gone. Six questions for everyone. |
| Asking about a self-contradiction | Partly kept — §3.5 detects it and names it, but cannot ask. |
| Open-ended capture of a loss that fits no option | Gone. Q5's seven threats are the vocabulary. |

The adaptive behaviours are **not** approximated with heuristics. Faking branching with keyword matching would make the instrument worse than an honest fixed one, because the failures would be invisible. Where the conversation would have asked, the Quick path either covers it with an option or does without.


## 5. Edge cases

Both paths unless noted.

### Multiple contexts
*Faculty member who uses AI personally but not in teaching.*

Q2 forces a single domain, which resolves this implicitly: the person picks the context they want advice about. The diagnosis adds: *"This reflects your work context specifically."*

### Rejection on principle
Handled as `ethicalPosition: 'primary'` — see §3.6 and [grief-framework-context.md](grief-framework-context.md) §7.1. The only question worth asking is whether the position is unconditional or conditional, and that question is put to the user rather than inferred.

### Overclaiming
*Reports Integration, exhibits Doubt indicators.*

The weighting handles it without special-casing: self-report is ×1.0 and behaviour is ×2.0, so a confident self-assessment unsupported by action does not survive. `signalConflict` surfaces it (§3.5), which is as far as a fixed instrument can go — it can name the discrepancy, but it cannot ask about it.

### Repeated non-answers
Not applicable: every question has an option that fits, including indifference (Q4 option g) and "nothing at all" (Q3). Where v1 would have rephrased, the option list is the substitute. Diagnose on available evidence with `confidence: 'low'` and say so:
> Based on what you've shared, you might be in [stage] — though I'm working from limited information. Does that feel close?

### Distress
If the user describes distress beyond work frustration, both paths surface, verbatim:
> I want to be clear about what I am — a reflection tool built on a change-management framework, not a mental health professional. If what's going on is heavier than work frustration, someone who specializes in career transitions or workplace stress would be a better place to take it.

This text is fixed and authored. Nothing generates it, and nothing varies it.

---

## 6. Diagnosis output format

```
[signalConflict sentence, if set]

You're in the [STAGE NAME] stage.

[rationale — 2-3 sentences citing their own answers back, e.g.
 "You've been to a session but haven't tried anything yet, and
 that pattern is the clearest marker of this stage."]

[One line on what the stage feels like from inside.]

[Gap sentence, phrased by sign — see grief-framework-context.md §5.2]

Would you like to read more about this stage, or see the whole path?
```

### Example — Stage 3, teaching, aligned gap

> **You're in the Discomfort stage.**
>
> You've been to a session on this but haven't tried anything yet, and you described feeling overwhelmed. That combination is the clearest marker there is for this stage — it means you're past denial and past arguing, and now stuck in the gap between knowing you should do something and knowing what.
>
> This stage is a fork rather than a waiting room, which is why the framework calls it the Danger Zone.
>
> One thing worth seeing: **your field is standing in the same place you are.** Teaching is the one domain where the profession itself is at this point — assessment has broken and nothing has replaced it. The paralysis is structural. You are not behind.
>
> Would you like to read more about this stage, or see the whole path?

---

## 7. Measurement

**None.** The application collects nothing and sends nothing.

v1 asked for diagnostic-accuracy tracking, stage distribution and transition patterns while the design document forbade all persistence — a contradiction v2.0 resolved with an opt-in, aggregate-only endpoint, off unless configured.

D-8 resolves it the other way: the endpoint is gone, and so is the "does this feel accurate?" prompt that fed it. Any endpoint at all forfeits the zero-network property that lets the tool be shared freely, and an accuracy rate is not worth that trade. A prompt whose answer is discarded is worse than no prompt, so it was removed rather than left as decoration.

If accuracy ever needs measuring, the honest routes do not involve the product phoning home: watch someone use it, or ask a cohort directly.


## 8. Ethics

**Avoid pathologizing.** A reflection tool, not an assessment of dysfunction. No language implying that Stage 1 or 2 is wrong or deficient. The banned-vocabulary list in [content-specification.md](content-specification.md) §2 is enforced at build time.

**Respect agency.** Users may choose to remain in early stages. Provide information and invitation, never pressure. The product has no notion of a correct destination.

**Acknowledge limits.** See §5 (distress) and [grief-framework-context.md](grief-framework-context.md) §14.

**Privacy, stated plainly.** Before the diagnosis is shown:

> Everything happens in your browser. Nothing you enter is sent anywhere, stored, or seen by anyone — including us. Close the tab and it is gone.

The claim has no qualifier now, which is the point of D-8: it is enforced in CI rather than promised (see [software-design-document.md](software-design-document.md) §7.1).

And at the end — replacing v1's suggestion that the user make their own note:

> **Download a copy** — one page, generated here on your machine.

See [README.md](README.md) D-7.
