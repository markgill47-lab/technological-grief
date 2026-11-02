import type { Domain, Stage } from '../domain/types';

export interface ImageBrief {
  /** One line naming what the frame shows. Becomes the alt text. */
  alt: string;
  /** The brief to hand the generator. */
  prompt: string;
}

/**
 * A prompt is assembled as `PROMPT_LEAD + brief.prompt + ' ' + PROMPT_RULES`.
 *
 * Both are reproduced verbatim from the run that generated the shipped set —
 * `tools/comfy/catalog-jobs.json` holds the forty-two prompts exactly as sent,
 * and these two constants are what they have in common. Do not tidy the
 * wording: a change here is a change to what the next generation looks like,
 * and the set on disk was made with these strings. The lead's trailing space
 * is load-bearing.
 *
 * The lead is what makes these drawings rather than photographs, and it has
 * to lead: the style reference alone loses to any camera vocabulary later in
 * the prompt, which is why `U-V-15` keeps camera words out of the briefs.
 *
 * Earlier runs used two shorter leads — 'Hand-drawn line art. ' and the same
 * without the darkness sentence. Twenty-six frames came from the first and
 * five from the second, but they only survived where the frame happened to
 * come out dark anyway. This one is what produced the black grounds the set
 * is now uniform on, so it is the one recorded.
 */
export const PROMPT_LEAD =
  'Hand-drawn line art, chalk and ink on black paper. The background is deep ' +
  'solid black and the room falls away into unlit darkness beyond the lit ' +
  'figures. ';

/**
 * Appended to every prompt. Kept out of the prompts themselves so they stay
 * readable, but not optional: text is the failure mode these images are most
 * prone to. Generated writing is always subtly wrong, it dates the image, it
 * cannot be translated, and a screen reader gets nothing from it.
 *
 * The blank-surfaces sentence was added during the fix passes and earns its
 * place: it is what stopped a whiteboard and a bank of monitors from pulling
 * writing back into frames that had been clean without them.
 */
export const PROMPT_RULES =
  'Plain blank walls, bare unmarked surfaces throughout. No text, lettering, ' +
  'signage, numerals or legible writing anywhere in frame. No logos or brand ' +
  'marks. Not stock photography: no posed smiles, no eye contact with the ' +
  'camera, no thumbs up.';

/**
 * One image per modal: forty-two in all, to be generated in Krea2 and dropped
 * in where the placeholders currently sit.
 *
 * House rules, derived from the content rather than from a style preference.
 * Break them and the images will undercut the writing:
 *
 *  - **A person, in a situation.** Every frame has someone in it, doing or
 *    not-doing something that belongs to that stage. An empty desk is a
 *    still life; the person is what makes it a stage of anything.
 *  - **No text, anywhere.** Not on paper, not on a screen, not on a sign or
 *    a spine or a whiteboard. Where writing would naturally appear, shoot it
 *    as loose marks, from behind, or leave it out. `PROMPT_RULES` carries this
 *    to the generator and `validate.test.ts` U-V-13 keeps text-bearing props
 *    out of the briefs in the first place.
 *  - **Somewhat abstract.** The situation should read before the detail does:
 *    posture, distance between people, where the light is, what someone is
 *    not doing. These are not illustrations of the sentence next to them.
 *  - **No technology as subject.** No screens dominating, no circuitry, no
 *    glowing brains, no robot hands. A laptop may appear the way a stapler
 *    appears — closed, ignored, at the edge of frame.
 *  - **No metaphor for the emotion.** No head in hands, no silhouette on a
 *    mountain, no light at the end of a tunnel. The frame shows a moment;
 *    the text beside it does the naming.
 *  - **Faces optional, dignity mandatory.** Nobody is shown as pitiable,
 *    foolish, or behind. Several of these people are standing still, and
 *    standing still is not the same as being stuck.
 *
 *  - **Drawings, not photographs.** The chosen house style is hand-drawn
 *    line art, chalk and ink on black paper, with red and blue as sparing
 *    accents. It lives in `PROMPT_LEAD` and in
 *    `tools/comfy/style-refs/house_style.png`, with a per-domain abstract
 *    as the reference for each field's frames.
 *    Keep camera vocabulary out of the briefs entirely — "motion blur",
 *    "shallow depth of field", "out of focus", "shot from low" all read as
 *    an instruction to make a photograph and will override the style
 *    reference. Where something should be indistinct, say how it is drawn:
 *    loose open outlines against a fully drawn figure. `U-V-15` enforces
 *    this, because the first generation run lost seven frames to it.
 *
 * The lighting words that remain are about where the light falls in the
 * scene, which a drawing can honour. They sit on a near-black ground in
 * dark mode and on white in light, and the black-paper style suits both.
 */
