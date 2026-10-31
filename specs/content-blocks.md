# Content Blocks: Authored Library

**Version**: 2.0 (new in v2.0)
**Last updated**: 2026-10-31
**Prerequisite**: [content-architecture.md](content-architecture.md)

This document holds the authored content. It covers authoring phases 1–3 (all stage cores, all threat responses, all pace notes, and the complete five-domain lens set for Discomfort). Phases 4–5 are templated in §6 and left open deliberately.

---

## 1. Conventions

### Section markers

`stage_core` bodies carry three sections, split on HTML comment markers. The assembler splits on these and maps them to the page sections in [content-architecture.md](content-architecture.md) §4.6. Everything before the first marker is the overview.

```
<!--@why-->        begins "Why this happens"
<!--@forward-->    begins "Moving forward"
```

### Schema extension for pace notes

`pace_note` blocks replace `body` with a `framings` object, because the gap sign changes the sentence rather than adding to it (see [content-architecture.md](content-architecture.md) §4.5):

```typescript
interface PaceNoteBlock extends Omit<ContentBlock, 'body'> {
  kind: 'pace_note';
  framings: {
    neutral: string;     // |gap| <= 0.5
    fieldAhead: string;  // gap > +0.5
    userAhead: string;   // gap < -0.5
  };
}
```

### Second person, always

Content addresses the reader as "you." It never says "users in this stage" or "people who are experiencing." The reader is the person in the stage, not someone studying them.

---

## 2. Stage cores

Six blocks. Invariant — these never vary by domain, threat, or position. Target ~400 words.

### `stage_core.loss`

> Something you relied on is ending, and it is reasonable to be afraid of that. The fear is not a weakness. It is a signal that what you are losing actually mattered.
>
> You are in **Loss**, the first response to recognizing that significant change is underway. What this feels like from the inside is often not grief at all — it feels like clarity. The conviction that this is overblown, that it does not apply to your work, that the people excited about it do not understand what your work actually requires. Those thoughts are doing a job. They are holding the full weight of the change at a distance while you absorb that it is real.
>
> Most people pass through here without naming it. The tell is not what you believe about the technology; it is where your attention goes. In Loss, attention goes to what is being taken, and almost none goes to what might be built. That asymmetry is the stage.
>
> <!--@why-->
> Your brain is protecting you. Denial is not a failure of reasoning — it is a throttle on how fast a threat to your professional identity is allowed to arrive. Someone whose competence took fifteen years to build cannot absorb a credible challenge to it in an afternoon, and should not be expected to.
>
> What makes this stage genuinely hard is that the losses are often real. Skills that commanded a premium may not. Workflows you refined may not survive. Hierarchies you earned a place in are being rearranged. You are not wrong about any of that, and being told to "embrace change" by people who have lost less is not help.
>
> <!--@forward-->
> There is nothing to do here yet, and that is not a failure. Loss is not a problem to solve; it is a thing to finish. The move out of this stage is not optimism and it is not adoption — it is naming the specific thing that is ending, in enough detail to mourn it properly.
>
> So: what exactly is ending? Not "my field." Something smaller and more precise. A kind of work you were good at. A reason people called you. A thing you could do that others could not.
>
> You do not have to decide what to do about it. You only have to be able to say what it is. People who can name the loss move on from it. People who cannot tend to spend years arguing with the weather.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |

---

### `stage_core.doubt`

