# Krea2 catalog — per-image review (pass 1, plus pass 2 fixes)

Generated 2026-11-01. 42/42 produced, no failures. Reference:
`tools/comfy/style-refs/house_style.png`, LoRA 0.75, 8 steps, cfg 1, 896x1120.
Seeds derived from each id, recorded in the sidecar JSON beside each PNG.

Most frames came out on a **black ground**, which the earlier five-domain test
did not — the briefs' own "dusk / dark room / deep shadow" wording plus the
reference produced it. That resolves the dark-mode question in our favour.

## Rule breaks (9) — REGENERATED AND FIXED in pass 2

| id | problem |
|---|---|
| `discomfort_why` | photographic, not illustration; subject looks straight at camera |
| `discomfort_coordination` | photo motion-blur hybrid; drawn figure on photographed corridor |
| `doubt_coordination` | photo/drawing hybrid; shows two people confronting, brief wants one person at the edge of a group |
| `doubt_building` | whiteboard covered in pseudo-handwriting — text |
| `loss_building` | monitors dominate the frame and hands are typing; brief says monitors out of frame, hands motionless |
| `understanding_forward` | the second person is missing entirely; screens dominate |
| `understanding_craft` | photograph; the client is missing, only one board |
| `understanding_building` | photograph, not illustration |
| `integration_building` | photograph with drawn hands |

**Diagnosis.** Seven of these nine briefs contain camera language — "long-exposure
feel", "motion blur", "shallow depth of field", "shot low from the side". That
wording overrides the style reference and pulls the render back to photography.
Stripping camera words from the prompt (not from the briefs file) should fix them.
The other two are prop problems: a whiteboard and a monitor, which summon writing
and screens whatever else the prompt says.

## Content misses — good images, wrong content (7)

| id | problem |
|---|---|
| `loss_analysis` | he is pulling a volume off the shelf; brief says taking nothing down |
| `loss_craft` | the drawing board carries finished artwork; brief says the board is clear |
| `discovery_why` | the two bowls don't read as the same attempt made twice |
| `discovery_forward` | reads as a date rather than two peers; broad smiles |
| `understanding_why` | the chef looks stern; brief says entirely calm |
| `understanding_analysis` | no call happening; reads as a man leaning on a desk |
| `integration_forward` | three cups between two people; reads as a couple, photographic-leaning |

## Watch at display size — faint pseudo-writing on props (5)

`discovery_teaching` (worksheets), `understanding_teaching` (paper),
`understanding_coordination` (notebook), `doubt_analysis` (papers),
`discomfort_building` (small door sign). None is legible at a glance; all are
line-marks rather than letterforms. Judge them in the real frame.

## Strong as they stand (21)

`loss_why`, `loss_forward`, `loss_teaching`, `loss_coordination`,
`doubt_why`, `doubt_forward`, `doubt_teaching`, `doubt_craft`,
`discomfort_forward`, `discomfort_teaching`, `discomfort_craft`,
`discomfort_analysis`, `discomfort_building`,
`discovery_analysis`, `discovery_craft`, `discovery_coordination`,
`discovery_building`, `understanding_teaching`,
`integration_why`, `integration_craft`, `integration_analysis`,
`integration_coordination`.

Pick of the set: `loss_why`, `integration_why`, `discomfort_craft`,
`doubt_teaching`, `loss_coordination`.

## Still unresolved

- The whole set reads mid-century — clothing, hair, furniture. Consistent and
  handsome, but it is a framing choice for a piece about AI adoption now.
- Nothing has been looked at in the real placeholder frame, in either theme.
- `PROMPT_RULES` still specifies documentary photography. The job builder drops
  that sentence; the file has not been changed.


## Pass 2 — the nine, regenerated

All nine came back as drawings; no photographs remain in the set. Two changes
to the prompts did it:

  - every camera word removed (motion blur, long-exposure, shallow depth of
    field, out of focus, shot from). Softness is now described as drawing:
    "drawn as loose open outlines while the still figure is fully drawn".
    That phrasing fixed all seven photographic frames.
  - whiteboards and monitors replaced with "a large plain empty panel" and a
    crop to the desk surface, rather than being forbidden.

Style lead strengthened to "Hand-drawn line art, chalk and ink on black paper."

`discomfort_why` is now one of the strongest frames in the catalog: the still
figure solid black, the passing colleagues reduced to open outline.
`understanding_forward` finally has both people in it.

Remaining imperfection: ground colour varies. Five of the nine came back on
black, but `doubt_coordination` is on grey, `understanding_craft` on cream and
`integration_building` on light grey. Against a near-black page those four will
read brighter than their neighbours. Worth a reroll if the set is to be uniform.

Final 42 (33 from pass 1 + 9 fixes) assembled in the session scratchpad under
`final/`, each PNG beside its JSON record of seed and settings.

## Pass 3 — ground uniformity

Rerolled `doubt_coordination`, `understanding_craft`, `integration_building` and
`understanding_building` with the ground stated in the prompt rather than left
to the reference: "The background is deep solid black and the room falls away
into unlit darkness beyond the lit figures", plus a named light source (one
overhead lamp) so the darkness has a reason. Seeds offset by one from the
catalog seeds, so these are fresh rolls.

