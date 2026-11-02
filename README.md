# Technological Grief

**[Open the app](https://markgill47-lab.github.io/technological-grief/)**

Six questions, then a dial showing where you are in the change cycle relative to AI adoption in your field, and what that stage usually costs people doing your kind of work.

It is a reflection tool, not an assessment. Nothing you enter leaves your browser.

---

## What it does

You answer six questions. The app places you at one of six stations: **Loss**, **Doubt**, **Discomfort**, **Discovery**, **Understanding**, **Integration**. Then it reads that station back to you through four layers of content, assembled for your answers:

- **The stage itself.** What this station is, why you are at it, and the one move out of it. Invariant: it does not change with anything else you said.
- **Your field.** The same stage in teaching, craft, analysis, building, or coordination and care. This is where the content gets specific, because what Discomfort costs an illustrator is not what it costs a lecturer.
- **What you said you were worried about.** Seven threats, from skills going obsolete to the ethical objection, each answered on its own terms.
- **Your pace.** Where you sit on the adoption curve against where your field sits, which is a different number and sometimes the opposite sign.

Six stages, five fields, seven threats and five positions give 1,050 assemblies out of 49 authored blocks. A build rule walks all 1,050 and fails if any of them comes out with a hole in it.

There is a second marker on the dial for your field, and the distance between the two markers is the **Grief Gap**. Read the caveat on that below.

## What it does not do

- **It makes no network requests.** None. Not analytics, not a model call, not a font: the two typefaces are asked for by name and fall back to what you already have. Your answers are held in `sessionStorage` so that a reload does not lose your reading, and `sessionStorage` dies with the tab. The one thing that outlives it is your light or dark preference, in `localStorage`, under a key that holds nothing else. A build check fails if an API key pattern ever appears in the bundle, because an earlier design of this thing shipped one.
- **It does not tell you to adopt anything.** Staying where you are is a legitimate outcome, and a considered refusal on ethical grounds is treated as a position rather than as a stage to be moved through.
- **It does not diagnose you.** No clinical vocabulary appears anywhere in the content, and that is enforced by a test rather than left to good intentions.

## How honest is the model

This is in the app too, under Sources, above the citations rather than below them.

The six stages are a practitioner model, not a validated instrument. Their order is a convention rather than a finding: the one direct empirical test of stage theory found the predicted first stage was not first, which is why the app treats the stages as a vocabulary of states rather than a sequence you pass through. The Grief Gap is our own hypothesis and has never been tested. The field-maturity numbers behind the second marker are editorial judgments, not measurements.

What is best supported is the descriptive part: that resistance is usually a rational response to a real loss, that this lands as a question about professional identity, and the adoption figures that put each field where it sits.

All thirty of the field-specific blocks carry `domainVerified: false`. They make specific claims about what it is like to work in five professions and no practitioner in those professions has signed them off yet. A test names every unverified block on each run, so the flag cannot quietly become decoration.

## Running it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

`npm test` is the interesting one. Alongside the usual unit tests it runs the content rules: every stage has its five field lenses or none of them, no block drifts out of its word bounds, no clinical word gets in, no first experiment is offered at Loss or Doubt (the framework is explicit that offering a tool there is the mistake), every image brief names a person and asks for no text, and nothing in the reader-facing content carries an em-dash. That last one exists because the writing is held to a voice guide, and three of its rules are mechanical.

## Layout of the repo

| Path | What is in it |
|---|---|
| `src/content/` | The 49 authored blocks, the assembler, and the rules that fail the build |
| `src/diagnostic/` | The six questions and the scoring |
| `src/dial/` | The dial geometry and its text-only equivalent |
| `src/images/stages/` | The 42 drawings, one per stage and field |
| `specs/` | The design record: what was decided, what it cost, and what is still open |
| `tools/comfy/` | The image pipeline, including all 42 jobs exactly as sent |

`specs/README.md` is the honest version of the project history. It includes the decisions that went badly and the contradictions that are still unresolved.

## The drawings

Forty-two of them, hand-drawn line art in chalk and ink on black paper, generated locally through ComfyUI and reviewed frame by frame. No text appears in any of them, which is a content rule rather than an aesthetic one: generated lettering is always subtly wrong, it dates the image, it cannot be translated, and a screen reader gets nothing from it. Each image ships with `alt=""` and a visible caption instead, so the sentence reaches everyone once.

`tools/comfy/catalog-jobs.json` holds every prompt as it was actually sent, with its seed and style reference, so any frame can be reproduced or re-rolled.

## Accessibility

Keyboard reachable throughout, every control at 44px, visible focus rings, and a text view of the dial for anyone who would rather read the whole path as a table. The dial's colour ramp never carries meaning on its own, because two of the stage colours do not clear contrast as type.

## Reuse

No license file yet, so default copyright applies. If you want to use any of this, ask.

---

Built with React, TypeScript, Vite and Zustand. Deployed from `main` by GitHub Actions.