> You have stopped being able to dismiss this, and the feeling that replaced dismissal is not curiosity. It is resentment.
>
> You are in **Doubt**. The change is undeniable now, so the argument has moved. It is no longer "this will not happen" but "this will not work" — and you have evidence. You have seen the confident demo that fell apart under real conditions, the colleague whose output got faster and worse, the institutional enthusiasm that clearly has not thought about your constraints. You are keeping score, and the score is not unfair.
>
> The discipline this stage asks for is distinguishing two things that feel identical from the inside: the limitation that is real and permanent, and the limitation that is real and temporary. Both are true observations. Only one of them is a reason to wait.
>
> <!--@why-->
> What you actually lost is control of the narrative. In Loss the threat was to your skills; here it is to your standing as someone whose judgment about your own field is trusted. You are being told what your work requires by people who do not do it, and that is genuinely insulting.
>
> So the mode of communication shifts to speculation, and the energy goes into proving the old way is better. This is not stupidity — it is the available move when your expertise is being overridden. The cost is that it is a defensive crouch, and you cannot learn anything from inside one.
>
> <!--@forward-->
> You do not need more enthusiasm aimed at you. You need two things, and neither is a pitch.
>
> The first is a specific, falsifiable version of your objection. Not "the quality is not there" but "it cannot do *this particular task* to *this standard*." A vague objection cannot be tested, which means it can never be resolved, which means it will hold you here indefinitely. A specific one either survives contact with evidence — in which case you were right and you now know exactly how far — or it does not, and you have learned something real.
>
> The second is someone who does your actual work and whose judgment you already respected before this came up. Not an evangelist. Someone with standing, who has tried it, and who will tell you what did not work. Their failures will be more informative than anyone's success stories.
>
> Being skeptical is not the problem. Being skeptical in a way that cannot be settled is.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |

---

### `stage_core.discomfort`

> You know something has to change. You do not know what to do. The distance between those two facts is where you are living, and it is exhausting.
>
> You are in **Discomfort** — the stage this framework calls the Danger Zone, and the only one that gets that name. You have come further than you are giving yourself credit for. You are not in denial and you are not arguing anymore. You have conceded the point. And the reward for conceding was being handed a landscape with no map: too many tools, too much contradictory advice, no way to tell which of it applies to you, and a steady background hum that everyone else has figured out something you have not.
>
> The characteristic pattern here is urgency without direction. You read about it. You attend the session. You bookmark the thread. You do not try anything. From the outside this looks like procrastination. From the inside it is the entirely rational behavior of someone who cannot tell which action is the right one and has no safe way to be wrong.
>
> <!--@why-->
> Your brain is trying to organize a category it does not have yet, and the material is arriving faster than it can be sorted. That is what the overwhelm is. It is a filing problem, not a capability problem.
>
> This stage is named the Danger Zone because it is a fork, not a waiting room. The two exits are forward into experimentation and backward into certainty, and backward is easier — resentment is more comfortable than confusion, because at least it has a position in it. Most people take the backward exit several times before they take the forward one. That is the normal shape of this, not evidence of failure.
>
> One thing worth naming: the gap between "I should understand this by now" and "I do not" produces shame, and shame is specifically what prevents the small public experiment that would resolve it. The feeling that you are behind is the thing keeping you behind.
>
> <!--@forward-->
> You do not need more information. You already have more than you can use — that is the actual problem. What breaks this stage is one small thing that you finish.
>
> Not a strategy. Not a reading list. Not a plan for how to approach it properly. One task, small enough to complete in under twenty minutes, low-stakes enough that doing it badly costs you nothing, and concrete enough that you will know whether it worked.
>
> The purpose is not to become competent. It is to convert the question from "what should I do about all this" into "I tried one thing and here is what I learned," which is a question you know how to answer. That is the whole move.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |

---

### `stage_core.discovery`

> Something worked. Not everything, and maybe not well — but you tried a thing and it did something useful, and the question in your head has changed shape.
>
> You are in **Discovery**. The shift that defines this stage is small and enormous: you have stopped asking whether and started asking how. Your questions have gotten specific. You are no longer trying to form a position on a technology; you are trying to get a particular job done, and you are curious which approach is better.
>
> The texture of this stage is excitement mixed with unsteadiness, and the unsteadiness is appropriate. You are operating with real but patchy competence. You can get good results and you cannot yet reliably predict when you will, which means every success feels slightly like luck. It partly is. That resolves with repetition, not with study.
>
> <!--@why-->
> You let go of the old way, and that is the actual precondition for being here. Not optimism — release. As long as the previous arrangement was still the standard you measured everything against, every new approach read as a worse version of something good. Once it stopped being the standard, the same approaches became options to evaluate on their own terms.
>
> This is also the first stage where your failures are useful to you. In Doubt, a failure was evidence for the prosecution. Here it is data: that did not work, so the next attempt will be shaped differently. The same event has become information instead of ammunition.
>
> <!--@forward-->
> Two things make this stage compound, and one thing stalls it.
>
> It compounds when you write down what happened. Not formally — just enough that the pattern becomes visible across attempts. The difference between someone who stays here for months and someone who moves through is almost entirely whether they are accumulating transferable knowledge or starting fresh each time.
>
> It compounds when you find other people doing the same thing at the same level. Not experts — peers. You need people with whom you can compare notes on something that half-worked, which is a conversation you cannot have with someone who has it all figured out and cannot have with someone who has not started.
>
> It stalls when you try to systematize too early. Building a whole workflow on three weeks of experience produces something you will rebuild. Stay in the trying phase a while longer than feels efficient.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |

---

### `stage_core.understanding`

> You have stopped reacting to this and started working inside it. The tools are not a subject anymore; they are part of how you do the job.
>
> You are in **Understanding**. What distinguishes this stage from Discovery is predictability. You are no longer surprised by your own results. You know roughly which tasks will go well, which will need heavy correction, and which are not worth attempting — and you know that from experience rather than from anyone's claims. That calibration is the asset you built, and it is the thing that cannot be transferred by reading.
>
> The feeling is confidence, which is a quieter thing than the excitement of Discovery. The novelty is gone. In its place is competence, which is less fun and considerably more useful.
>
> <!--@why-->
> Competence came from volume. You did the thing enough times that the pattern became legible — not because you studied the pattern but because you accumulated enough cases to see it. This is why people who stayed in the reading phase never arrive here. The knowledge is not available in that form.
>
> It is worth being clear about what you have: not mastery of a technology, which is not a stable object and would decay anyway, but mastery of a *working relationship* with it. You know what to delegate and what to keep. That judgment survives the next version, and the one after that.
>
> <!--@forward-->
> The risk at this stage is not regression. It is isolation — becoming quietly productive in your own practice, with nothing moving outward.
>
> There are two directions worth taking. One is depth: you have a working relationship with these tools, and the obvious next question is where it is still inefficient. The parts you have been doing by hand because that is how you learned it are usually the richest ground.
>
> The other is other people, and it is the more valuable one. You are now one of the few people with something genuinely rare: you remember being stuck, and you know specifically what unstuck you. Everyone still in Discomfort is surrounded by advice from people who have forgotten what it felt like not to know. You have not forgotten yet.
>
> That is not an obligation. But it is the step from doing this well yourself to being someone others can move through this behind, and it is where this framework thinks the real leverage is.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |

---

### `stage_core.integration`

> This is how you work now. You stopped noticing it, which is the actual marker of this stage.
>
> You are in **Integration**. The tools have receded into the background of your practice the way a familiar instrument does — not absent, just no longer the thing you are thinking about. You are thinking about the work. When you reach for something, you reach without deliberating, and when something is not worth reaching for you know that too, without checking.
>
> What also returned, and this is the part people do not anticipate, is flexibility. The thing that made earlier stages exhausting was the sense that each change demanded a verdict. That has gone. The next capable thing to arrive will be something you evaluate, not something you survive. You have been through the cycle and you know its shape, which permanently changes how the next one feels.
>
> <!--@why-->
> The new arrangement has been fully incorporated, so there is nothing left to defend. Identity has reorganized around what you do now rather than around what you used to be able to do that others could not — and because it is no longer load-bearing, it is no longer fragile.
>
> This is also why generosity shows up here reliably enough that the framework treats it as the diagnostic signature. When your standing does not depend on being the one who knows, there is no cost to helping someone else know. Scarcity thinking about expertise is a symptom of earlier stages.
>
> <!--@forward-->
> There is no next stage, so the question changes from what to do to what to do with it.
>
> This framework's claim is that people who reach this point are the limiting factor in everyone else's progress, and that this is not sentimental. The hardest transition in the whole cycle is Discomfort to Discovery, and what reliably unlocks it is not information — it is a credible peer who has been there. Not a trainer, not a vendor, not an administrator. Someone whose work the stuck person respects, who went through it, and who will say out loud what did not work. There is no substitute for that, and it does not scale from the top.
>
> You will also be the useful dissenting voice, which matters more than it sounds. You can say "that one is not worth it" and be believed, because you are not saying it from fear. Early-stage skepticism gets discounted. Yours does not.
>
> The uncomfortable part of this stage is that the work left is mostly other people's.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |

---

## 3. Domain lenses — Discomfort