All four came back on black and now sit with the rest of the set.
`doubt_coordination` is much improved — the single figure apart, the group of
four under the lamp, the gap of dark floor between them carrying the meaning.

**The whole 42 is now uniform: chalk and ink on black, no photographs, no
legible text found at review size.**

Final set: `final/` in the session scratchpad, 42 PNGs each beside its JSON
record. 63 MB total, which is why it has not been committed — where these
belong in the repo (or whether they are resized first) is still open.

## What is still outstanding

1. Seven content misses from pass 1, listed above — good images of the wrong
   thing. None breaks a house rule; they diverge from their brief.
2. The set reads mid-century throughout.
3. Nothing has been seen in the real placeholder frame, in either theme.
4. `PROMPT_RULES` in `imageBriefs.ts` still specifies documentary photography,
   and several individual briefs still carry camera language. The job builder
   works around both; the file is unchanged. If the illustration direction is
   now settled, that file is where it should be recorded — and `validate.test.ts`
   U-V-13/U-V-14 are the constraints to respect when editing it.

## Pass 4 — the seven content misses

Each brief's point restated as something present in the frame rather than as an
absence. Results:

**Fixed (5)**
- `loss_analysis` — open palm flat on the shelf edge, every volume in place.
- `discovery_forward` — reads as two colleagues now, hands apart, each to their
  own side of the table. No longer a date.
- `understanding_why` — the chef's face is calm and absorbed.
- `understanding_analysis` — handset to the ear, other hand raised and still.
  Sparse and strong.
- `discovery_why` — took three attempts. Attempt two gave exactly two bowls but
  removed the person, breaking the house rule that every frame has someone in
  it; attempt three has the potter's hands and body in frame, two bowls only,
  and the uneven rim legible.

**Partial (2)**
- `loss_craft` — the board is blank now, which was the real miss, but the task
  lamp is lit where the brief says it is off.
- `integration_forward` — collegial rather than romantic now, but each person
  carries one cup instead of one carrying both.

**What the model will not do reliably:** exact counts ("exactly two bowls") and
on/off states ("the lamp dark and unlit"). Both failed here and both had to be
forced through composition instead — describing what the frame contains and
where the light comes from, rather than naming the number or the switch.

Final set updated: all 42 in `final/`, now including these seven.

## Pass 5 — the faint-mark checks, judged at display size

Checked at 420px wide, the widest the frame gets (the two-column panel is
narrower). All five pass: the marks are line texture, not letterforms.

- `discovery_teaching` — the worksheets read as ruled boxes and a diagram.
- `understanding_teaching` — the paper is blank.
- `understanding_coordination` — the notebook is faint ruling only.
- `doubt_analysis` — the papers are blank with a faint grid.
- `discomfort_building` — the one judgement call: a small sign-shaped plate on
  the far door carries two dark marks. Nothing legible at any size the app
  shows, but it is sign-shaped, so flag it if "no signage" is read strictly.

**No legible text anywhere in the 42 at display size.**

## Corrections to what is still open

Passes 2, 3 and 4 cleared the nine rule breaks and the seven content misses.
What actually remains:

- `loss_craft` — board blank (the real miss, fixed) but the task lamp is lit
  where the brief says it is off.
- `integration_forward` — collegial now, but each person carries one cup
  rather than one carrying both.
- The set reads mid-century throughout. Unresolved by choice, not by accident.
- `PROMPT_RULES` still specifies documentary photography. The job builder drops
  that sentence and substitutes the line-art lead; the briefs file has not been
  changed to match the direction that was actually chosen.

The sheet-music-with-notation frame was a scene I invented while choosing the
style (a composer at a piano), not one of the 42. None of the six craft briefs
involves a piano, and no shipped craft frame carries notation.

## How to reproduce the set

`catalog-jobs.json` beside this file is the exact record: all 42 jobs with the
full prompt as sent, the seed, the reference and the LoRA strength. Regenerating
is

```
python tools/comfy/krea2.py --jobs tools/comfy/catalog-jobs.json --out out/catalog
```

Twenty-six of the 42 are the brief's own text with a lead and tail added.
**Sixteen are not**: their scene text was rewritten during passes 2 to 4. Each
job records which it is under `source`. Nine of those sixteen changed what the
frame shows and have since been folded back into `imageBriefs.ts`, so the brief
and the picture agree there. The other seven differ only in plumbing — the black
ground, how an indistinct thing is drawn, emphasis repeated — and some of that
wording is banned from the briefs by `U-V-15`. So this file, not the briefs,
remains the record of what was sent.

The three leads used, verbatim, in the order they were introduced:

1. pass 1, the 26 brief-sourced frames —
   `Hand-drawn line art. `
2. pass 2, five frames —
   `Hand-drawn line art, chalk and ink on black paper. `
3. passes 3 and 4, eleven frames —
   `Hand-drawn line art, chalk and ink on black paper. The background is deep solid black and the room falls away into unlit darkness beyond the lit figures. `

The third is the one to keep: it is what produced the black grounds the set is
now uniform on.

The tail is `PROMPT_RULES` with its camera sentence ("Documentary photograph,
natural light, muted palette, shallow depth of field.") removed and the rest
kept word for word. Passes 2 to 4 also prefix the tail with
`Plain blank walls, bare unmarked surfaces throughout.`
