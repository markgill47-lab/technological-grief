import type { ThreatResponseBlock } from './schema';

const meta = { author: 'Mark Gill', lastReviewed: '2026-10-31' };

/**
 * Seven threats, eight blocks. `skills_obsolescence` is the one threat whose
 * content genuinely differs by stage, so it carries two stage-scoped variants.
 */
export const THREAT_RESPONSES: ThreatResponseBlock[] = [
  {
    id: 'threat_response.skills_obsolescence@early',
    kind: 'threat_response',
    threat: 'skills_obsolescence',
    stageScope: ['loss', 'doubt'],
    meta,
    body: `The thing you built was real. Years went into it, it was hard, and it distinguished you — and it is reasonable to be angry that the distinction may not hold.

Be precise about what is actually at risk, though, because "my skills" is too coarse to reason about. Some of what you learned was execution, and execution is getting cheap. Some of it was judgment you can only have by having done the execution a thousand times, and that is not transferable by prompt. Those two things feel like one skill from the inside. They are not, and the difference is most of what happens next.`,
  },

  {
    id: 'threat_response.skills_obsolescence@late',
    kind: 'threat_response',
    threat: 'skills_obsolescence',
    stageScope: ['understanding', 'integration'],
    meta,
    body: `Worth marking something you may have moved past without noticing: the skills you thought you were losing are the reason you are good at this now.

Your judgment about what to delegate and what to keep is not available to someone who skipped the years you put in. They can produce the same surface. They cannot tell when it is wrong. What you lost was the exclusivity of execution. What you kept turned out to be the part that was hard to build.`,
  },

  {
    id: 'threat_response.identity_authority',
    kind: 'threat_response',
    threat: 'identity_authority',
    meta,
    body: `Being the person who knows is a real position, and it is being eroded in a way that feels less like competition than like dissolution. Not someone knowing more than you — the category itself getting cheaper.

The part that is genuinely gone is **recall as a credential**: having read it, having memorized it, being the one in the room who can produce the fact. The part that is not going is being the person who can tell when an answer is wrong. That is a harder thing to demonstrate and it does not announce itself the way expertise used to. It is also considerably more difficult to replace.`,
  },

  {
    id: 'threat_response.verification',
    kind: 'threat_response',
    threat: 'verification',
    meta,
    body: `You are being asked to stand behind work whose origin you cannot establish, and that is not a tooling complaint — it is a structural problem that your institution has probably not solved either.

One distinction helps more than anything else here: separate *detecting* from *designing*. Detection is a losing position; it is adversarial, unreliable, and it makes you a police officer in a job you did not take for that. Design is the question of what evidence you would accept instead — what makes the thinking visible rather than the output. It is a harder question and it is the one that has an answer.`,
  },

  {
    id: 'threat_response.authenticity_quality',
    kind: 'threat_response',
    threat: 'authenticity_quality',
    meta,
    body: `When you say the output is technically competent and completely hollow, that is not nostalgia, and it is not a failure on your part to appreciate the new thing. It is an accurate observation about a great deal of what is now being produced.

Here is the part that is easy to miss: noticing the hollowness is a capability, and you should not assume it is widely held. The flood of competent-and-empty work makes someone who can tell the difference more valuable, not less — but only if you exercise that discernment on something, rather than keep it as the reason you stay out.`,
  },

  {
    id: 'threat_response.economic',
    kind: 'threat_response',
    threat: 'economic',
    meta,
    body: `This is the one concern this framework cannot reassure you about, and it would be insulting to try. Whether your role exists in five years is not knowable, and anyone confident in either direction is selling something.

What is worth separating is the threat to the *role* from the threat to the *capability*. Roles are organizational artifacts and they get restructured for many reasons. Capabilities are portable. The strongest available position is not betting correctly on which roles survive — it is being someone whose judgment is useful across several possible arrangements of the work.`,
  },

  {
    id: 'threat_response.ethical',
    kind: 'threat_response',
    threat: 'ethical',
    meta: {
      ...meta,
      note: 'Highest-sensitivity block in the library. Any edit requires a second reviewer.',
    },
    body: `Your objection is not a stage, and this tool is not going to treat it as one.

The concerns about training data provenance, consent, uncompensated labor, and environmental cost are substantively unresolved. People who have thought hardest about them have not reached agreement, and declining to participate in something you consider wrong is a coherent position, not a condition to be worked through.

One distinction is worth drawing, and only you can draw it: whether yours is *"not under any circumstances"* or *"not until certain conditions are met."* Both are legitimate. They lead different places, and conflating them is how a principled position gets quietly converted into indefinite waiting. The first is a commitment. The second has terms, and it is worth knowing what yours are — so you can tell whether they are ever met.

Nothing in the rest of this is addressed to you as someone who needs moving.`,
  },

  {
    id: 'threat_response.control_opacity',
    kind: 'threat_response',
    threat: 'control_opacity',
    meta,
    body: `You are accountable for outcomes produced by a process you cannot inspect. That is a legitimate professional objection and in several fields it is a regulatory one.

It does not resolve into trust, and it should not. What it resolves into is scope: the tasks where you can fully verify the output are categorically different from the tasks where you are taking the result on faith. Those are two different risk classes and they deserve different rules. People who do this well are not more trusting than you. They are stricter about which pile a task belongs in.`,
  },
];