export const IMAGE_BRIEFS: Record<Stage, { why: ImageBrief; forward: ImageBrief }> = {
  loss: {
    why: {
      alt: 'A woman standing at an office window at dusk with her coat still on.',
      prompt:
        'A woman in her fifties stands at a window in an emptied office at dusk, coat still on, one hand resting on the frame, looking out rather than at anything in particular. The room behind her is dark and the overhead lights are off. Low warm light from outside against deep interior shadow. Stillness, not collapse.',
    },
    forward: {
      alt: 'A man sitting on the edge of a desk in a quiet room, thinking.',
      prompt:
        'A man sits sideways on the edge of a desk in a quiet room, forearms on his knees, hands loosely together, looking at the middle distance. His chair is pushed away behind him. One warm lamp, everything else dim. He is working something out, not giving up.',
    },
  },

  doubt: {
    why: {
      alt: 'Two colleagues across a table mid-disagreement, a closed laptop ignored between them.',
      prompt:
        'Two colleagues either side of a table, one leaning back with arms folded and chin slightly raised, the other mid-sentence with one hand open. A closed laptop sits between them, ignored by both. Window light from the left, muted greys and warm skin tones. Professional disagreement, not hostility.',
    },
    forward: {
      alt: 'A person pausing in a meeting-room doorway, half turned back toward the room.',
      prompt:
        'A person pauses in the doorway of a meeting room, one hand still on the frame, half turned back toward the people talking inside, who are drawn as loose open outlines. Cool corridor light against warm room light. The hesitation is deliberate rather than timid.',
    },
  },

  discomfort: {
    why: {
      alt: 'A person standing still in a busy open-plan office while colleagues move past as loose outlines.',
      prompt:
        'A person stands completely still in the middle of a busy open-plan office, arms at their sides, looking at nothing in particular, while two or three colleagues pass around them, drawn as loose open outlines while the still figure is fully drawn. Flat cool daylight. Stillness inside movement.',
    },
    forward: {
      alt: 'A person pulling their chair in at a cleared desk, about to start one thing.',
      prompt:
        'A person pulls their chair in at a completely cleared desk, sleeves pushed up, both hands flat on the empty surface, about to begin. Everything else has been moved to one side and out of frame. Warm side light. The emptiness of the desk is the subject.',
    },
  },

  discovery: {
    why: {
      alt: 'A potter’s hands lowering an even bowl onto a bench beside a lopsided earlier one.',
      prompt:
        'A potter lifts a finished bowl away from the wheel with both hands while an earlier, visibly lopsided attempt sits on the bench beside them. Clay-dusted forearms, face soft or out of frame. Warm north light, earth tones. The difference between the two shapes is the subject.',
    },
    forward: {
      alt: 'Two people at a café table, one describing a size in the air, the other amused.',
      prompt:
        'Two people lean toward each other over a café table, one describing a shape in the air with both hands, the other laughing. Coffees pushed to the edge of the table. Golden afternoon light. Two peers working something out, not an expert instructing a novice.',
    },
  },

  understanding: {
    why: {
      alt: 'A chef plating during service, one hand steady, entirely calm.',
      prompt:
        'A chef plates during service, one hand steady with tweezers, entirely calm. Steam, stainless steel and the warm mass of a working kitchen behind it, loosely drawn. Practical kitchen lighting. Competence that has stopped being remarkable to the person doing it.',
    },
    forward: {
      alt: 'A senior colleague swivelled round to face a younger one, listening with hands still.',
      prompt:
        'A senior colleague has turned their chair fully away from their monitors to face a younger colleague who is talking and gesturing. The senior listens with their hands still. Cool office light, screens dark and ignored behind them. The listening is the subject.',
    },
  },

  integration: {
    why: {
      alt: 'An older tradesperson watching an apprentice work, hands in pockets, not intervening.',
      prompt:
        'An older tradesperson stands a step back in a workshop, hands in pockets, watching an apprentice work at the bench and visibly choosing not to intervene. The apprentice is absorbed and in focus; the older figure is slightly behind and softer. Warm overhead work light. The restraint is the subject.',
    },
    forward: {
      alt: 'Two colleagues walking out of a building at dusk, each carrying a coffee.',
      prompt:
        'Two colleagues walk out of a building at the end of the day, mid-conversation, one carrying both coffees. Low sun behind them, long shadows, the street behind them loosely drawn. Easy and companionable.',
    },
  },
};