Five blocks. Phase 3. Target ~120 words plus a `firstExperiment`.

The `firstExperiment` is the highest-stakes field in the content library. At this stage it *is* the intervention. Every one must be completable in under twenty minutes, impossible to get visibly wrong, and specific enough that the person knows whether it worked.

### `domain_lens.discomfort.teaching`

> In teaching, this stage usually arrives disguised as a policy question. You need a position on AI for your syllabus, your department wants guidance, and underneath the procedural question is a harder one you cannot answer yet: if the essay no longer tells you whether they learned it, what does?
>
> That is a real break, not a discipline problem. The relationship between student output and student learning was a proxy, and it was a good one for a long time, and it has stopped being reliable. Most of the exhaustion in this stage comes from being asked to write rules for a situation whose shape nobody has established — including the people asking you for the rules.
>
> One thing worth knowing: of the five domains this tool recognizes, teaching is the one where **your whole field is standing where you are.** The paralysis is structural. It is not that you are slow.

**First experiment**
> Take one concept from a course you already teach — something students reliably get wrong. Ask an AI tool to explain it three different ways: to a first-year, by analogy, and with a worked example. Read the three. You are not evaluating the tool and you are not going to use any of them. You are looking for whether any of them names the misconception more cleanly than you currently do in class. That is it. Twenty minutes, nothing at stake, and you will learn something about your own explanation either way.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |
| **Domain verified** | pending |

---

### `domain_lens.discomfort.craft`

> In craft work, the Discomfort stage has a particular sting, because the overwhelm is not really about which tool to use. It is about not knowing which part of your practice is still the valuable part.
>
> You have probably conceded that execution can be produced cheaply now. What you have not resolved is what that leaves. If the finished surface is no longer the evidence of skill, then taste, judgment, and intent are supposed to be the moat — but nobody commissions "taste" directly, and it is not clear how you demonstrate it. So you stall, which looks like indecision about software and is actually an unanswered question about what you are selling.
>
> The thing that unsticks this is almost never a decision about tools. It is one piece of evidence about where your own judgment shows up.

**First experiment**
> Pick a task inside your own process that you have always disliked and that nobody is paying you for — formatting, variant generation, a rough first pass you only make to react against, asset resizing. Hand that one task over. Keep every decision that involves taste.
>
> You are testing one narrow thing: whether the part you dislike is separable from the part that is yours. If it is, you just found where your judgment actually lives. If it is not — if the tedium turns out to be where the thinking happened — that is more valuable to know than anything a tool review will tell you.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |
| **Domain verified** | pending |

---

### `domain_lens.discomfort.analysis`

> In advisory work, Discomfort tends to show up as a verification problem rather than a capability problem. You can already see that synthesis is fast now. What you cannot see is how to stand behind it.
>
> Your value was built on having read the corpus — the precedent, the filings, the literature — and on being accountable for a judgment grounded in it. The reading is now cheap and the accountability is not, which leaves you holding the hard half. Worse, the time saved creates exactly the pressure to check less, at precisely the moment checking matters more. So the rational response is to not start, which is where you are.
>
> That caution is well-founded. It is also a reason to begin somewhere you can verify completely, not a reason to wait.

**First experiment**
> Take a document you have already read closely and already formed a view on — something where you know the answer cold. Ask for a summary of it, or for the three strongest counterarguments to your position.
>
> Because you already know the material, you can grade the output precisely: what it caught, what it missed, where it was confidently wrong. You are not producing work product and you are not relying on anything. You are calibrating — finding out exactly where the failure modes are on terrain you can see completely. That calibration is the thing you cannot get from someone else's account, and it is what makes later use defensible rather than hopeful.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |
| **Domain verified** | pending |

---

### `domain_lens.discomfort.building`

> In engineering, this stage is strange, because the overwhelm is rarely about whether the tools work. You have probably already used them. The discomfort is about what it does to the part of the job you liked.
>
> The fluency you built — knowing the API, knowing why the system behaves that way at three in the morning, knowing which abstraction will hurt in a year — is the most delegable part of your skill set and the part that felt most like competence. That is a real loss, and it is one your field is largely not discussing, because the field is busy being productive. Your domain is further along than any other this tool recognizes, which means you may be the only person in the room still sitting with this.
>
> The question here is not adoption. It is where your judgment goes once implementation stops being where it lived.

