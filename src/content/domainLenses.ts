import type { DomainLensBlock } from './schema';

const meta = {
  author: 'Mark Gill',
  lastReviewed: '2026-10-31',
  /** Not yet signed off by a practitioner in the domain. */
  domainVerified: false,
};

/**
 * Domain lenses.
 *
 * Authoring phase 3 only: the complete five-domain set for DISCOMFORT.
 * Stage 3 is the Danger Zone, the highest-population stage, and the one
 * where a concrete first step is the actual intervention.
 *
 * The remaining 25 lenses (Loss, Doubt, Discovery, Understanding,
 * Integration) are deliberately not drafted. These five make specific
 * claims about what it is like to work in five professions, and a first
 * experiment that lands wrong for a practitioner is worse than none at all.
 * Template and review checklist: specs/content-blocks.md section 6.
 *
 * Assembly degrades cleanly: a stage with no lens for the user's domain
 * simply omits the section. See specs/content-architecture.md section 4.1.
 */
export const DOMAIN_LENSES: DomainLensBlock[] = [
  {
    id: 'domain_lens.discomfort.teaching',
    kind: 'domain_lens',
    stage: 'discomfort',
    domain: 'teaching',
    meta,
    summary: 'The essay has stopped telling you whether they learned it, and nobody can yet say what replaces it.',
    body: `In teaching, this stage usually arrives disguised as a policy question. You need a position on AI for your syllabus, your department wants guidance, and underneath the procedural question is a harder one you cannot answer yet: if the essay no longer tells you whether they learned it, what does?

That is a real break, not a discipline problem. The relationship between student output and student learning was a proxy, and it was a good one for a long time, and it has stopped being reliable. Most of the exhaustion in this stage comes from being asked to write rules for a situation whose shape nobody has established — including the people asking you for the rules.

One thing worth knowing: of the five domains this tool recognizes, teaching is the one where **your whole field is standing where you are.** The paralysis is structural. It is not that you are slow.`,
    firstExperiment: `Take one concept from a course you already teach — something students reliably get wrong. Ask an AI tool to explain it three different ways: to a first-year, by analogy, and with a worked example. Read the three. You are not evaluating the tool and you are not going to use any of them. You are looking for whether any of them names the misconception more cleanly than you currently do in class. That is it. Twenty minutes, nothing at stake, and you will learn something about your own explanation either way.`,
  },

  {
    id: 'domain_lens.discomfort.craft',
    kind: 'domain_lens',
    stage: 'discomfort',
    domain: 'craft',
    meta,
    summary: 'Execution got cheap, and it is not yet clear how you show that the judgment was yours.',
    body: `In craft work, the Discomfort stage has a particular sting, because the overwhelm is not really about which tool to use. It is about not knowing which part of your practice is still the valuable part.

You have probably conceded that execution can be produced cheaply now. What you have not resolved is what that leaves. If the finished surface is no longer the evidence of skill, then taste, judgment, and intent are supposed to be the moat — but nobody commissions "taste" directly, and it is not clear how you demonstrate it. So you stall, which looks like indecision about software and is actually an unanswered question about what you are selling.

The thing that unsticks this is almost never a decision about tools. It is one piece of evidence about where your own judgment shows up.`,
    firstExperiment: `Pick a task inside your own process that you have always disliked and that nobody is paying you for — formatting, variant generation, a rough first pass you only make to react against, asset resizing. Hand that one task over. Keep every decision that involves taste.

You are testing one narrow thing: whether the part you dislike is separable from the part that is yours. If it is, you just found where your judgment actually lives. If it is not — if the tedium turns out to be where the thinking happened — that is more valuable to know than anything a tool review will tell you.`,
  },

  {
    id: 'domain_lens.discomfort.analysis',
    kind: 'domain_lens',
    stage: 'discomfort',
    domain: 'analysis',
    meta,
    summary: 'The reading is cheap now and the accountability is not, which leaves you holding the hard half.',
    body: `In advisory work, Discomfort tends to show up as a verification problem rather than a capability problem. You can already see that synthesis is fast now. What you cannot see is how to stand behind it.

Your value was built on having read the corpus — the precedent, the filings, the literature — and on being accountable for a judgment grounded in it. The reading is now cheap and the accountability is not, which leaves you holding the hard half. Worse, the time saved creates exactly the pressure to check less, at precisely the moment checking matters more. So the rational response is to not start, which is where you are.

That caution is well-founded. It is also a reason to begin somewhere you can verify completely, not a reason to wait.`,
    firstExperiment: `Take a document you have already read closely and already formed a view on — something where you know the answer cold. Ask for a summary of it, or for the three strongest counterarguments to your position.

Because you already know the material, you can grade the output precisely: what it caught, what it missed, where it was confidently wrong. You are not producing work product and you are not relying on anything. You are calibrating — finding out exactly where the failure modes are on terrain you can see completely. That calibration is the thing you cannot get from someone else's account, and it is what makes later use defensible rather than hopeful.`,
  },

  {
    id: 'domain_lens.discomfort.building',
    kind: 'domain_lens',
    stage: 'discomfort',
    domain: 'building',
    meta,
    summary: 'The fluency that felt most like competence is the most delegable part of the job.',
    body: `In engineering, this stage is strange, because the overwhelm is rarely about whether the tools work. You have probably already used them. The discomfort is about what it does to the part of the job you liked.

The fluency you built — knowing the API, knowing why the system behaves that way at three in the morning, knowing which abstraction will hurt in a year — is the most delegable part of your skill set and the part that felt most like competence. That is a real loss, and it is one your field is largely not discussing, because the field is busy being productive. Your domain is further along than any other this tool recognizes, which means you may be the only person in the room still sitting with this.

The question here is not adoption. It is where your judgment goes once implementation stops being where it lived.`,
    firstExperiment: `Pick a small, well-understood change you could make yourself in an hour, in code you own. Have it generated, then review it the way you would review a competent stranger's pull request — properly, with comments.

The output is not the point. Your review is. What you are looking for is which objections are real engineering judgment and which are "that is not how I would have typed it." That separation is the whole skill now, and the only way to find where yours sits is to exercise it on something you can fully evaluate.`,
  },

  {
    id: 'domain_lens.discomfort.coordination',
    kind: 'domain_lens',
    stage: 'discomfort',
    domain: 'coordination',
    meta,
    summary: 'You have been told you are the safe one, which leaves the unease nowhere legitimate to go.',
    body: `In coordination and care work, this stage comes with an extra difficulty: you have probably been told you have nothing to worry about.

That reassurance is why this is hard to place. You watch adjacent roles get restructured, you hear that your work is the safe kind because it is relational, and you have no legitimate-sounding grievance — so the unease has nowhere to go. Meanwhile the parts of your job that *are* being touched, the documentation and the correspondence and the scheduling, are the parts you would gladly hand over. Relief and unease arrive together, which makes the whole thing hard to name.

There is also a specific professional risk here worth saying out loud: in work where the deliverable is attention, efficiency gains tend to get absorbed as higher caseload rather than more time per person.`,
    firstExperiment: `Take one piece of writing you produce regularly and resent — a status summary, a recurring update, meeting notes, a standard reply you have typed four hundred times. Have a first draft generated, then fix it the way you always would.

Time it, and notice two separate things: whether the draft saved you anything, and whether the result still sounds like you. Both answers matter. If it saved time and sounds wrong, the task is not a candidate. If it saved time and sounds fine, you have found an hour — and the question of who that hour belongs to is one worth raising deliberately, before it gets answered for you.`,
  },

  // --- Loss ---------------------------------------------------------------
  //
  // No first experiment, for the same reason as Doubt and with more at stake:
  // the framework is explicit that offering a tool here is the mistake, and
  // U-V-10 enforces it. Each block does one thing — name the specific thing
  // that is ending, precisely enough to be mourned and narrowly enough to be
  // false. "Your field" is not a loss anyone can do anything with.

  {
    id: 'domain_lens.loss.teaching',
    kind: 'domain_lens',
    stage: 'loss',
    domain: 'teaching',
    meta,
    summary: 'What is ending is not teaching. It is the essay as evidence that learning happened.',
    body: `In teaching, the thing that is ending is narrower than the conversation around it, and naming it precisely matters more here than almost anywhere else.

It is not teaching. It is not rigour, and it is not standards. It is one specific inference: that work submitted under your name-the-course conditions tells you something reliable about what the person who submitted it can now do. That inference held for a long time. It was never perfect and it was good enough to build a discipline on, and it is the thing that has stopped being dependable.

That is a real loss and it deserves to be treated as one. Assessment design, feedback, the pacing of a course, the way you knew by week six who was struggling — a great deal was resting on that single inference, quietly.

What makes this heavier is that you are being asked to replace it on a deadline, by people who have not named what was lost. You are allowed to know what is ending before you know what comes next.`,
  },

  {
    id: 'domain_lens.loss.craft',
    kind: 'domain_lens',
    stage: 'loss',
    domain: 'craft',
    meta,
    summary: 'In this field the loss is often already realised, which makes it a different thing from anticipation.',
    body: `In craft work this stage is different in kind from the other four, and it is worth being exact about why.

Elsewhere the loss is anticipated: something might change, and the fear runs ahead of it. Here it has frequently already happened. Commissions that used to come do not. Rates that held for a decade are being tested. Surveys of illustrators find a substantial minority who have already lost work, and most expecting income to fall. That is not a stage of adjustment. It is a description of what occurred.

There is a second thing ending alongside the income, and it is less often said out loud: the assumption that making something well was itself a form of security. That the work would find its way to people who could tell the difference.

This tool has nothing useful to say about whether to participate, and it should not try. If what you are holding is an objection about consent — that the work was trained on without anyone asking — then you are not at a station on anyone's curve, and the thing to do with it is not to process it.`,
  },

  {
    id: 'domain_lens.loss.analysis',
    kind: 'domain_lens',
    stage: 'loss',
    domain: 'analysis',
    meta,
    summary: 'What is ending is "I have read it" as the thing that made you worth calling.',
    body: `In advisory work the thing that is ending is specific and it is not your judgment. It is the part of your value that came from having read the corpus — the precedent, the filings, the literature, the thirty years of it — and from being the person in the room who had.

That was real expertise and it took real time to build. It also made a particular kind of phone call happen: someone rang you because you would know, and knowing was the service.

The reading is now cheap. Not perfect, not trustworthy without checking, but cheap. What that removes is not your ability to advise; it is the scarcity that made the advice valuable, and scarcity is a quieter thing to lose because nobody announces it.

What remains is harder to price and harder to demonstrate: deciding which synthesis to trust, and carrying the consequence of having decided. That may well turn out to be the more defensible position. It is also not the thing you spent those years becoming, and it is reasonable to mind that before you make your peace with it.`,
  },

  {
    id: 'domain_lens.loss.building',
    kind: 'domain_lens',
    stage: 'loss',
    domain: 'building',
    meta,
    summary: 'The part being delegated is the part that felt most like competence.',
    body: `In engineering the loss is easy to misname, because the obvious framing — that the job goes away — is not the one the evidence supports and probably not what you are actually feeling.

The thing that is ending is the fluency. Knowing the API without looking. Knowing why that system misbehaves at three in the morning and which abstraction will hurt in a year. That knowledge took a long time and it was expensive, and it is the single most delegable part of what you know.

What is left is reviewing, deciding and being accountable — which is genuinely skilled work and is not the work that made you want to do this. Reading someone else's almost-right code is a different activity from writing your own, and it uses a different part of you.

This is a real loss and your field is largely not discussing it, because your field is busy being productive. Of the five kinds of work here, yours has adopted hardest and talked about this least. You may be the only person on your team still sitting with it, which is lonely and is not evidence that you are wrong.`,
  },

  {
    id: 'domain_lens.loss.coordination',
    kind: 'domain_lens',
    stage: 'loss',
    domain: 'coordination',
    meta,
    summary: 'The visible half of your competence is the half being automated.',
    body: `In coordination and care, the loss is hard to point at because the job has two halves and only one of them is legible to anyone else.

The legible half is the documentation: the notes, the scheduling, the correspondence, the system that nobody notices until it fails. That is the half being automated, and much of it you would hand over tomorrow. The other half — knowing which student is about to drop, hearing what someone is not saying, being the person who holds the whole picture — has never appeared in a job description with any precision.

So the thing that is ending is the part of your competence that other people could see. The part that got you recognised as good at this.

Nobody is going to name that loss for you. You will more likely be told that your job is safe because it is relational, which is meant kindly and lands as a dismissal — it describes the half nobody measures while removing the half that proved you were capable. Both things can be true: the automation is welcome, and something real goes with it.`,
  },

  // --- Doubt -------------------------------------------------------------
  //
  // No first experiment at this stage. The framework's position is that
  // persuasion is the wrong move here, and `validate.test.ts` U-V-10 enforces
  // it. The move each block asks for — make the objection testable, find a
  // credible peer — therefore sits in the body, where it reads as an
  // observation rather than as homework.

  {
    id: 'domain_lens.doubt.teaching',
    kind: 'domain_lens',
    stage: 'doubt',
    domain: 'teaching',
    meta,
    summary: 'You are being asked for a position on this before anyone has established what the problem is.',
    body: `In teaching, Doubt usually arrives wearing a policy question. Someone needs a line for the syllabus, the department wants consistency, and you are expected to have a settled view of a situation that is not settled.

Underneath the procedural question is a sharper one, and it is a question about evidence rather than about rules: nothing yet tells you what the submitted work indicates about the learning. The objection most people in your field are making is not that students will cheat. It is that the instrument stopped reporting, and no one has offered a replacement.

What makes this stage heavier here than the generic account suggests is that your objection and your obligation are the same conversation. You are being asked to solve at the level of one course something unresolved at the level of the institution — and then to defend the solution.

One number worth having: in a large higher-education survey, 68% of faculty said students use these tools more than faculty do, against 2% who said the reverse. Being outpaced by the people you assess is a structural position, not a personal failing, and it is worth being precise about which of the two you are arguing from.`,
  },

  {
    id: 'domain_lens.doubt.craft',
    kind: 'domain_lens',
    stage: 'doubt',
    domain: 'craft',
    meta,
    summary: 'Your objection is about consent, and the argument you keep getting pulled into is about quality.',
    body: `In craft work this stage gets mislabelled, usually within the first exchange. You say the output is derivative. The reply is that it is improving. Both of those are true, and neither touches the objection most practitioners actually hold.

That objection is about consent: the work was trained on without anyone asking, credited or paid. It cannot be answered by the tool getting better, because getting better is not the thing being disputed. But because the public argument runs on quality, your position gets filed under taste — and every improvement in output is then treated as a refutation of something you did not say.

Worth naming plainly: a considered refusal is a position, not a stage. Interview work with artists finds people who say that consent-based training would feel substantially more ethical and who still decline to participate. That is a settled view arrived at deliberately. If that is where you are, the rest of this tool has little to tell you, and the honest reading of your situation is that the dispute is unresolved rather than that you are.`,
  },

  {
    id: 'domain_lens.doubt.analysis',
    kind: 'domain_lens',
    stage: 'doubt',
    domain: 'analysis',
    meta,
    summary: 'The argument is not whether it works. It is who carries it when it is wrong.',
    body: `In advisory work the objection is unusually precise, and it is about accountability rather than capability. You can see that synthesis is fast. You can also see that the citation you did not check is the one that ends a career, and that the signature on the advice is yours.

The complication is that your field has largely adopted already. That changes the argument you are having: it is no longer whether to use these tools but who absorbs the risk when the output is confidently wrong. And the time saved creates pressure to check less at precisely the moment checking matters most — which is a structural problem, not a discipline problem, and it does not get solved by being more careful.

Most of your field reports using these tools weekly, and a large majority also reports that their organisation is not getting the value it expected. Your scepticism is not the minority position it can feel like in a meeting. It is close to the field's own stated finding, which is a stronger place to argue from than instinct.`,
  },

  {
    id: 'domain_lens.doubt.building',
    kind: 'domain_lens',
    stage: 'doubt',
    domain: 'building',
    meta,
    summary: 'You are not speculating about the failure modes. You have them in your commit history.',
    body: `In engineering this stage is unusually well informed, which is exactly why it is frustrating. You are not guessing. You have the almost-right function that took longer to debug than writing it would have, the confident call to an API that does not exist, the review queue full of code nobody authored.

What makes it hard is the asymmetry in what each side is reading. You are reading diffs. The people deciding adoption are reading throughput. Both sets of numbers are real, and they do not meet, so the argument stalls in a place where you sound like an obstacle while describing the most common experience in your field.

Two figures from the largest developer survey are worth carrying into that conversation: 66% report frustration with almost-right output, and 45% say debugging AI-written code takes longer than writing it themselves. Trust has fallen while use has risen. You are not the sceptic in the room; you are the median, and the most experienced cohort is the most sceptical of all.`,
  },

  {
    id: 'domain_lens.doubt.coordination',
    kind: 'domain_lens',
    stage: 'doubt',
    domain: 'coordination',
    meta,
    summary: 'The objection you have is about the half of the job nobody asked you about.',
    body: `In coordination and care, Doubt rarely sounds like an argument about tools. It sounds like a question about who decided, and it is usually asked after the decision.

The pilots arrive already chosen, and they are aimed at the documentation: the scheduling, the correspondence, the notes. Most of that you would hand over gladly. Your objection is about the other half, where a person needs a person — and raising it gets heard as resistance to efficiency rather than as the professional judgment it is.

This is the clearest boundary in any of the five kinds of work this tool recognises, and the research is consistent on it: staff welcome automation of documentation and consistently refuse it for anything that substitutes for contact. Your field also has the lowest adoption of the five, and the usual explanation — that you have been told your work is safe — is not what the evidence shows. The tools on offer address the half of the job that is not the job.`,
  },

  // --- Discovery ---------------------------------------------------------
  //
  // Something has already worked once. Every experiment here is a second
  // one: repeat it somewhere else, or write down what happened. The failure
  // mode at this stage is systematising on three weeks of evidence, so none
  // of these asks anyone to build a workflow.

  {
    id: 'domain_lens.discovery.teaching',
    kind: 'domain_lens',
    stage: 'discovery',
    domain: 'teaching',
    meta,
    summary: 'The question turned from what to ban into what the assignment was measuring in the first place.',
    body: `In teaching, this stage usually starts with one assignment you rewrote, which then did something you did not predict. The question changes shape at that point: not how to detect, but what you were actually asking for.

The redesigns that hold are rarely the ones that outsmart the tool. They are the ones that ask for something it cannot supply — the working, the defence, the judgment made in a particular room about particular students. That is a design question, and it is more interesting than the policing question it replaces.

What makes this stage harder here than elsewhere is that each redesign is a bet you place alone. Institutional guidance has not caught up, so there is no shared standard to measure against and no cover if it goes badly. Colleagues who have done it describe changing what they ask for rather than how they verify — but they describe it one course at a time, in isolation from each other.

The thing that compounds at this stage is a record. The thing that stalls it is rebuilding a whole course on one good result.`,
    firstExperiment: `Take the assessment you already changed and write half a page about it, for yourself: what you expected students to do, what they actually did, and the one thing you would alter next time.

Twenty minutes, nothing to set up, and nobody sees it. What you are looking for is whether the change moved the work or only moved the wording — whether students did something different, or produced the same thing under new instructions.

Either answer is worth having. If the work changed, you have a design principle you can apply to a second assessment. If it did not, you have learned that this particular lever does not pull, which saves you repeating it across a syllabus.`,
  },

  {
    id: 'domain_lens.discovery.craft',
    kind: 'domain_lens',
    stage: 'discovery',
    domain: 'craft',
    meta,
    summary: 'You found the line between what you would hand over and what is yours, and it was not where you expected.',
    body: `In craft work this stage opens when something comes back usable — and, more often than not, it is a task you never cared about. The finding is not that the tool is good. It is where the line fell.

That line is the useful thing, and it is more specific than the public argument allows for. It is rarely "ideas mine, execution theirs". It is usually something much narrower: this kind of variant, at this stage, for this kind of project, and not the one next to it.

The complication is that the line moves. It moves by project, by client, by how much of the thinking lives in the making. Which is why the failure at this stage is generalising from one success into a workflow, and then discovering three projects later that the workflow quietly removed the part where you were deciding things.

Practitioners who get the most from this stage can say out loud which decisions they will never hand over. Not as a principle — as a list.`,
    firstExperiment: `Take the thing that worked and do it once more, on a different project. Same task, different context, no changes to how you do it.

You are testing one thing: whether it worked because of the task or because of that particular project. Ten minutes if the task was small, which it should have been.

If it holds, you have found something stable, and it is worth writing down in one line before it blurs into a general impression. If it does not hold, that is the more useful result — it means what worked was specific to a situation, and the thing you are good at is reading the situation. That is the part nobody can take, and it is much harder to see from inside a single success.`,
  },

  {
    id: 'domain_lens.discovery.analysis',
    kind: 'domain_lens',
    stage: 'discovery',
    domain: 'analysis',
    meta,
    summary: 'Verification stopped being a worry and became part of the method.',
    body: `In advisory work the shift at this stage is that checking stops being an anxiety and becomes a design problem. You are no longer asking whether to trust the synthesis. You are building the check into how the work is produced.

That is a real change in posture, and it is the one the field most needs. The structural risk named earlier — that time saved creates pressure to check less, exactly where checking matters — is not solved by resolving to be careful. It is solved by having a verification step that exists whether or not anyone is feeling diligent that afternoon.

What makes this stage specific here is that your check has to be defensible to someone else. Not "I looked it over" but a step you could describe to a regulator, a partner, or a client who is unhappy. The practitioners who get through this stage cleanly tend to have converted an instinct into something nameable.

The habit to build is the check. The trap is assuming that because you verify carefully, the process does.`,
    firstExperiment: `Think of the last piece of synthesised output you checked properly, and write down what you actually did — the three or four questions you asked of it, in the order you asked them.

Then apply exactly that list to one new piece of work this week. Nothing else changes.

You are looking for whether your check is repeatable or whether it was attention you happened to have that day. If the list holds, you have a verification step that survives a busy week, and it can be handed to someone junior. If it falls apart, you have learned that your quality control is currently a mood — which is worth knowing now rather than in a post-mortem.`,
  },

  {
    id: 'domain_lens.discovery.building',
    kind: 'domain_lens',
    stage: 'discovery',
    domain: 'building',
    meta,
    summary: 'You stopped asking whether it is good and started knowing exactly what it is good at.',
    body: `In engineering this stage is a narrowing rather than an opening. You already knew the failure modes. What changes is that you stop treating the tool as one thing with one quality level and start sorting tasks into the ones where it is reliably useful and the ones where it costs you time.

That sorting is the whole of the skill here, and it is unglamorous. Boilerplate in a language you know well: fine. Test scaffolding: often fine. Anything load-bearing in a system whose behaviour you do not yet understand: expensive, because reviewing unfamiliar code is slower than writing familiar code.

The almost-right tax does not disappear at this stage. It gets routed around. Two-thirds of your field reports paying it; the people who stop paying it are not the ones who got better prompts, they are the ones who stopped handing over the categories where it bites.

The thing worth protecting as you sort: the tasks where the understanding was the point, not the output.`,
    firstExperiment: `For one week, keep a tally — not a journal, a tally. Two columns: accepted roughly as written, and rewrote or threw away. One tick per instance, no notes, no analysis.

At the end of the week look at what is in each column. You are looking for the shape of the split: whether it falls along task type, along familiarity with the codebase, along size of change, or along nothing legible at all.

If a pattern appears, you have a routing rule worth more than any benchmark, because it is about your systems. If no pattern appears, that is also a finding: the variance is in the tool rather than in your use of it, and no amount of technique is going to fix that.`,
  },

  {
    id: 'domain_lens.discovery.coordination',
    kind: 'domain_lens',
    stage: 'discovery',
    domain: 'coordination',
    meta,
    summary: 'Something gave you an hour back, and what happens to that hour is now the live question.',
    body: `In coordination and care, this stage arrives as recovered time. A recurring document, a first draft of correspondence, a set of notes — something that reliably took an hour now takes twenty minutes, and the output is good enough that nobody has noticed it changed.

The discovery is not the tool. It is that the boundary you were defending held: the thing you handed over was documentation, and the part where a person needs a person is untouched and still yours.

What is specific to this kind of work is what happens next, and it is not a technical question. In work whose deliverable is attention, time saved has a strong tendency to be absorbed as more cases rather than more time per case. That absorption usually happens by default, without a decision, and it is much harder to reverse once it has become the expectation.

So the useful move at this stage is not finding the next task to automate. It is noticing where the hour went, while it is still an open question.`,
    firstExperiment: `For three days, write down where the recovered time actually went. One line a day, at the end of the day. Not a plan for it — a record of it.

You are looking for one thing: whether that time is going to the part of the job you said was the real part, or whether it has quietly become additional volume.

If it went to the work, you have an argument for keeping the arrangement, with evidence rather than a feeling. If it was absorbed, you have found that out in three days instead of six months — and that is the point at which it can still be named out loud as a choice someone made, which is much easier than reclaiming it later.`,
  },

  // --- Understanding ------------------------------------------------------
  //
  // The experiment here is a depth move or an outward one. Depth: find the
  // inefficiency that is left. Outward: hand something to one person. Both
  // assume competence rather than building it, which is the difference from
  // Discovery.

  {
    id: 'domain_lens.understanding.teaching',
    kind: 'domain_lens',
    stage: 'understanding',
    domain: 'teaching',
    meta,
    summary: 'You can say what your assessment measures now, which most of your colleagues still cannot.',
    body: `In teaching, this stage shows up as the ability to answer a question that stopped most people cold two years ago: what does this assignment actually measure, and how would you know.

You have rebuilt something — an assessment, a sequence, the way feedback works — and it holds. Not because it defeats the tools, but because you got clear about what you were asking for. The policy question that dominated Doubt has receded, not because it was settled but because it turned out to be downstream of a design question you have now answered for your own course.

What is specific here is how uneven the ground around you still is. Institutional guidance has not caught up and your colleagues are at five different stations. Your competence is real and it is also local: it lives in your course, undocumented, and nobody has asked you to write it down.

That is the opportunity at this stage and also the risk. Local knowledge that stays local gets rebuilt from scratch by the next six people.`,
    firstExperiment: `Find one colleague who is still in the policy argument — the one who keeps raising detection in meetings — and offer them the specific thing you changed, not the principle behind it. "I rewrote this assignment this way, here is what the students did."

Twenty minutes over coffee, no preparation, and you are not persuading anyone of anything.

What you are looking for is whether your change is transferable or whether it only works because of who you are and what you teach. If they can see how to use it, you have something worth writing up for the department. If they cannot, you have learned that it is more particular than it felt — which is useful before you offer it to thirty people.`,
  },

  {
    id: 'domain_lens.understanding.craft',
    kind: 'domain_lens',
    stage: 'understanding',
    domain: 'craft',
    meta,
    summary: 'You can name which decisions are yours, and the list is shorter and firmer than you expected.',
    body: `In craft work this stage arrives as a kind of settled boundary. You know which parts of the process you will hand over and which you will not, you can say why, and the answer no longer shifts with each project.

The thing worth noticing is that the list of what is yours came out shorter and harder than the version you would have given two years ago. Not "the creative work" — something like: the brief interrogation, the one structural decision, the final pass where taste actually operates. Everything around it turned out to be negotiable.

That shortening is not a diminishment, though it can feel like one. A short defensible list is worth considerably more than a long vague one, because you can price it, explain it to a client, and tell when someone is asking you to give it up.

What is specific to this field at this stage: you are now in a position to say what you do that cannot be bought cheaply, in a market where most practitioners still cannot.`,
    firstExperiment: `Write the list. Literally — the decisions in your process you will not hand over, as a numbered list, in the plainest language you can manage. Not principles. Decisions.

Fifteen minutes, for you, not for a client.

What you are looking for is whether each item survives the question "could I describe this to someone paying me?" The ones that do are the beginning of how you talk about your work now. The ones that collapse into "judgment" or "taste" need another pass — not because they are wrong, but because an unnameable value is one you cannot defend when someone proposes removing it.`,
  },

  {
    id: 'domain_lens.understanding.analysis',
    kind: 'domain_lens',
    stage: 'understanding',
    domain: 'analysis',
    meta,
    summary: 'Your verification is now a process rather than an act of diligence, which is what makes it survive a bad week.',
    body: `In advisory work this stage is where verification stops being a virtue and becomes infrastructure. The check happens because it is built into how work moves, not because you remembered to care on a particular Tuesday.

That is the thing the field most needs and least has. The structural risk named earlier — that saved time creates pressure to check less, exactly where checking matters most — only resolves when the check is no longer discretionary. You have made yours non-discretionary, and you can describe it to someone else.

What is specific here is that your position is now defensible in a way that matters professionally. Not "I was careful" but "this is the step, here is what it catches, here is what it misses". That distinction is the difference between judgment and liability, and almost everyone in your field is still on the wrong side of it while reporting weekly use.

The remaining inefficiency is usually not in the drafting. It is in the handoffs.`,
    firstExperiment: `Take your verification step and give it to one person more junior than you, on one real piece of work, and watch what happens without intervening.

Half an hour, on something already in progress.

You are looking for the parts of the check that turn out to be unwritten — the judgment you make without noticing, which does not survive being handed over. That gap is the most valuable thing you will find this month: it is either something you can teach, in which case your process scales, or something that genuinely requires your experience, in which case you have located precisely what your signature is for.`,
  },

  {
    id: 'domain_lens.understanding.building',
    kind: 'domain_lens',
    stage: 'understanding',
    domain: 'building',
    meta,
    summary: 'You route work by where it actually helps, and you have stopped arguing about the tool in general.',
    body: `In engineering this stage looks unremarkable from the outside, which is part of the point. The tools are in the workflow where they earn their place and absent where they do not, and you no longer have a position on them in the abstract.

What changed is that you stopped treating this as one question. Boilerplate in a familiar language, test scaffolding, a first pass at something you will rewrite anyway: fine. Anything load-bearing in a system whose behaviour you are still learning: still expensive, because reviewing unfamiliar code is slower than writing familiar code, and that has not changed.

The thing specific to your field here is that you are now unusually well placed and unusually quiet about it. Your field adopted hardest and discusses the costs least; trust has fallen while use has risen. Someone who can say precisely where the line falls, with examples, is more useful to a team than another benchmark — and is rarer than the adoption numbers suggest.

The inefficiency left is usually in review, not in authoring.`,
    firstExperiment: `Take the routing rule you have arrived at and write it down as three bullets in your team's actual documentation — the repository README, the onboarding page, wherever people look. Not a policy. A description of what has worked for you and what has not.

Twenty minutes, and it does not need permission.

You are looking for whether your rule survives contact with someone else's judgment. If colleagues argue with it, you get the specific cases where your experience does not generalise, which is exactly what you cannot see from inside your own work. If nobody argues, you have just saved every new person on the team the six months it took you.`,
  },

  {
    id: 'domain_lens.understanding.coordination',
    kind: 'domain_lens',
    stage: 'understanding',
    domain: 'coordination',
    meta,
    summary: 'You hold the line between what gets automated and what needs a person, and you can explain it.',
    body: `In coordination and care, this stage is the point where the boundary stops being instinct and becomes something you can state in a meeting.

Documentation goes. Contact does not. You can say which specific interactions fail when they are handled by a system — the ones where the person needed to be heard before they could be helped, where the question they asked was not the question they had — and you can give examples rather than principles.

That articulacy is rarer than it should be, and it matters for a reason beyond your own work. Decisions about these tools in your institution are usually made by people who classify your role as administrative and who are not in the room when the relational half happens. The boundary you can describe is the only evidence that half exists.

What is specific at this stage: you have gone from having an unease with no standing to having a position with examples. That is the thing that travels upward, and almost nobody in your position has it in a form that survives being repeated by someone else.`,
    firstExperiment: `Write down two cases from the last month: one interaction that would have gone fine handled by a system, and one that would have gone badly. Three sentences each, with what specifically made the difference.

Twenty minutes, and keep the names out.

You are looking for the distinguishing feature — not "it was complicated" but the actual thing: that they were distressed, that the real question came out four minutes in, that the correct answer was against policy. Two concrete cases will do more in a governance conversation than any amount of principled objection, and you are the only person who can supply them.`,
  },

  // --- Integration --------------------------------------------------------
  //
  // Outward only. The framework's behaviour for this stage is generosity, and
  // the experiment is always the same shape: go back for one person who is in
  // Discomfort. What differs by field is who that person is and what the
  // hardest part was, which is the part they cannot see from where they are.

  {
    id: 'domain_lens.integration.teaching',
    kind: 'domain_lens',
    stage: 'integration',
    domain: 'teaching',
    meta,
    summary: 'You are now the colleague who can make this ordinary for someone else, which is scarce.',
    body: `In teaching, Integration is less about your own courses than about what you are to the people around you.

Your assessment works. You have stopped thinking about it daily. The useful thing you now hold is not the design — it is the memory of the eighteen months when nothing was settled, and the knowledge of which parts of that were genuinely hard rather than merely unfamiliar.

That matters here more than in the other four kinds of work, because teaching is where the institutional vacuum is widest. A minority of institutions have comprehensive guidance, and the people most affected by that absence are early-career colleagues who cannot afford a public experiment that fails and who are being assessed on their teaching while the ground moves.

What you can give them is not your rubric. It is the sentence that your department has never said out loud: that nobody has this settled, that the uncertainty is structural rather than personal, and that redesigning one assignment is a reasonable amount to attempt in a term.`,
    firstExperiment: `Pick one colleague who is clearly stuck — reading everything, changing nothing — and tell them specifically what you found hardest, not what worked.

Fifteen minutes, in person, without offering to help.

You are looking for what shame is doing to them. The gap between "I should have this sorted by now" and "I do not" is what stops people trying anything, and the only thing that reliably closes it is a competent colleague saying the hard part out loud first. If they relax, you have given them permission that nobody else was going to. If they do not, you have at least stopped being another person who makes it look easy.`,
  },

  {
    id: 'domain_lens.integration.craft',
    kind: 'domain_lens',
    stage: 'integration',
    domain: 'craft',
    meta,
    summary: 'You can describe where your judgment lives, which is what younger practitioners most need and least hear.',
    body: `In craft work, the generosity this stage asks for runs into something specific to the field, and it is worth naming before acting on it.

Your settlement is yours. It was arrived at through particular circumstances — your clients, your rates, your tolerance for risk, your view about consent and whether the question is closed. Someone three years into the field has none of those and is being told by everyone that adaptation is mandatory.

So the useful thing you can offer is not your position. It is the texture of how you reached one: what you tried, what it cost, which commission you turned down and whether you regretted it. That is the content nobody publishes, because the public conversation is conducted entirely in positions.

A particular caution for this field: do not tell someone whose objection is about consent that they will come round. They may be right, the matter is unresolved, and the thing you can usefully say about their refusal is what it will cost and whether you think it can be afforded.`,
    firstExperiment: `Find one practitioner earlier in their career than you and describe, concretely, one decision you made about this and what it cost you. Not advice. An account.

Twenty minutes, and the cost is the part that matters.

You are looking for whether you can tell it without the ending sounding inevitable. The useful version includes the thing you got wrong and the part you are still not sure about. If you can only tell it as a success, it will land as another person who has it figured out, which is what they already have too much of — and it will teach them nothing about how to be where they actually are.`,
  },

  {
    id: 'domain_lens.integration.analysis',
    kind: 'domain_lens',
    stage: 'integration',
    domain: 'analysis',
    meta,
    summary: 'Your verification habit is teachable, and almost nobody in your field has written theirs down.',
    body: `In advisory work this stage has an unusual property: the valuable thing you hold is a process, which means it can be handed over almost intact.

You know what you check, in what order, and what each step catches. That is not wisdom, which is hard to transfer. It is a procedure, and procedures move between people — which makes you more useful to your field at this stage than you were at any earlier one.

The specific pressure is that your firm will want it as policy and your juniors need it as practice, and those are different artefacts. Policy describes what must happen; practice describes what you actually do when the deadline is tomorrow and the synthesis looks fine. The second is what prevents the failure, and it is the one that does not get written down.

The person who needs it is the one two years in, producing confident work very fast, who has not yet had the experience of being wrong in public. They will not ask.`,
    firstExperiment: `Take one junior colleague through a piece of work where the output looked right and was not — yours, ideally — and show them how you caught it.

Half an hour, with the actual document.

You are looking for the moment they realise the check is not about doubting the tool. It is about the fact that their name goes on it. Someone who understands that will build their own version of your process; someone who learns it as compliance will skip it the first time they are busy. If they ask what to do when there is no time, you have the right person and the real conversation has started.`,
  },

  {
    id: 'domain_lens.integration.building',
    kind: 'domain_lens',
    stage: 'integration',
    domain: 'building',
    meta,
    summary: 'The juniors on your team are losing the fluency you got to build, and only you can see it.',
    body: `In engineering, Integration comes with a responsibility that is specific to this field and barely discussed in it.

You built your fluency the slow way, before any of this, and that is what lets you tell almost-right code from right code at a glance. The people joining your team now will not get that apprenticeship by default. They will be productive sooner and will understand the systems later, if at all — and the review burden for that lands on you, which is the part teams notice, and on them, which is the part nobody does.

Your field adopted fastest and reflected least. Trust in output has fallen while use has risen, and the most experienced people are the most sceptical — which means the gap between what juniors are producing and what they can explain is widening while everyone looks at throughput.

You are in a position to do something small and unpopular about that, inside your own team, without a policy.`,
    firstExperiment: `Next time you review code from someone junior that was largely generated, ask one question about why it works rather than whether it works. Pick something load-bearing. Ask it in the review, in writing, kindly.

Five minutes, and it is already your job.

You are looking for whether they can reconstruct the reasoning. If they can, the understanding is there and the tool was a typing aid — which is good news and worth saying. If they cannot, you have found the exact seam where fluency is not forming, and a single specific question does more about that than any amount of general concern about juniors and AI.`,
  },

  {
    id: 'domain_lens.integration.coordination',
    kind: 'domain_lens',
    stage: 'integration',
    domain: 'coordination',
    meta,
    summary: 'You can articulate the boundary, and the people who decide these things have never heard it described.',
    body: `In coordination and care, this stage carries something the other four do not: your settlement is also the only articulate version of a position that your whole function holds and rarely gets to state.

You know which parts of the work are improved by automation and which fail when a person is removed, and you can say why with examples. Most colleagues in your position have the same knowledge as an instinct and lose the argument because instinct does not survive a governance meeting.

The structural problem is standing. Decisions about these tools are made by people who classify your role as administrative, which underplays what it includes — student support, judgment, the thing that stops a problem becoming a crisis. Your field also has the lowest adoption of the five, which gets read as reluctance rather than as what it is: the tools on offer address the documented half and not the half that is the job.

Generosity here points in two directions. One is the colleague who feels unease with no standing. The other is upward, which is less comfortable and more useful.`,
    firstExperiment: `Take the two cases you wrote down and give them to one colleague who sits in the meetings you do not — a manager, a committee member, anyone upstream of the next decision.

Twenty minutes. Not a complaint, not a proposal: two accounts of what happened, and what would have happened without a person in the middle.

You are looking for whether the distinction survives being retold by someone who was not there. If it does, your function has a line in a room it is usually absent from. If it does not, you have learned what detail got dropped — and that is the detail to lead with next time, which is worth more than being right in a conversation nobody heard.`,
  },
];
