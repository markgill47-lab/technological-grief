import type { StageCoreBlock } from './schema';
import type { Stage } from '../domain/types';

const meta = { author: 'Mark Gill', lastReviewed: '2026-11-02' };

/**
 * The six stage cores. Invariant - these never vary by domain, threat, or
 * position. Second person throughout, no exceptions. See
 * specs/content-specification.md section 2.5.
 *
 * Voice: ClaudeWritingGuides/marks-voice-guide.md, Teaching Voice. No
 * em-dashes anywhere (Hard Rule 1): every one of them was hiding a period, a
 * colon, or a parenthesis, and the relationship is now stated. Semicolons
 * only where the trailing clause leans on its sentence (Rule 5.2). Inline
 * lists stop at three (Hard Rule 6), and where a third item turns against the
 * first two, that turn is deliberate.
 */
export const STAGE_CORES: Record<Stage, StageCoreBlock> = {
  loss: {
    id: 'stage_core.loss',
    kind: 'stage_core',
    stage: 'loss',
    meta,
    body: `Something you relied on is ending, and it is reasonable to be afraid of that. The fear is not a weakness. It is a signal that what you are losing actually mattered.

You are in **Loss**, the first response to recognizing that significant change is underway. What this feels like from the inside is often not grief at all. It feels like clarity: the conviction that this is overblown, that it does not apply to your work, that the people excited about it have never done your job. Those thoughts are doing a job of their own. They hold the full weight of the change at a distance while you absorb that it is real.

Most people pass through here without naming it. The tell is not what you believe about the technology. It is where your attention goes. In Loss, attention goes to what is being taken, and almost none goes to what might be built. That asymmetry is the stage.

<!--@why-->
Your brain is protecting you. Denial is not a failure of reasoning. It is a throttle on how fast a threat to your professional identity is allowed to arrive, and someone whose competence took fifteen years to build cannot absorb a credible challenge to it in an afternoon. Nobody should expect them to.

What makes this stage genuinely hard is that the losses are often real. Skills that commanded a premium may not. Workflows you refined may not survive. Hierarchies you earned a place in are being rearranged. You are not wrong about any of that, and being told to "embrace change" by people who have lost less is not help.

<!--@forward-->
There is nothing to do here yet, and that is not a failure. Loss is not a problem to solve. It is a thing to finish. The move out of this stage is not optimism and it is not adoption: it is naming the specific thing that is ending, in enough detail to mourn it properly.

So what is ending, exactly? Not "my field," which is too big to grieve and too vague to check. What kind of work were you good at? What was the reason people called you instead of someone else?

You do not have to decide what to do about it. You only have to be able to say what it is. People who can name the loss move on from it. People who cannot tend to spend years arguing with the weather.`,
  },

  doubt: {
    id: 'stage_core.doubt',
    kind: 'stage_core',
    stage: 'doubt',
    meta,
    body: `You have stopped being able to dismiss this, and the feeling that replaced dismissal is not curiosity. It is resentment.

You are in **Doubt**. The change is undeniable now, so the argument has moved. It is no longer "this will not happen" but "this will not work," and you have evidence. The confident demo that fell apart under real conditions. The colleague whose output got faster and worse. The institutional enthusiasm that clearly has not thought about your constraints. You are keeping score, and the score is not unfair.

The discipline this stage asks for is separating two things that feel identical from the inside: the limitation that is real and permanent, and the limitation that is real and temporary. Both are true observations. Only one of them is a reason to wait.

<!--@why-->
What you actually lost is control of the narrative. In Loss the threat was to your skills. Here it is to your standing as someone whose judgment about your own field is trusted. You are being told what your work requires by people who do not do it, and that is genuinely insulting.

So the mode shifts to speculation, and the energy goes into proving the old way is better. This is not stupidity. It is the available move when your expertise is being overridden. The cost is that it is a defensive crouch, and nobody learns anything from inside one.

<!--@forward-->
You do not need more enthusiasm aimed at you. You need two things, and neither one is a pitch.

The first is a specific, falsifiable version of your objection. Not "the quality is not there" but "it cannot do *this particular task* to *this standard*." A vague objection cannot be tested, which means it can never be resolved, which means it will hold you here indefinitely. A specific one either survives contact with evidence (in which case you were right, and you now know exactly how far) or it does not, and you have learned something real either way.

The second is someone who does your actual work and whose judgment you respected before any of this came up. Not an evangelist. Someone with standing, who has tried it, and who will tell you what did not work. Their failures will teach you more than anyone's success stories. Considerably more.

Being skeptical is not the problem. Being skeptical in a way that cannot be settled is.`,
  },

  discomfort: {
    id: 'stage_core.discomfort',
    kind: 'stage_core',
    stage: 'discomfort',
    meta,
    body: `You know something has to change. You do not know what to do. The distance between those two facts is where you are living, and it is exhausting.

You are in **Discomfort**, the one stage in this cycle that gets a nickname: the Danger Zone. You have come further than you are giving yourself credit for. You are not in denial and you are not arguing anymore. You conceded the point. The reward for conceding was a landscape with no map: too many tools, too much contradictory advice, and no way to tell which of it applies to you. Underneath all of it runs a steady hum that everyone else has worked out something you have not.

The pattern here is urgency without direction. You read about it. You attend the session. You bookmark the thread. You do not try anything. From the outside that looks like procrastination. From the inside it is the entirely rational behaviour of someone who cannot tell which action is the right one and has no safe way to be wrong.

<!--@why-->
Your brain is trying to organize a category it does not have yet, and the material is arriving faster than it can be sorted. That is what the overwhelm is. It is a filing problem, not a capability problem.

The Danger Zone name is about shape, not drama: this stage is a fork, not a waiting room. The two exits are forward into experimentation and backward into certainty, and backward is easier: resentment is more comfortable than confusion, because at least it has a position in it. Most people take the backward exit several times before they take the forward one. That is the normal shape of this, not evidence of failure.

One thing worth naming. The gap between "I should understand this by now" and "I do not" produces shame, and shame is specifically what prevents the small public experiment that would resolve it. The feeling that you are behind is the thing keeping you behind.

<!--@forward-->
You do not need more information. You already have more than you can use, and that is the actual problem. What breaks this stage is one small thing that you finish.

Not a strategy. Not a reading list. Not a plan for approaching it properly. One task, small enough to complete in under twenty minutes, low-stakes enough that doing it badly costs you nothing, and concrete enough that you will know whether it worked.

The purpose is not to become competent. It is to turn "what should I do about all this" into "I tried one thing, and here is what I learned," which is a question you already know how to answer. That is the whole move.`,
  },

  discovery: {
    id: 'stage_core.discovery',
    kind: 'stage_core',
    stage: 'discovery',
    meta,
    body: `Something worked. Not everything, and maybe not well. But you tried a thing and it did something useful, and the question in your head has changed shape.

You are in **Discovery**. The shift that defines this stage is small and enormous: you have stopped asking whether and started asking how. Your questions have gotten specific. You are no longer trying to form a position on a technology. You are trying to get a particular job done, and you are curious which approach is better.

The texture of this stage is excitement mixed with unsteadiness, and the unsteadiness is appropriate. You are operating with real but patchy competence. You can get good results and you cannot yet predict when you will, which means every success feels slightly like luck. It partly is. That resolves with repetition, not with study.

<!--@why-->
You let go of the old way, and that is the precondition for being here. Not optimism. Release. As long as the previous arrangement was still the standard you measured everything against, every new approach read as a worse version of something good. Once it stopped being the standard, those same approaches became options to judge on their own terms.

This is also the first stage where your failures are useful to you. In Doubt, a failure was evidence for the prosecution. Here it is data: that did not work, so the next attempt will be shaped differently. The same event has become information instead of ammunition.

<!--@forward-->
Two things make this stage compound, and one thing stalls it.

It compounds when you write down what happened. Not formally. Just enough that the pattern becomes visible across attempts. The difference between someone who stays here for months and someone who moves through is almost entirely whether they are accumulating transferable knowledge or starting fresh every time.

It compounds when you find other people doing the same thing at the same level. Not experts. Peers. You need someone you can compare notes with about a thing that half-worked, which is a conversation you cannot have with someone who has it all figured out, and cannot have with someone who has not started.

It stalls when you systematize too early. A whole workflow built on three weeks of experience is a workflow you will rebuild. Stay in the trying phase longer than feels efficient.`,
  },

  understanding: {
    id: 'stage_core.understanding',
    kind: 'stage_core',
    stage: 'understanding',
    meta,
    body: `You have stopped reacting to this and started working inside it. The tools are not a subject anymore. They are part of how you do the job.

You are in **Understanding**. What separates this stage from Discovery is predictability. You are no longer surprised by your own results. You know roughly which tasks will go well, which will need heavy correction, and which are not worth attempting. You know it from experience rather than from anyone's claims. That calibration is the asset you built, and it is the one thing here that cannot be transferred by reading.

The feeling is confidence, which is a quieter thing than the excitement of Discovery. The novelty is gone. In its place is competence, which is less fun and considerably more useful.

<!--@why-->
Competence came from volume. You did the thing enough times that the pattern became legible, not because you studied the pattern but because you accumulated enough cases to see it. This is why people who stayed in the reading phase never arrive here. The knowledge is not available in that form.

It is worth being clear about what you have. Not mastery of a technology, which is not a stable object and would decay anyway, but mastery of a *working relationship* with one. You know what to delegate and what to keep. That judgment survives the next version, and the one after that.

<!--@forward-->
The risk at this stage is not regression. It is isolation: becoming quietly productive inside your own practice with nothing moving outward.

There are two directions worth taking. One is depth. You have a working relationship with these tools, so the obvious next question is where it is still inefficient, and the parts you have been doing by hand because that is how you learned them are usually the richest ground.

The other direction is other people, and I think it is the more valuable one. You have something genuinely rare: you remember being stuck, and you know specifically what unstuck you. Everyone still in Discomfort is surrounded by advice from people who have forgotten what it felt like not to know. You have not forgotten yet.

That is not an obligation. It is the step from doing this well yourself to being someone others can move through this behind, and it is where the leverage in the whole cycle actually sits.`,
  },

  integration: {
    id: 'stage_core.integration',
    kind: 'stage_core',
    stage: 'integration',
    meta,
    body: `This is how you work now. You stopped noticing it, which is the actual marker of this stage.

You are in **Integration**. The tools have receded into the background of your practice the way a familiar instrument does. Not absent, just no longer the thing you are thinking about. You are thinking about the work. When you reach for something you reach without deliberating, and when something is not worth reaching for you know that too, without checking.

What also returned, and this is the part nobody anticipates, is flexibility. The thing that made the earlier stages exhausting was the sense that every change demanded a verdict. That has gone. The next capable thing to arrive will be something you evaluate, not something you survive. You have been round the cycle and you know its shape, which permanently changes how the next one feels.

<!--@why-->
The new arrangement has been fully absorbed, so there is nothing left to defend. Identity reorganized around what you do now rather than around what you used to be able to do that others could not. Because it is no longer load-bearing, it is no longer fragile.

This is also why generosity shows up here reliably enough to treat as the signature of the stage. When your standing does not depend on being the one who knows, there is no cost to helping someone else know. Scarcity thinking about expertise belongs to the earlier stages.

<!--@forward-->
There is no next stage, so the question changes from what to do to what to do with it.

Here is my claim, and it is the uncomfortable one in this whole model: people who reach this point are the limiting factor in everyone else's progress. The hardest transition in the cycle is Discomfort to Discovery, and what reliably unlocks it is not information. It is a credible peer who has been there. Not a trainer, not a vendor, not an administrator. Someone whose work the stuck person respects, who went through it, and who will say out loud what did not work. There is no substitute for that, and it does not scale from the top.

You will also be the useful dissenting voice, which matters more than it sounds. You can say "that one is not worth it" and be believed, because you are not saying it out of fear. Early-stage skepticism gets discounted. Yours does not.

The uncomfortable part of this stage is that the work left is mostly other people's.`,
  },
};