**First experiment**
> Pick a small, well-understood change you could make yourself in an hour, in code you own. Have it generated, then review it the way you would review a competent stranger's pull request — properly, with comments.
>
> The output is not the point. Your review is. What you are looking for is which objections are real engineering judgment and which are "that is not how I would have typed it." That separation is the whole skill now, and the only way to find where yours sits is to exercise it on something you can fully evaluate.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |
| **Domain verified** | pending |

---

### `domain_lens.discomfort.coordination`

> In coordination and care work, this stage comes with an extra difficulty: you have probably been told you have nothing to worry about.
>
> That reassurance is why this is hard to place. You watch adjacent roles get restructured, you hear that your work is the safe kind because it is relational, and you have no legitimate-sounding grievance — so the unease has nowhere to go. Meanwhile the parts of your job that *are* being touched, the documentation and the correspondence and the scheduling, are the parts you would gladly hand over. Relief and unease arrive together, which makes the whole thing hard to name.
>
> There is also a specific professional risk here worth saying out loud: in work where the deliverable is attention, efficiency gains tend to get absorbed as higher caseload rather than more time per person.

**First experiment**
> Take one piece of writing you produce regularly and resent — a status summary, a recurring update, meeting notes, a standard reply you have typed four hundred times. Have a first draft generated, then fix it the way you always would.
>
> Time it, and notice two separate things: whether the draft saved you anything, and whether the result still sounds like you. Both answers matter. If it saved time and sounds wrong, the task is not a candidate. If it saved time and sounds fine, you have found an hour — and the question of who that hour belongs to is one worth raising deliberately, before it gets answered for you.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |
| **Domain verified** | pending |

---

## 4. Threat responses

Seven threats, eight blocks — `skills_obsolescence` is the one threat whose content genuinely differs by stage, so it has two stage-scoped variants. Target ~100 words. Rendered under "About what you said."

### `threat_response.skills_obsolescence@early`
`stageScope: [loss, doubt]`

> The thing you built was real. Years went into it, it was hard, and it distinguished you — and it is reasonable to be angry that the distinction may not hold.
>
> Be precise about what is actually at risk, though, because "my skills" is too coarse to reason about. Some of what you learned was execution, and execution is getting cheap. Some of it was judgment you can only have by having done the execution a thousand times, and that is not transferable by prompt. Those two things feel like one skill from the inside. They are not, and the difference is most of what happens next.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |

### `threat_response.skills_obsolescence@late`
`stageScope: [understanding, integration]`

> Worth marking something you may have moved past without noticing: the skills you thought you were losing are the reason you are good at this now.
>
> Your judgment about what to delegate and what to keep is not available to someone who skipped the years you put in. They can produce the same surface. They cannot tell when it is wrong. What you lost was the exclusivity of execution. What you kept turned out to be the part that was hard to build.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |

### `threat_response.identity_authority`
*(no stage scope — all stages)*

> Being the person who knows is a real position, and it is being eroded in a way that feels less like competition than like dissolution. Not someone knowing more than you — the category itself getting cheaper.
>
> The part that is genuinely gone is **recall as a credential**: having read it, having memorized it, being the one in the room who can produce the fact. The part that is not going is being the person who can tell when an answer is wrong. That is a harder thing to demonstrate and it does not announce itself the way expertise used to. It is also considerably more difficult to replace.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |

### `threat_response.verification`
*(no stage scope)*

> You are being asked to stand behind work whose origin you cannot establish, and that is not a tooling complaint — it is a structural problem that your institution has probably not solved either.
>
> One distinction helps more than anything else here: separate *detecting* from *designing*. Detection is a losing position; it is adversarial, unreliable, and it makes you a police officer in a job you did not take for that. Design is the question of what evidence you would accept instead — what makes the thinking visible rather than the output. It is a harder question and it is the one that has an answer.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |

### `threat_response.authenticity_quality`
*(no stage scope)*

> The complaint that output is technically competent and completely hollow is not nostalgia, and it is not a failure to appreciate the new thing. It is an accurate observation about a great deal of what is now being produced.
>
> Here is the part that is easy to miss: noticing the hollowness is a capability, and it is not evenly distributed. The flood of competent-and-empty work makes the people who can tell the difference more valuable, not less — but only if that discernment is exercised on something, rather than used as a reason to stay out.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |

### `threat_response.economic`
*(no stage scope)*

> This is the one concern this framework cannot reassure you about, and it would be insulting to try. Whether your role exists in five years is not knowable, and anyone confident in either direction is selling something.
>
> What is worth separating is the threat to the *role* from the threat to the *capability*. Roles are organizational artifacts and they get restructured for many reasons. Capabilities are portable. The strongest available position is not betting correctly on which roles survive — it is being someone whose judgment is useful across several possible arrangements of the work.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |

### `threat_response.ethical`
*(no stage scope — see [content-architecture.md](content-architecture.md) §4.4: renders above the domain lens, and suppresses the first experiment)*

> Your objection is not a stage, and this tool is not going to treat it as one.
>
> The concerns about training data provenance, consent, uncompensated labor, and environmental cost are substantively unresolved. People who have thought hardest about them have not reached agreement, and declining to participate in something you consider wrong is a coherent position, not a symptom of anything.
>
> One distinction is worth drawing, and only you can draw it: whether yours is *"not under any circumstances"* or *"not until certain conditions are met."* Both are legitimate. They lead different places, and conflating them is how a principled position gets quietly converted into indefinite waiting. The first is a commitment. The second has terms, and it is worth knowing what yours are — so you can tell whether they are ever met.
>
> Nothing in the rest of this is addressed to you as someone who needs moving.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |
| **Note** | Highest-sensitivity block in the library. Any edit requires a second reviewer. |

### `threat_response.control_opacity`
*(no stage scope)*

> You are accountable for outcomes produced by a process you cannot inspect. That is a legitimate professional objection and in several fields it is a regulatory one.
>
> It does not resolve into trust, and it should not. What it resolves into is scope: the tasks where you can fully verify the output are categorically different from the tasks where you are taking the result on faith. Those are two different risk classes and they deserve different rules. People who do this well are not more trusting than you. They are stricter about which pile a task belongs in.

| | |
|---|---|
| **Author** | Mark Gill |
| **Last reviewed** | 2026-10-31 |

---

## 5. Pace notes

Five blocks, each with three framings keyed to the gap sign. Target ~60 words per framing. Rendered as "Your pace."

### `pace_note.innovator`

| Framing | Text |
|---|---|
| `neutral` | You move toward new things early, and you are used to being out in front. That is a disposition, not a virtue — it has cost you before on things that did not pan out. It happens to be serving you well here. |
| `fieldAhead` | Unusual position for you: your field has moved further than you have. Worth asking whether this is genuine caution about this particular technology, or whether something else — bandwidth, a bad early experience — is doing the deciding. |
| `userAhead` | You are well ahead of your field, which is familiar territory and still tiring. The risk is not impatience; it is reading institutional slowness as stupidity. It usually is not. Find peers outside your organization — you will not get a useful conversation inside it for a while. |

### `pace_note.early_adopter`

| Framing | Text |
|---|---|
| `neutral` | You adopt things once they look real but before they are settled, and you are typically among the first in your circle. You are moving roughly with the people who move early. |
| `fieldAhead` | You are usually ahead and currently are not, which is probably why this feels worse than the actual gap warrants. The discomfort may be more about the unfamiliar position than about the distance. |
| `userAhead` | You are ahead of your field, which is where you usually are, with the usual consequence: people will come to you before they are ready to act. Deciding in advance how much of that you will carry is worth doing now rather than at the point of resentment. |

### `pace_note.early_majority`

| Framing | Text |
|---|---|
| `neutral` | You wait for evidence before committing, and that has protected you from a lot of wasted effort. You are moving about when your field is moving. |
| `fieldAhead` | Your instinct is to wait for proof, and the honest difficulty is that this is moving faster than proof accumulates. The pressure you feel is the gap between your evidence threshold and the available evidence — a structural problem, not a personal failing. The adjustment is smaller than it sounds: lower the stakes of the test rather than the standard of proof. |
| `userAhead` | You are ahead of your field despite a pragmatic disposition, which usually means you found a concrete reason rather than catching enthusiasm. That reason is worth articulating — it is exactly the evidence the people behind you are waiting for, and you are more credible to them than any enthusiast. |

