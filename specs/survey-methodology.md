# Survey Methodology: Two Diagnostic Paths

**Version**: 2.0
**Last updated**: 2026-10-31

---

## 1. Why there are two paths

v1 specified the diagnostic as one thing and described it as another. The UI specification laid out a wizard — "Question 2 of 6," radio buttons, a Likert slider, a Back button, a fixed progress indicator. The survey methodology described an adaptive conversation that branches on answers, rephrases when the user stalls, terminates early for a clear Stage 1, and challenges self-contradiction.

A fixed-widget wizard structurally cannot do any of the adaptive behaviors. A conversation cannot have a progress bar. These were two designs sharing a document.

v2 ships both, named, with one shared output shape:

| | **Quick** | **Conversation** |
|---|---|---|
| Interaction | 6 multiple-choice questions | Adaptive dialogue, 5–8 turns |
| Scoring | Deterministic, client-side | Model-assessed, one structured call |
| API calls | **0** | ~6 |
| Latency | Instant | ~2s per turn |
| Cost | Free | See [software-design-document.md](software-design-document.md) §5.4 |
| Works offline | Yes | No |
| Catches contradiction | Partially (§3.5) | Yes |
| Captures nuance | No | Yes |
| Output | `Diagnosis` | `Diagnosis` |

Quick is the **default** and the **fallback**. It is offered first, and it is what runs when no proxy is configured, when the API is unreachable, when the user declines to type, and when a Conversation session fails partway through. The application is fully functional with no Anthropic dependency at all.

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

## 3. The Quick path

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

The gap result is the point of the whole construct. This person is not behind — their entire profession is standing where they are. The terrain shows both markers nearly superimposed at the saddle, and the pace note renders its `neutral` framing rather than the apologetic `fieldAhead` one.

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

A `low`-confidence Quick result also offers the Conversation path explicitly: *"A few questions back and forth would place this more accurately, if you'd like."* This is the one place the application upsells the API path, and it does so only when the deterministic instrument has genuinely run out of signal.

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

## 4. The Conversation path

Live, adaptive dialogue. 5–8 turns. This is the only place in the application where live model calls are made, because adaptive questioning is the one capability static logic genuinely cannot approximate.

### 4.1 What it adds over Quick

- **Branching.** The third question depends on the first two.
- **Rephrasing.** "I don't know" gets a differently-framed question, not the same one again.
- **Early termination.** A clear Stage 1 does not get interrogated through question seven.
- **Contradiction handling.** Not just detecting conflict but asking about it.
- **Open-ended threat capture.** People describe losses that do not map cleanly onto seven options.

### 4.2 Flow

```
Welcome ──▶ Q1 (fixed opener) ──▶ adaptive turns 2..n ──▶ classify ──▶ Diagnosis
                                         │
                                         ├── early exit on clear Stage 1 (n≥4)
                                         └── on any failure ──▶ Quick path
```

The opening question is fixed and phrased identically to Quick's Q1.

> **Corrected during implementation.** This went on to say that a user who abandons Conversation "can be handed to Quick without losing their place." They cannot, and should not be. The conversation's opening takes **free text**; Quick's Q1 is **multiple choice**. Transferring the answer would mean classifying that text onto one of six options — and on the fallback path, classification is precisely the thing that has just failed. A keyword guess that lands on the wrong option corrupts the diagnosis silently and invisibly.
>
> The fallback therefore carries nothing across and asks the six questions cleanly. The transcript is retained in session state, so nothing the person wrote is discarded; it simply is not used to pre-fill an answer.

### 4.3 Question progression

Phases from v1, retained — the structure was sound.

| Phase | Turns | Goal |
|---|---|---|
| Opening | 1–2 | Baseline relationship; domain and institutional pressure |
| Emotional & behavioral | 3–4 | Feelings, and what they have actually done |
| Depth | 5–6 | The specific loss being grieved; obstacles |
| Forward | 7 | Near-term intent and readiness |

Phase templates vary by what has been established. Examples:

**Turn 3, if avoidant (hypothesis Loss/Doubt):**
> When you think about AI affecting your field, what comes up? Fear, frustration, indifference, something else?

**Turn 3, if engaged (hypothesis Discovery+):**
> As you've been working with it, what's the main feeling? Excited, confident, still uncertain, some mix?

**Turn 5, varying by hypothesis:**

| Hypothesis | Question |
|---|---|
| Loss / Doubt | What concerns you most about how this might change your work? |
| Discomfort / Discovery | What's been the hardest part of working out how it fits? |
| Understanding / Integration | What did you have to let go of or change about how you used to work? |

### 4.4 Termination

The model ends the conversation and classifies when **any** holds:

- Three or more strong indicators align on one stage
- Eight turns have elapsed (hard cap)
- Clear Stage 1 established by turn 4 — further questioning of someone in denial reads as interrogation
- Two consecutive non-answers after a rephrase

### 4.5 Classification call

One call at the end, using **structured outputs**. Not a tool call.

> **v1 would now fail outright.** v1 specified forcing a diagnosis via `tool_choice`. On current models `tool_choice: {type: "any"}` and `{type: "tool", name: ...}` return **HTTP 400** — forced tool choice has been removed. The correct mechanism is `output_config: {format: {...}}`, which also gives schema-validated output without the tool round trip. See [software-design-document.md](software-design-document.md) §5.3.