/**
 * Per-domain images: thirty, one per stage per field, used on the "why" door.
 *
 * What you are losing differs by field, so the picture does too. The first
 * move out of a stage is more alike across fields, so the forward door stays
 * stage-level — `briefFor()` handles that, and `U-V-12` asserts it.
 */
export const DOMAIN_IMAGE_BRIEFS: Partial<
  Record<Stage, Partial<Record<Domain, ImageBrief>>>
> = {
  loss: {
    teaching: {
      alt: 'A lecturer alone at the front of an emptied classroom, looking at the rows of chairs.',
      prompt:
        'A lecturer sits on the front edge of their desk in an emptied classroom at the end of the day, looking out at rows of chairs left slightly out of line. Low late light through high windows, dust in the air, warm and quiet. Considering rather than sad.',
    },
    craft: {
      alt: 'An illustrator sitting back from a clear drawing board at dusk, hands in their lap.',
      prompt:
        'An illustrator sits back from their drawing board in a studio at dusk, hands resting in their lap, the board clear in front of them. The task lamp is off and the only light is cool and blue from a window. The stillness of a workspace that is usually in use.',
    },
    analysis: {
      alt: 'A lawyer standing before a wall of bound volumes, one hand resting on a shelf.',
      prompt:
        'A lawyer stands with their back to the camera before a wall of bound volumes, one hand resting at shoulder height on a shelf, taking nothing down. Warm library light, the spines reduced to colour and texture with nothing readable. Composed and still.',
    },
    building: {
      alt: 'A developer with both hands resting flat and still either side of a keyboard.',
      prompt:
        'A developer sits at a desk with both hands resting flat and motionless either side of a keyboard, monitors entirely out of frame. Seen from low at the side. One warm desk lamp against a cool dark room. The absence of motion is the subject; this is a pause, not a slump.',
    },
    coordination: {
      alt: 'A staff member behind an empty service counter, hands on the counter, looking toward the door.',
      prompt:
        'A staff member stands behind a service counter in a quiet office, both hands resting on the counter top, looking toward a door with nobody coming through it. Warm institutional light, worn surfaces, muted colour. The emptiness in front of them is the subject.',
    },
  },

  doubt: {
    teaching: {
      alt: 'Two faculty disagreeing in a corridor, one with folded arms against the wall.',
      prompt:
        'Two faculty members stand in a departmental corridor mid-disagreement, one leaning against the wall with arms folded, the other turned toward them talking with one hand raised. Doors and boards behind them reduced to shapes. Cool corridor light. Neither is backing down.',
    },
    craft: {
      alt: 'A designer standing arms folded in front of their own pinned-up work.',
      prompt:
        'A designer stands with arms folded in front of a board of their own pinned-up work, looking at the work rather than at whoever is speaking off-frame. The pieces are abstract shape and colour, nothing readable. High studio window light, muted. An unmoved, considered stance.',
    },
    analysis: {
      alt: 'Two advisers across a conference table, one making a point with a single fingertip.',
      prompt:
        'Two advisers sit across a conference table, one pressing a single fingertip to the table surface to make a point, the other listening with their hands still. A glass partition and city light behind. Cool daylight. The gesture is precise rather than angry.',
    },
    building: {
      alt: 'An engineer with folded arms beside a colleague gesturing at a blank wall panel.',
      prompt:
        'An engineer stands with arms folded beside a colleague who is gesturing at a whiteboard, looking at the board rather than at them. Whatever is on the board is loose marks with no letterforms. Cool overhead light, flat palette.',
    },
    coordination: {
      alt: 'A staff member standing slightly apart at the edge of a group, listening and not speaking.',
      prompt:
        'A staff member stands slightly apart at the edge of a group of colleagues in a meeting room, arms loosely folded, listening and not speaking. The others are animated, drawn as loose open outlines. Cool overhead light. Present and not included.',
    },
  },

  discomfort: {
    teaching: {
      alt: 'A lecturer alone at the front of a large empty lecture theatre, small in the frame.',
      prompt:
        'A lecturer stands at the front of a large empty lecture theatre facing the tiered seats, one hand resting on the back of a chair. The room is wide and the figure is small in the frame. Flat institutional light, muted greys and warm wood. The scale is the subject.',
    },
    craft: {
      alt: 'A maker standing still in a studio full of materials, reaching for none of them.',
      prompt:
        'A maker stands in the middle of their studio surrounded by materials and half-finished pieces covering every surface, hands at their sides, reaching for none of them. Warm cluttered light, rich texture. Abundance without a next move.',
    },
    analysis: {
      alt: 'An analyst sitting back at night, hands behind their head, looking at the ceiling.',
      prompt:
        'An analyst sits back in an office chair late at night, hands behind their head, looking up at the ceiling. The desk in front of them is covered with stacked material reduced to shapes and shadow. One desk lamp, deep shadow elsewhere.',
    },
    building: {
      alt: 'An engineer alone in a server aisle, one hand on a rack, looking down the row.',
      prompt:
        'An engineer stands alone in a server aisle with one hand on a rack frame, looking down the length of the row. Hard parallel lines receding, cold blue light with a single warm fixture. The figure is small against the repetition.',
    },
    coordination: {
      alt: 'A staff member caught mid-turn between a ringing phone and someone waiting.',
      prompt:
        'A staff member is caught mid-turn in a corridor between a telephone on a desk behind them and a person waiting ahead of them, body angled toward one and face toward the other. Everything but the figure is drawn as loose open outlines. Cool institutional light.',
    },
  },

  discovery: {
    teaching: {
      alt: 'A teacher crouched at eye level beside a student’s desk, mid-question.',
      prompt:
        'A teacher crouches beside a student at their desk, down at eye level with them, mid-question with one hand open. Other students work on behind them, loosely drawn. Warm window light. The posture is the shift: alongside rather than at the front.',
    },
    craft: {
      alt: 'A potter’s hands setting a second bowl beside the first on the bench.',
      prompt:
        'A potter’s hands set a second bowl down beside a first on the bench, the two clearly the same attempt made twice and the second visibly better. Only hands and work in frame. Warm north light, clay dust, earth tones.',
    },
    analysis: {
      alt: 'Two advisers at a window, turned toward each other, working something out.',
      prompt:
        'Two advisers stand at a tall office window turned slightly toward each other mid-conversation, one with an open hand, both relaxed. The office is soft behind them. Bright overcast daylight, cool and even. Working something out together rather than reporting.',
    },
    building: {
      alt: 'A developer leaning back from the desk with both arms behind their head, mid-breath.',
      prompt:
        'A developer leans back from their desk with both arms raised briefly behind their head, a small unguarded moment of relief, monitors out of frame. Cool room, one warm lamp. Caught mid-breath rather than celebrating.',
    },
    coordination: {
      alt: 'A staff member in unhurried conversation at a counter with an empty queue behind.',
      prompt:
        'A staff member leans on a counter in unhurried conversation with someone whose back is to the camera, giving them full attention, the space behind the visitor empty. Warm light, worn institutional surfaces. Time that has appeared from somewhere.',
    },
  },

  understanding: {
    teaching: {
      alt: 'A lecturer perched on a desk talking with two students who stayed behind.',
      prompt:
        'A lecturer perches on the edge of a desk in an emptying classroom in relaxed conversation with two students who have stayed behind, bags half packed. Chairs askew. Warm late light through high windows. Unforced, ordinary competence.',
    },
    craft: {
      alt: 'A designer sliding one of two mounted boards toward a client and resting a finger on it.',
      prompt:
        'A designer pushes one of two blank mounted boards across a table toward a client and rests a fingertip on it, mid-explanation; both are looking at the work. The boards are abstract shape and colour with nothing readable. Clean daylight, muted palette.',
    },
    analysis: {
      alt: 'An adviser in profile mid-sentence on a call, one hand raised and still.',
      prompt:
        'An adviser sits in profile at a desk, mid-sentence on a call, one hand raised and held still. Composed and unhurried, jacket off. Afternoon light across the desk, warm with long shadow. The calm is the subject.',
    },
    building: {
      alt: 'An engineer alone in a dark room, marking a few loose shapes on a plain panel.',
      prompt:
        'An engineer stands close to a whiteboard mid-draw, marker in hand, the shapes on it left as loose marks with no letterforms. No audience. Cool even light, clean board, plain clothing. Small and practical rather than a grand architecture.',
    },
    coordination: {
      alt: 'Two colleagues side by side at a desk, one explaining with an open hand.',
      prompt:
        'Two colleagues sit side by side at a desk but turned toward each other, one explaining with an open hand while the other nods. The office is soft behind them. Warm overhead light. Comparing rather than reporting.',
    },
  },

  integration: {
    teaching: {
      alt: 'Two academics stopped in a stairwell, one listening closely while the other talks.',
      prompt:
        'Two academics have stopped in a stairwell mid-conversation, one listening with full attention while the other talks, both holding coffees. Institutional concrete and glass, softened. Warm daylight from above. Unhurried, companionable.',
    },
    craft: {
      alt: 'An older maker pointing at one small area of a younger maker’s piece.',
      prompt:
        'An older maker leans in to point at one small area of a piece held between them and a younger maker, who is following the finger. Both standing in a workshop, sleeves rolled. Warm side light, material texture. Attention on a detail, not on the whole.',
    },
    analysis: {
      alt: 'A senior adviser turned toward a junior at the end of a long table, pointing between them.',
      prompt:
        'A senior adviser sits beside a junior at the end of a long table, turned fully toward them and pointing at something between them that is out of frame. Both are leaning in. Cool daylight, warm wood, glass partition behind. Handing something over.',
    },
    building: {
      alt: 'A senior engineer holding a marker out toward a junior in a dark plant room.',
      prompt:
        'At a whiteboard, a senior developer holds the marker out toward a junior rather than using it, both standing, the junior reaching to take it. The board behind them is blank or loose marks. Cool office light. The handover is the subject.',
    },
    coordination: {
      alt: 'A staff member walking a corridor alongside a manager who is turned toward them, listening.',
      prompt:
        'A staff member walks a corridor alongside a manager, mid-sentence, the manager turned toward them and listening rather than talking. Low warm light through a window at the end of the corridor. Someone being listened to.',
    },
  },
};

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