### `pace_note.late_majority`

| Framing | Text |
|---|---|
| `neutral` | You adopt when it becomes necessary rather than when it becomes possible, and that is a reasonable allocation of finite attention. |
| `fieldAhead` | Your field has moved substantially further than you have, and that distance is the main source of the pressure you are feeling. Worth being clear: the gap is largely structural. People who move later face a harder adjustment through no fault of their own, because they arrive when the expectations have already reset. What makes it manageable is not catching up — it is one entry point narrow enough to actually start. |
| `userAhead` | You are ahead of your field, which given your usual pace means your field has barely engaged at all. Expect to be treated as the enthusiast, which will be an odd fit. |

### `pace_note.laggard`

| Framing | Text |
|---|---|
| `neutral` | You adopt new things rarely and late, which in an unstable field is often the correct call. A great deal of what demanded urgent attention over the years did not matter. |
| `fieldAhead` | Your field has moved a long way past where you are, and the distance is large enough that catching up is not a sensible frame. This framework's position is that your caution has been strategically sound more often than not — and that this instance appears to be one where the ground genuinely shifted. Those are both true. The only useful question is whether there is one small thing worth doing, not whether you were wrong to wait. |
| `userAhead` | You are ahead of a field that has barely started, which is a rare combination and a lonely one. You will get very little useful conversation locally. |

---

## 6. OPEN: remaining 25 domain lenses

Phases 4–5 from [content-architecture.md](content-architecture.md) §6 — the domain lenses for Loss, Doubt, Discovery, Understanding, and Integration.

**These are deliberately not drafted here.** The Discomfort set in §3 makes specific claims about what it is like to work in five professions, and those claims are load-bearing — a first experiment that lands wrong for a practitioner is worse than no first experiment at all. All five are marked `domainVerified: pending` for exactly that reason. Generating twenty-five more in the same voice would produce plausible prose with no one standing behind it, and it would read as plausible, which is the problem.

The right process is the project owner drafting these, or a practitioner in each domain reviewing them. The template below is what each one needs.

### Template

```
### `domain_lens.<stage>.<domain>`

> [~40 words] How this stage shows up specifically in this kind of work.
>   Name the mechanism, not the feeling. The stage core already covered
>   the feeling.
>
> [~50 words] The domain-specific complication — what makes this stage
>   harder or different here than the generic account suggests. This is
>   where the block earns its place.
>
> [~30 words] One true thing about this domain the reader may not know,
>   ideally from the field-maturity data (§5.3 of the framework). Where
>   the reader's field sits relative to them is often the most useful
>   sentence on the page.

**First experiment**
> [~80 words] Twenty minutes. Impossible to get visibly wrong. Uses
>   material the reader already has. States what they are looking for,
>   and names what both outcomes would teach them.
>
>   For stages 1-2 this is NOT a tool experiment — it is a reflective
>   one (see below).
```

### Constraints by stage

| Stage | What `firstExperiment` must be |
|---|---|
| Loss | **Not a tool task.** Name the specific thing that is ending. Offering a tool to someone in Loss is the mistake the framework warns about explicitly ([grief-framework-context.md](grief-framework-context.md) §10). |
| Doubt | **Not a tool task.** Make the objection falsifiable, or find a credible peer. Persuasion is the wrong move here. |
| Discomfort | One small concrete task. Drafted in §3. |
| Discovery | A second experiment that builds on a first, or a record-keeping habit. |
| Understanding | A depth move (find the remaining inefficiency) or an outward move (help one person). |
| Integration | Outward only — specifically, mentoring someone in Discomfort. |

### Review checklist

Before marking any lens `domainVerified: true`:

- [ ] A practitioner in this domain has read it and recognized their situation
- [ ] The first experiment is genuinely completable in under twenty minutes
- [ ] The first experiment cannot embarrass the reader if it goes badly
- [ ] It uses material the reader already has — no setup, no new accounts, no procurement
- [ ] It names what the reader is looking for, not just what to do
- [ ] Both possible outcomes teach something; neither is a failure
- [ ] No claim about the profession that a practitioner would dispute
- [ ] Stage-appropriate per the table above
- [ ] Passes the tone scan in [content-specification.md](content-specification.md) §2