The classifier receives the full transcript and returns a `Diagnosis` with `path: 'conversation'`. It must additionally return:

- `rationale`: 2–3 sentences citing **specific things the user said**. This is what makes the diagnosis feel earned rather than assigned, and it is the one place the user's own words legitimately appear (see [content-architecture.md](content-architecture.md) §7 — they are never spliced into authored content).
- `threats`: ordered, mapped onto the seven canonical ids, even where the user's phrasing did not match an option.

### 4.6 Validation of model output

The returned `Diagnosis` is **not trusted**. Before use:

| Check | On failure |
|---|---|
| `stage` is one of six ids | Fall back to Quick scoring over whatever was gathered |
| `domain` is one of five ids | Prompt the user with Q2 directly |
| `threats` are canonical ids, length 1–2 | Drop unrecognized entries |
| `rogers` is one of five ids | Omit the pace note |
| `gap` **ignored entirely** | Always recomputed client-side from `FIELD_POSITION[domain] − POSITION[stage]` |
| `rationale` length ≤ 600 chars, no markup | Truncate; strip |

The gap is never taken from the model. It is a deterministic function of two values the application owns, and letting a model return it would introduce drift in the one number the visualization depends on.

---

## 5. Edge cases

Both paths unless noted.

### Multiple contexts
*Faculty member who uses AI personally but not in teaching.*

Conversation path:
> It sounds like you're in different places depending on context — further along personally than professionally. Let's focus on the professional side, since that's probably where you want the guidance.

Quick path: Q2 forces a single domain, which resolves this implicitly. The diagnosis adds: *"This reflects your work context specifically."*

### Rejection on principle
Handled as `ethicalPosition: 'primary'` — see §3.6 and [grief-framework-context.md](grief-framework-context.md) §7.1. The only question worth asking is whether the position is unconditional or conditional, and that question is put to the user rather than inferred.

### Overclaiming
*Reports Integration, exhibits Doubt indicators.*

The weighting handles it without special-casing: self-report is ×1.0 and behavior is ×2.0, so a confident self-assessment unsupported by action does not survive. `signalConflict` surfaces it (§3.5). The Conversation path may ask directly.

### Repeated non-answers
After two rephrases, diagnose on available evidence with `confidence: 'low'` and say so:
> Based on what you've shared, you might be in [stage] — though I'm working from limited information. Does that feel close?

### Distress
If the user describes distress beyond work frustration, both paths surface, verbatim:
> I want to be clear about what I am — a reflection tool built on a change-management framework, not a mental health professional. If what's going on is heavier than work frustration, someone who specializes in career transitions or workplace stress would be a better place to take it.

This text is fixed, not generated. The Conversation path's system prompt includes it as a quoted string to be reproduced exactly.

---

## 6. Diagnosis output format

```
[signalConflict sentence, if set]

You're in the [STAGE NAME] stage.

[rationale — 2-3 sentences. Conversation: cites what they said.
 Quick: cites their answers, e.g. "You've been to a session but
 haven't tried anything yet, and that pattern is the clearest
 marker of this stage."]

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

> **Resolves a v1 contradiction.** v1 asked for diagnostic-accuracy tracking, stage distribution, and transition patterns, while the design document forbade all persistence and server-side logging. Those could not both hold.

Opt-in, aggregate-only, and absent entirely unless an endpoint is configured.

After a diagnosis, one optional question: *"Does this feel accurate?"* — Yes / Not really / Skip.

If and only if the user answers, and only if `VITE_METRICS_ENDPOINT` is set, one fire-and-forget POST:

```json
{ "stage": "discomfort", "domain": "teaching", "path": "quick",
  "confidence": "high", "accurate": true, "gapSign": "aligned" }
```

Explicitly **not** sent: free text, survey answers, threats, Rogers position, session identifier, timestamp finer than the day, IP (stripped at the proxy). The payload is deliberately too coarse to re-identify anyone and too thin to reconstruct a response set.

What this buys: accuracy rate by stage, stage distribution by domain, and whether Conversation meaningfully beats Quick. What it cannot answer: transition patterns over time, which require longitudinal identity the privacy model rules out. v1 listed that as a metric; it is not achievable and has been dropped rather than quietly compromised for.

**Iteration priorities**, retained from v1:

1. Months 1–2 — Stage 3 detection accuracy
2. Months 3–4 — distinguishing the ends of the spectrum (1–2 vs 5–6)
3. Months 5–6 — whether Quick can reach five questions reliably

---

## 8. Ethics

**Avoid pathologizing.** A reflection tool, not an assessment of dysfunction. No language implying that Stage 1 or 2 is wrong or deficient. The banned-vocabulary list in [content-specification.md](content-specification.md) §2 is enforced at build time.

**Respect agency.** Users may choose to remain in early stages. Provide information and invitation, never pressure. The product has no notion of a correct destination.

**Acknowledge limits.** See §5 (distress) and [grief-framework-context.md](grief-framework-context.md) §14.

**Privacy, stated plainly.** Before the diagnosis is shown:

> This conversation only exists in your browser. Nothing is stored and nothing is sent anywhere except the questions themselves, if you chose the conversational path.

And at the end — replacing v1's suggestion that the user make their own note:

> **Download a copy** — one page, generated here on your machine.

See [README.md](README.md) D-7.
