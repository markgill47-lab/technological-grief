import type { Domain, Stage } from '../domain/types';

export interface ImageBrief {
  /** One line naming what the frame shows. Becomes the alt text. */
  alt: string;
  /** The brief to hand the generator. */
  prompt: string;
}

/**
 * One image per modal: twelve in all, to be generated in Krea2 and dropped in
 * where the placeholders currently sit.
 *
 * House rules, derived from the content itself rather than from a style
 * preference. Break them and the images will undercut the writing:
 *
 *  - **Real people doing real work**, mid-action, hands visible. The whole
 *    framework is that this is an ordinary human response to an ordinary
 *    professional loss.
 *  - **No technology as subject.** No screens dominating the frame, no
 *    circuitry, no glowing brains, no robot hands, no blue holographic
 *    anything. A laptop may be present the way a stapler is present.
 *  - **No metaphor for the emotion.** No one with their head in their hands,
 *    no silhouette on a mountain, no light at the end of a tunnel. The image
 *    shows a moment; the text does the naming.
 *  - **Quiet, specific, documentary.** Natural light, muted palette, shallow
 *    depth of field. These sit on a near-black ground, so favour frames that
 *    carry one warm light source rather than a bright evenly-lit studio.
 *  - **Faces optional, dignity mandatory.** Nobody is to be shown as
 *    pitiable, foolish, or behind.
 */
export const IMAGE_BRIEFS: Record<Stage, { why: ImageBrief; forward: ImageBrief }> = {
  loss: {
    why: {
      alt: 'A woodworker’s hand resting on a hand plane they have just set down.',
      prompt:
        'Documentary photograph, workshop in late afternoon light. A woodworker’s hand resting flat on a wooden hand plane they have just set down on the bench. The bench is swept and tidy; the work is finished or has not started. Shallow depth of field, warm single-source window light, muted browns. No face. No screens. The hand is still, not gripping.',
    },
    forward: {
      alt: 'Someone writing a short list on a single index card at a kitchen table.',
      prompt:
        'Documentary photograph, kitchen table, early morning. A person in their fifties writing a short list on a single index card, pen mid-word, three or four lines already written but illegible. One mug, a small lamp. Overhead three-quarter angle, hands and card sharp, face soft and partly out of frame. Warm, unhurried, private.',
    },
  },

  doubt: {
    why: {
      alt: 'Two colleagues mid-disagreement across a desk, neither looking at the laptop between them.',
      prompt:
        'Documentary photograph, small office. Two colleagues across a desk mid-conversation: one leaning back with arms folded and chin slightly raised, the other mid-sentence with one hand open. A closed laptop sits between them, ignored. Neither is looking at it. Natural window light from the left, muted greys and warm skin tones. The posture is professional disagreement, not hostility.',
    },
    forward: {
      alt: 'A hand marking one line in a printed draft with a red pencil.',
      prompt:
        'Documentary close-up, desk. A hand marking a single line in a printed draft with a red pencil, the rest of the page clean and unmarked. A short stack of other pages to the side. Raking light across the paper so the texture reads. The mark is precise and small — one specific objection, not a page covered in corrections.',
    },
  },

  discomfort: {
    why: {
      alt: 'A desk from above: overlapping piles of printouts, a cold coffee, an empty chair.',
      prompt:
        'Documentary photograph shot from directly above a desk. Four or five overlapping piles of printed articles and conference handouts, sticky notes on some, none of them open. A cup of coffee gone cold with a ring on the desk beside it. The chair is empty and pushed back. Flat, slightly cool daylight. The feeling is accumulation without action — not mess, but too much material and no sorting.',
    },
    forward: {
      alt: 'A kitchen timer set to twenty minutes beside one blank sheet of paper.',
      prompt:
        'Documentary close-up on a plain desk. A mechanical kitchen timer wound to twenty minutes, beside one blank sheet of paper and a pen laid parallel to it. Nothing else on the surface. Warm side light, long soft shadow from the timer. Calm and small-scale: the frame contains exactly one task.',
    },
  },

  discovery: {
    why: {
      alt: 'A potter’s second attempt standing beside the first, visibly better.',
      prompt:
        'Documentary photograph, pottery studio bench. Two thrown bowls side by side, clearly the same form attempted twice: the first lopsided, the second noticeably better. A pair of clay-dusted hands rests at the edge of frame, relaxed. Warm north light, earth tones, visible clay dust. The subject is the difference between the two, not either bowl.',
    },
    forward: {
      alt: 'Two people at a café table comparing notes in a shared notebook, laughing.',
      prompt:
        'Documentary photograph, café table by a window. Two people in their thirties leaning over one open notebook between them, both pointing at the same line, one laughing at something that evidently did not work. Two coffees, crumbs, a phone face-down and forgotten. Golden afternoon light, warm and candid. Peers comparing notes, not an expert instructing a novice.',
    },
  },

  understanding: {
    why: {
      alt: 'A chef plating calmly during service, tools in reach and unremarkable.',
      prompt:
        'Documentary photograph, professional kitchen during service. A chef plating with one steady hand, tweezers mid-placement, entirely calm. Tickets on the rail behind, slightly out of focus. Every tool is within reach and none of them is the subject. Warm practical lighting, steam, stainless steel. Competence that has stopped being remarkable to the person doing it.',
    },
    forward: {
      alt: 'A senior colleague sitting beside a junior, pointing at the junior’s own notes.',
      prompt:
        'Documentary photograph, open-plan workspace. A senior colleague has pulled a chair alongside a younger one and is pointing at the younger person’s handwritten notes on the desk, not at the monitor. Both are looking at the notebook. Relaxed posture, one coffee each. Soft daylight. The expertise is being handed over, not performed.',
    },
  },

  integration: {
    why: {
      alt: 'An older tradesperson watching an apprentice work, hands in pockets, not intervening.',
      prompt:
        'Documentary photograph, workshop or garage. An older tradesperson stands a step back watching an apprentice work, hands in pockets, visibly choosing not to intervene. The apprentice is mid-task and absorbed, in focus; the older figure is slightly behind and softer. Warm overhead work light. The restraint is the subject.',
    },
    forward: {
      alt: 'Two people walking out of a building mid-conversation, one carrying both coffees.',
      prompt:
        'Documentary photograph, exterior, end of the working day. Two colleagues walking out of a building mid-conversation, one carrying both coffees, the other talking with one hand. Low sun behind them, long shadows, campus or city street softly out of focus. Easy and companionable — someone going back for someone else.',
    },
  },
};

/**
 * Per-domain images, where a stage's picture should change with the field.
 *
 * Empty for now by intention. The thirty of these — six stages by five
 * domains — are the other half of the domain matrix in
 * `specs/content-architecture.md` §3, and they are waiting on the evidence
 * review for what each field actually reports losing. The lookup below falls
 * back to the stage-level brief, so a half-filled table degrades to the
 * picture we already have rather than to a hole.
 */
export const DOMAIN_IMAGE_BRIEFS: Partial<
  Record<Stage, Partial<Record<Domain, ImageBrief>>>
> = {};

/**
 * The image for a door. Domain-specific where one has been authored, and only
 * on the "why" door: what you are losing differs by field, while the first
 * move out of a stage is the same move whoever you are.
 */
export function briefFor(
  stage: Stage,
  door: 'why' | 'forward',
  domain: Domain | null,
): ImageBrief {
  if (door === 'why' && domain) {
    const specific = DOMAIN_IMAGE_BRIEFS[stage]?.[domain];
    if (specific) return specific;
  }
  return IMAGE_BRIEFS[stage][door];
}
