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
];
