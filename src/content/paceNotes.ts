import type { PaceNoteBlock } from './schema';
import type { RogersPosition } from '../domain/types';

const meta = { author: 'Mark Gill', lastReviewed: '2026-11-02' };

/**
 * Pace notes. Selected by Rogers position, framed by the sign of the Grief
 * Gap - the only place content varies on something other than a taxonomy key,
 * handled inside the block rather than by multiplying blocks.
 *
 * The `userAhead` framings exist because a negative gap is isolation, not a
 * smaller amount of grief. v1 had no representation for this case.
 *
 * Voice: ClaudeWritingGuides/marks-voice-guide.md. No em-dashes (Hard Rule 1),
 * no "honest difficulty" or its cousins (Hard Rule 2), and the laggard's
 * field-ahead framing states its read as a read instead of attributing it to
 * the framework (Rule 1.3).
 */
export const PACE_NOTES: Record<RogersPosition, PaceNoteBlock> = {
  innovator: {
    id: 'pace_note.innovator',
    kind: 'pace_note',
    rogers: 'innovator',
    meta,
    framings: {
      aligned: `You move toward new things early, and you are used to being out in front. That is a disposition, not a virtue. It has cost you before on things that did not pan out. It happens to be serving you well here.`,
      fieldAhead: `Unusual position for you: your field has moved further than you have. Worth asking whether this is genuine caution about this particular technology, or whether something else (bandwidth, a bad early experience) is doing the deciding.`,
      userAhead: `You are well ahead of your field, which is familiar territory and still tiring. The risk is not impatience. It is reading institutional slowness as stupidity. It usually is not. Find peers outside your organization, because you will not get a useful conversation inside it for a while.`,
    },
  },

  early_adopter: {
    id: 'pace_note.early_adopter',
    kind: 'pace_note',
    rogers: 'early_adopter',
    meta,
    framings: {
      aligned: `You adopt things once they look real but before they are settled, and you are typically among the first in your circle. You are moving roughly with the people who move early.`,
      fieldAhead: `You are usually ahead and currently are not, which is probably why this feels worse than the actual gap warrants. The discomfort may be more about the unfamiliar position than about the distance.`,
      userAhead: `You are ahead of your field, which is where you usually are, with the usual consequence: people will come to you before they are ready to act. Decide in advance how much of that you will carry. Now is a better time for that than the point of resentment.`,
    },
  },

  early_majority: {
    id: 'pace_note.early_majority',
    kind: 'pace_note',
    rogers: 'early_majority',
    meta,
    framings: {
      aligned: `You wait for evidence before committing, and that has protected you from a lot of wasted effort. You are moving about when your field is moving.`,
      fieldAhead: `Your instinct is to wait for proof, and the difficulty is that this is moving faster than proof accumulates. The pressure you feel is the gap between your evidence threshold and the evidence available. That is a structural problem, not a personal failing. The adjustment is smaller than it sounds: lower the stakes of the test rather than the standard of proof.`,
      userAhead: `You are ahead of your field despite a pragmatic disposition, which usually means you found a concrete reason rather than catching enthusiasm. That reason is worth articulating: it is exactly the evidence the people behind you are waiting for, and you are more credible to them than any enthusiast.`,
    },
  },

  late_majority: {
    id: 'pace_note.late_majority',
    kind: 'pace_note',
    rogers: 'late_majority',
    meta,
    framings: {
      aligned: `You adopt when it becomes necessary rather than when it becomes possible, and that is a reasonable allocation of finite attention.`,
      fieldAhead: `Your field has moved substantially further than you have, and that distance is the main source of the pressure you are feeling. Worth being clear: the gap is largely structural. People who move later face a harder adjustment through no fault of their own, because they arrive when the expectations have already reset. What makes it manageable is not catching up. It is one entry point narrow enough to actually start.`,
      userAhead: `You are ahead of your field, which given your usual pace means your field has barely engaged at all. Expect to be treated as the enthusiast, which will be an odd fit.`,
    },
  },

  laggard: {
    id: 'pace_note.laggard',
    kind: 'pace_note',
    rogers: 'laggard',
    meta,
    framings: {
      aligned: `You adopt new things rarely and late, which in an unstable field is often the correct call. A great deal of what demanded urgent attention over the years did not matter.`,
      fieldAhead: `Your field has moved a long way past where you are, and the distance is large enough that catching up is not a sensible frame. My read: your caution has been strategically sound more often than not, and this is one of the times the ground genuinely shifted. Both of those are true at once. The only useful question is whether there is one small thing worth doing, not whether you were wrong to wait.`,
      userAhead: `You are ahead of a field that has barely started, which is a rare combination and a lonely one. You will get very little useful conversation locally.`,
    },
  },
};
