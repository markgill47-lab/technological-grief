# UI Specification: Technological Grief Interactive

**Version**: 2.4
**Last updated**: 2026-11-01

---

## 1. What changed from v1

v1 specified a closed six-segment clockwise wheel, 600×600px, in a 55/45 two-panel split on a fixed 1920×1080 canvas. Each wedge carried the stage name in an outer ring and three stacked attributes in a middle ring.

v2 replaces it with a **terrain cross-section**: a wide, short side-elevation path with six stations. The reasons, in order of weight:

1. **A closed circle asserts endless cycling.** The framework describes a progression with one specific regression path and a genuine endpoint. The geometry was arguing against the content.
2. **The wheel could not show the Grief Gap.** That construct is the framework's most original claim, and a single-position indicator cannot express a distance between two positions. See [README.md](README.md) D-5.
3. **The wheel could not show direction of travel or the regression path.** Both are load-bearing claims.
4. **Three stacked attributes per wedge is illegible.** At v1's own stated mobile size of 360px, each segment is roughly 180px of arc carrying four text elements at varying rotations. v2 moves the emotion/cognition/behavior triad out of the graphic entirely and into the content panel, where it reads as a table.
5. **A pie of rotated text is a poor screen-reader target.** A path with ordered stations has an obvious linear equivalent.

The terrain shipped and then went, in turn. The current graphic is the **open dial** described below: a ring that answers all five of those objections without giving up the radial shape v1 was right to want. See [README.md](README.md) D-10, and §2 for what was traded away with the elevation.

---

## 2. The metaphor

**An open dial.**

Six bands around a ring that deliberately does not close. The path begins at Loss at the lower left, tightens to a sliver at Discomfort, and opens out through Discovery and Understanding to Integration at the lower right. The blank wedge at the bottom is the point of the shape.

This keeps what the terrain was carrying while getting back the thing v1 was right about — that a radial arrangement is a more engaging object than a landscape. Four claims fall out of the geometry rather than being imposed on it:

- **The ring does not close.** v1's wheel asserted endless cycling by closing; the framework describes a progression with one regression path and a genuine endpoint. The opening is where the claim lives: there is a first stage and a last one.
- **Band width is available options.** Discomfort is 20° against Integration's 74°. The Danger Zone needs no red overlay and no legend — it is visibly the narrowest place to stand, and the far side is visibly open ground.
- **The climb is shorter than the descent.** Two bands and 88° before the narrow point, three bands and 194° after it. The early stages arrive faster than they can be processed; the later ones take the time they take.
- **The hole is a readout.** A ring has a centre, and horizontal text at a legible size fits in it. This is where v1 went wrong: it spent that space on a gear icon and pushed three rotated attributes per wedge out onto the arcs, which is the worst available shape for text. The attributes live in the panel beside it, as three cards.

What the terrain had and this does not: a literal up and down. Elevation said "hard" more immediately than width says "few options". That is the trade, and the Danger Zone's 20° sliver carries enough of it.

---

## 3. Layout

Two columns: the dial on the left, the stage on the right. The dial is the fixed point of the interface — it is what the reader orients by — so it is a sticky column that stays put while the panel changes under it, not a banner that scrolls away.

```
┌───────────────────────────┬─────────────────────────────────┐
│                           │  Discomfort                     │
│        ___________        │  Stage 3 of 6 · the Danger Zone  │
│       /   D I A L   \     │  ← Doubt        Discovery →     │
│       \             /     │                                 │
│         ‾‾‾‾‾‾‾‾‾‾‾       │  Description                    │
│                           │                                 │
│   [Find your station]     │  WHAT YOU MIGHT BE FEELING      │
│   Start fresh  🔒 Ephemeral│  ┌──────┬──────┬──────┐        │
│                           │  │Feel  │Think │Behave│        │
│      (sticky, 44%)        │  └──────┴──────┴──────┘        │
│                           │                                 │
│                           │  ┌─────────────┬─────────────┐ │
│                           │  │ Why this    │ What to do  │ │
│                           │  │ happens   › │ about it  › │ │
│                           │  └─────────────┴─────────────┘ │
└───────────────────────────┴─────────────────────────────────┘
```

| Breakpoint | Dial | Panel |
|---|---|---|
| ≥1100px | Sticky left column, 44% (min 420px), max-height 460px | Right column, capped at 72ch, 48px gutters |
| <1100px | Full width on top, static, max-height 420px | Below, centred, capped at 72ch, 32px gutters |
| <768px | Full width, max-height 360px | Full width, 16px gutters |

Content is capped at 72ch regardless of viewport. A full-width prose column on a 1920px display is unreadable, and the whole point of this content is that someone reads it.

> **Corrected during implementation.** v2.0 put the graphic in a full-bleed banner with everything beneath it, which was right for a wide, short terrain and wrong for a ring: a dial stretched edge to edge is just a very large dial, and the stage text below it started a scroll that never came back to the graphic. The two-column layout also removed the reason the dial had a maximum height at desktop in the first place — it now has a column of its own to fill.

---

## 4. Dial geometry

### 4.1 Coordinate system

`viewBox="0 0 660 520"`, `preserveAspectRatio="xMidYMid meet"`. Centre at `(330, 258)`. Angles are **degrees clockwise from twelve o'clock**, so 0 is straight up and negative is anticlockwise.

Radii, outermost first:

| Name | Value | What sits there |
|---|---|---|
| `R_LABEL` | 212 | Stage names, outside the ring |
| `R_OUTER` | 196 | Band outer edge |
| `R_MID` | 167 | Station numbers |
| `R_INNER` | 138 | Band inner edge; the hole starts here |
| `R_RETREAT` | 130 | The retreat arc, hugging the band it leaves |
| `R_MARKER` | 114 | You, and your field |
| `R_GAP` | 102 | The gap sweep between them |

Everything inside `R_GAP` belongs to the readout.

> **Inverted from the terrain.** That graphic asserted `VIEW_W / VIEW_H > 3` in `geometry.test.ts`, because a wide, short coordinate space against a wide, short banner is what stops `meet` letterboxing away a third of the width. A dial needs the opposite, and the test now asserts the aspect stays between 0.9 and 1.6. The height below the ring is not slack: the field annotation sits there, inside the opening, where no band can reach.

### 4.2 Bands

Angular span encodes available options. Spans are the source of truth; every path, label, number, hit area and marker angle is derived from them.

| Stage | `position` | Span | a1 | a2 | Centre | Label anchor |
|---|---|---|---|---|---|---|
| `loss` | 1 | 44° | −128 | −84 | −106 | end |
| `doubt` | 2 | 34° | −81 | −47 | −64 | end |
| `discomfort` | 3 | **20°** | −44 | −24 | −34 | end |
| `discovery` | 4 | 46° | −21 | 25 | 2 | middle |
| `understanding` | 5 | 64° | 28 | 92 | 60 | start |
| `integration` | 6 | 74° | 95 | 169 | 132 | start |

`START_ANGLE = -128`, `SECTOR_GAP = 3°` between neighbours. Total sweep **297°**, leaving a **63° opening** centred at 200.5° — just left of six o'clock, because the path is not symmetric and pretending otherwise would be a lie about the content.

Label anchors are computed from `sin(centre)`, not authored: past ±0.25 the label is anchored to the side it is on, and within that it is centred.

> **Corrected during implementation.** The first spans were 60/52/20/44/50/56, chosen so that Discomfort sat at twelve o'clock. That put Loss (60°) wider than Integration (56°) and broke the encoding the shape is built on — if width is options, Loss cannot offer more of them than Integration. `U-D-04` caught it. Centring the narrow band at the top and ordering the widths correctly are mutually exclusive here; the ordering is load-bearing and the clock position is not, so Discomfort sits at −34° and the summit reading is gone. The 20° sliver still reads as the pinch.

### 4.3 Path construction

Each band is an annulus sector: an arc along `R_OUTER` from `a1` to `a2`, a line in to `R_INNER`, an arc back, closed. No `d` attribute is hand-authored — change a span and the band, its label, its number, its hit path and both arcs follow.

Each band also carries an invisible **hit path**, padded 16 units past both radii and half a gap past both edges. The drawn Danger Zone band is a 20° sliver; its hit area is 90 units radially and 49 along the inner arc, which clears 44px at every breakpoint. `U-D-12` asserts it.

### 4.4 The retreat

From Discomfort back to Doubt, drawn **inside the ring** at `R_RETREAT`, anticlockwise, dashed, with the arrowhead at the Doubt end.

- `stroke-dasharray="7 6"`, `stroke-width="2.5"`, `stroke="var(--regress)"`
- Generated by `arcPath(R_RETREAT, angleAtPosition(3), angleAtPosition(2))`
- Sweep flag 0 — the direction *is* the claim, and `U-D-09` asserts it
- Legend text sits in the opening: `dashed arc: the retreat to Doubt`

> **Corrected during implementation.** First drawn at `R_RETREAT = 86`, where it floated in the middle of the hole, read as a scratch near the centre, and connected nothing to nothing. At 130 it hugs the inner edge of the two bands it runs between, which is the whole of its job. The markers and the gap sweep moved inward to 114 and 102 to make room.

This is the only element in the graphic that exists purely to make a theoretical claim visible. It earns its place: "most people cycle between Doubt and Discomfort several times before moving forward" is a central assertion of the framework, and v1's closed wheel had no way to show it.

### 4.5 Fractional positions

Field positions are fractional (`teaching: 3.1`, `craft: 4.2`), so markers must sit between stations.

`angleAtPosition` interpolates linearly between band centres and clamps to `[1, 6]`:

```typescript
function angleAtPosition(position: number): number {
  const p = clamp(position, 1, 6);
  const low = Math.floor(p);
  const high = Math.ceil(p);
  const a = SECTORS[low - 1].center;
  const b = SECTORS[high - 1].center;
  return a + (b - a) * (p - low);
}
```

Exact arithmetic, no DOM, no `getPointAtLength`, no mount-time measurement — which is what makes `U-D-05` runnable in jsdom at all. Position is not an arc-length measure; it is "which station, and how far between", and that is exactly what the interpolation parameter is.

Because spans differ, equal position distances are **not** equal angular distances: a gap of 1.0 stage from Doubt to Discomfort is 30°, while the same 1.0 from Understanding to Integration is 72°. The gap sweep is therefore a direction and a span to compare against the bands it crosses, not a protractor reading. The number is always written out next to it.

---
## 5. Markers

Both markers sit inside the ring at `R_MARKER` (114), each on the angle of its position.

### 5.1 You

- Filled circle, r=9, fill = current stage color, 2.5px ring in `--accent`, plus a 1px dark inner ring so it holds against the lighter bands
- No "You" label. The hole names the stage directly beneath the marker, and a second label 100 units from the first would compete with it for the same glance.
- Drawn **only when there is a reading behind it** (`confidence !== null`)

> **Corrected during implementation.** The terrain drew the "You" marker for whatever stage was selected, which said *you are here* about a stage someone had merely clicked in order to read about it. On the dial the selected band already carries a keyline and the hole already names it, so the marker now waits for a Locate result and means what it says.

### 5.2 Your field

- Hollow diamond, 16 units across, 2.5px stroke in `--field`, filled with `--bg` so the gap sweep does not run visibly through it
- Named in the opening below the dial rather than beside the marker: `Craft & Composition — your field is 1.2 stages ahead`. Inside the hole there is no room for a second 19-unit label that does not collide with the readout.
- Suppressed entirely when `|gap| < 0.25`, where the two markers would overlap illegibly. The gap sentence in the result still states the alignment; the graphic just does not draw two shapes on top of each other.

### 5.3 The gap sweep

Drawn only when `|gap| ≥ 0.25`.

- An arc at `R_GAP` (102) from the user's angle to the field's angle, 4px wide, arrowhead at the field end
- `--field` when the field is ahead; `--accent` when the user is ahead — the negative case is a different condition, not a lesser amount of the same one ([grief-framework-context.md](grief-framework-context.md) §5.2), and it must not read as a deficit
- **The sweep direction carries the sign.** Clockwise means the field is ahead, anticlockwise means the user is. `U-D-10` asserts both.
- The field it measures against is the one being **read**, not necessarily the one answered: the panel's selector changes it, and the annotation under the dial always names the field it is talking about.
- The magnitude is always written out next to it, because spans are unequal: 1.0 stage from Doubt to Discomfort is 30°, and 1.0 from Understanding to Integration is 72° (§4.5). The arc shows direction and relative distance; the words carry the number.

### 5.4 Uncertainty wedge

Diagnostic confidence is rendered as angular extent, not as a hard point.

| `stageConfidence` | Half-width |
|---|---|
| `high` | ±0.15 stations |
| `moderate` | ±0.35 stations |
| `low` | ±0.60 stations |

A wedge over the ring from `angleAtPosition(p − half)` to `angleAtPosition(p + half)`, extending 14 units past both band radii, in `--accent` at 22% opacity.

When `transitionToward` is set, the wedge is biased a quarter of its half-width toward the named stage. This is how "transitioning from Doubt to Discomfort" is drawn, and it is better than either picking one station or drawing two markers.

---

## 6. Color

The app is in the **NextEd design system** ([README.md](README.md) D-12). Tokens live in [tokens.css](../src/styles/tokens.css), mirrored in [palette.ts](../src/theme/palette.ts) so the contrast rules can be asserted; `palette.test.ts` fails if the two drift.

Two themes, light by default. Dark comes from `prefers-color-scheme` until the reader uses the toggle, after which their choice wins (§7.4).

```css
:root {                         /* light */
  --brand:          #cd1041;    /* Spirit Red — primary buttons, the 4px card rule */
  --brand-hover:    #a70d34;
  --brand-text:     #cd1041;    /* red as text: 16px and up only */
  --granite:        #000000;

  --surface:        #ffffff;
  --surface-subtle: #f7f8f9;    /* the dial column */
  --surface-raised: #ffffff;    /* cards, tiles, fields */
  --surface-sunken: #f4f5f6;
  --surface-inverse:#101010;    /* the masthead, in both themes */

  --ink:            #101010;
  --ink-body:       #2a2e31;
  --ink-muted:      #6b757c;    /* 4.4:1 on surface-subtle — see §6.2 */
  --on-brand:       #ffffff;

  --border:         #e4e7e9;
  --border-strong:  #6b757c;    /* band keylines, field marker */

  --link:           #0563f7;    /* Gateway Blue: forward motion only */
  --link-strong:    #0a47b8;
  --link-on-dark:   #4d8bff;
  --wash:           #e8f0fe;    /* selected rows, info fills. Never a red tint. */
  --focus:          #0563f7;

  --warning-text:   #8a4a05;    /* the Danger Zone, in words */
  --warning-wash:   #fff4e8;
}
```

Dark swaps the surfaces and inks for the system's dark values and takes Spirit Red Light (`#ff4d70`) and Gateway Light for anything carrying meaning. The dark values appear in two rule blocks — one under `prefers-color-scheme`, one under `[data-theme='dark']` — and `U-N-02` asserts the two never drift.

### 6.1 The stage ramp

v1's red → amber → teal ramp is gone. NextEd reserves red for the institution and for errors, Bold Orange for warnings, and blue for forward motion, so the six stages are rebuilt from design system tokens:

| Stage | Token | Light | Dark |
|---|---|---|---|
| 1 Loss | Steel → Border Strong | `#3f464b` | `#6b757c` |
| 2 Doubt | Border Strong → Silver Gray | `#6b757c` | `#a6b0b7` |
| 3 Discomfort | **Bold Orange** | `#f58220` | `#f58220` |
| 4 Discovery | Glacier Blue | `#718c9a` | `#718c9a` |
| 5 Understanding | Gateway Blue | `#0563f7` | `#4d8bff` |
| 6 Integration | Gateway Deep | `#0a47b8` | `#9ec0ff` |

Each stage is **one token**, and the token carries its own light and dark value — so this is one ramp rendered twice, not two palettes to keep in step. The Danger Zone being the system's warning colour is the one place where the brand's own semantics and the framework's agree exactly.

Dark takes the lighter value of each token because the darker ones vanish: Steel is 1.9:1 and Gateway Deep 2.2:1 against the dark surface (`U-N-05b`).

**Known limitation.** In light the ramp also reads in greyscale and peaks at stage 3 (`U-N-06`). In dark it does not: Discovery and Understanding sit within 0.03 relative luminance of each other and are told apart by hue, by their numbers, and by their labels. Colour is never the only carrier, so this is a loss of elegance rather than of information.

### 6.2 Colour is a fill, never type

The ramp does not become text anywhere. Bold Orange is **2.59:1** on white and Glacier Blue 3.5:1 — neither clears AA, and the design system says so outright. So:

- Stage colour appears as band fills, as a 22px swatch beside the stage name, and as the 4px top rule on the intro cards.
- Headings and values are `--ink`; the Danger Zone flag is `--warning-text`.
- Station numbers sit **on** their band and take `--stage-<id>-ink`, chosen per band by luminance (threshold 0.21, because Border Strong at 0.18 needs white and Glacier at 0.25 needs ink). `U-N-04` asserts every one clears 4.5:1.

### 6.3 Contrast

AA, asserted two ways. `palette.test.ts` checks the token pairs the app actually uses (`U-N-07`), the focus ring against every surface it can land on (`U-N-08`), and the band inks (`U-N-04`). The rendered page was then walked in both themes, measuring every text node's computed colour against its real background — which is how four failures were found that the token-level tests could not see: the skip link's leftover v1 colour, the Danger Zone flag in Bold Orange, the triad values in Bold Orange, and `--ink-muted` at 14px on `--surface-subtle`, which is the 4.4:1 case the design system warns about. Muted ink at 14px now takes `--ink-body`.

Band fills are exempt from 3:1 against the surface because every band carries a `--border-strong` keyline, which passes in both themes (`U-N-05`).

---
## 7. Interaction

### 7.1 Explore mode

| Element | Behavior |
|---|---|
| Band | The band **is** the control. Click or Enter selects that stage. |
| Stage label | Part of the same group as its band; one control, not two. |
| Hit area | An invisible path padded 16 units past both radii and half a gap past both edges, so even the 20° Danger Zone band clears 44×44px (§4.3). |
| Hover | The band holds full opacity while the others drop to 62%; the label brightens from `--text-dim` to `--text`. Nothing moves — a ring that grows on hover makes the whole composition twitch. |
| Keyboard | The six bands are a single roving-tabindex group. `←`/`→` move between them, `Home`/`End` jump to Loss/Integration, `Enter`/`Space` select. One tab stop for the whole graphic. |
| Selected | 2px `--text` keyline on the band, label at 700 weight, and the hole names the stage. |

Selecting a band updates the panel and the URL hash (`#/explore/discomfort`), so stages are linkable and the back button works.

### 7.2 Locate mode

The dial is **not interactive** during a locate. Bands lose their tab stops and pointer cursors.

On a result, the reveal sequence:

| t | Event |
|---|---|
| 0ms | Sweep stops |
| 0–400ms | Uncertainty wedge fades in over the band at the result position (ease-out) |
| 300–700ms | "You" marker scales from 0 to r=9 with a slight overshoot (`cubic-bezier(0.34, 1.56, 0.64, 1)`) |
| 700–1000ms | Readout resolves in the hole: kicker, stage name, position |
| 900–1300ms | Field marker fades in |
| 1100–1500ms | Gap sweep draws from the user marker toward the field marker |
| 1500ms | Panel and result fade in |

The order matters: the user sees themselves placed, then the stage named, then — last — the comparison to their field. Leading with the gap would make the tool's first statement a judgment about how far behind they are.

The marker scale needs `transform-box: fill-box` and `transform-origin: center`; without them an SVG circle scales about the viewBox origin, which is half a dial away, and the marker flies in from the corner.

### 7.3 The Danger Zone

The Danger Zone is the narrowest band whether or not anyone is standing in it — that is structural, and it is labelled `danger zone` outside the ring at all times above 768px.

When the **diagnosed** stage is `discomfort`, the band additionally gets a `--discomfort` wedge behind it, 12 units proud of both radii, pulsing between 26% and 40% over 2.4s. The glow says "and you are in it", which is the only part that is about the reader.

No warning icon. v1 specified an orbiting ⚠️; that is alarming in a context where the framework's entire position is that this stage is normal, common, and not a failure. The glow marks the place without editorializing.

Under `prefers-reduced-motion`, the glow renders static at 30%.

### 7.4 The theme toggle

Top right of the masthead, a 44px control that says which theme it will switch to and shows a sun or a moon with it — a two-state control that is only an icon is a guess about what it does. `aria-pressed` carries the state.

Light is the default. Before the toggle is used the app follows `prefers-color-scheme` and keeps following it, including a change made while the page is open. Once the reader chooses, the choice wins and is kept in `localStorage` under `grief.theme`: one word, in a key that holds nothing else. That is the only thing the app keeps across tabs, and it is a display preference rather than session content — no answer, stage or gap goes near it, and the session still dies with the tab. The privacy line says "nothing you enter", and a theme is not something you enter.

An inline script in `index.html` settles the attribute before first paint, so a reader who chose dark does not get a white flash on load. It duplicates the key name and the fallback from [useTheme.ts](../src/theme/useTheme.ts), which owns the behaviour from mount onwards.

---
## 8. The panel and the two modals

The assembled page is between two and eight sections of real prose ([content-architecture.md](content-architecture.md) §4.6). All of it is worth reading and none of it is worth reading first. The panel holds what describes the stage; the two modals hold what explains it and what asks something of you.

The split is made in [panels.ts](../src/content/panels.ts), not in the component, and `U-P-01` asserts that every section of the page lands in exactly one group. "Moved behind a button" and "lost" look identical from the outside, so the grouping is tested rather than trusted.

### 8.1 The panel

| Element | Treatment |
|---|---|
| Stage header | Name 40px / 600 in stage color; "Stage 3 of 6" 14px `--text-faint`; the Danger Zone flag in `--discomfort` |
| Breadcrumb | `← Doubt` / `Discovery →`, 15px `--accent`. **Does not wrap** at the ends — Integration has no "next". v1 specified wrapping, which asserts a cycle the framework denies. |
| Description | The stage core's opening section (`kind: 'overview'`). 18px / 1.65, max 72ch. |
| What you might be feeling | Three cards across: Feelings / Thoughts / Behaviour, value 20px / 600 in the stage color. Stacks below 640px. A row rather than the v2.0 table, because each value is one word and this is a glance, not a lookup. |
| In your work | A field selector and the lens's one-line `summary`. Always present once a domain is known; the empty state says so rather than vanishing. Switching recomputes the gap (§5.3) — see [README.md](README.md) D-13. |
| Two doors | `Why this happens` and `What to do about it` (`What to do with it` at Integration), side by side, each with a one-line hint. |

Each door's hint names what is behind it, and says how much: with a result, "what is driving it, **and 2 more for your situation**". A button that hides an unknown quantity of text gets opened once.

### 8.2 Behind the doors

| Door | Holds |
|---|---|
| Why this happens | The stage core's `why` section, then `In your work` (domain lens) and `About what you said` (threat response) |
| What to do about it | The stage core's `forward` section, then `Try this` (first experiment) and `Your pace` |

The invariant core leads each modal, because the modal is named after it. The personalized layers follow in page order, which preserves the ethical override — a threat response to an ethical objection comes before the domain lens, and `U-P-04` asserts it. `Try this` keeps its `--accent` callout treatment inside the modal: it is still the most important element in the app for someone at Discomfort.

Each modal is two sections side by side: the text, and one image (§12). Below 1100px the image moves under the text.

### 8.3 Sources

A **Sources** button sits under the dial where the ephemeral badge was ([README.md](README.md) D-14), opening a modal with three groups: the model and the case against it, the reading for the field currently selected, and what the evidence says actually helps. The middle group follows the field selector (§8.1), and when no field is chosen it says so and tells the reader how to get one.

Entries come from [research/evidence-review.md](research/evidence-review.md) and carry their own caveats — preprint, vendor-published, self-selected sample — rather than one blanket note at the bottom. The first group is named "the model, **and the case against it**" and contains the work that argues against this tool; `U-S-05` asserts its two key entries are still present, because the pressure to quietly drop them later is real.

The standing note — that the stages are a practitioner model, that their order is a convention rather than a finding, and that the Grief Gap is an untested hypothesis of ours — sits above the citations, not below them. A caveat printed after the evidence reads as a disclaimer.

### 8.4 Modal behaviour

Every dialog in the app — both doors and the Locate flow — uses the same component, which does the four things a dialog has to do:

- moves focus to the dialog box on open, not to its first control, so a screen reader does not read "Close" before the content
- keeps Tab inside while it is open
- closes on Escape, on the backdrop, and on its own close button
- **returns focus to the control that opened it**

The app root is marked `inert` behind an open dialog, and body scroll is locked. Verified in the browser rather than in jsdom: focus restoration and `inert` are exactly the behaviours a unit test will happily assert and a browser will then not do.

### 8.5 Locate

The whole flow is in one overlay, opened by `Find your station` under the dial and by `#/locate`. It is a single task with a beginning and an end, which is what a modal is for; in the page it competed with the stage being read. The dial stays visible behind it, so the result lands on something the reader has already been looking at.

**Welcome.** Headline: "Where are you in the change cycle?" Sub: six questions, about two minutes, nothing leaves the browser. Disclaimer, 14px: "This is a reflection tool, not a judgment." Then a single `Find your station` button.

> **Simplified by D-8.** v2.0 showed two path cards here so the user could weigh an accuracy/privacy tradeoff. With one path there is no tradeoff to present, and a choice of one is not a choice — so the cards became a button.

**Survey questions.** One per screen. Progress as "3 of 6" plus a six-segment bar. Options as large tap targets (min-height 56px), radio semantics, full keyboard support. `Back` revises; answers persist so revising does not clear later answers. `Next` activates on selection.

**Thinking.** There is nothing to wait for — scoring is a pure function that returns in under a millisecond. The only pause is the reveal sequence itself (§7.2), which exists to let the user watch themselves being placed rather than to cover latency. v1 specified a dedicated 2-3 second screen "to build anticipation"; an artificial delay is a cost paid by every user forever.

**Result.** Format per [survey-methodology.md](survey-methodology.md) §6, in the overlay, with the dial behind it already updated. Then:

- `Read more about this stage` → closes the overlay at the diagnosed stage
- `See the whole path` → closes it at Loss
- `Download a copy` → §9

There is deliberately no "does this feel accurate?" prompt. Nothing collects the answer and nothing will, so asking would be theatre — and it would sit directly below a claim that nothing leaves the browser. See [survey-methodology.md](survey-methodology.md) §7.

---
## 9. Export

New in Phase 1. See [README.md](README.md) D-7.

`Download a copy` generates a single-page document **client-side**, with no network request:

- Stage, confidence, and transition if any
- The rationale
- Domain, primary threat, Rogers position
- The gap, with its sentence
- The assembled content for the diagnosed stage, including the first experiment
- A footer: the date, and "Generated in your browser. Nothing was stored."

Formats: Markdown (default — small, portable, pastes into anything) and print-to-PDF via a dedicated print stylesheet. No PDF library; the print stylesheet does the work at zero bundle cost.

Filename: `change-cycle-<stage>-<YYYY-MM-DD>.md`.

---

## 10. Typography

NextEd's two faces: **Roboto Condensed** for headings, eyebrows, buttons, labels and data callouts; **Roboto** for body copy, form fields and help text.

```css
--font-display: 'Roboto Condensed', 'Arial Narrow', Helvetica, Arial, sans-serif;
--font-body:    Roboto, Helvetica, Arial, sans-serif;
```

| Element | Face | Size | Weight |
|---|---|---|---|
| Stage name | display | 40px | 700 |
| Section heading | display | 28px | 700 |
| Card / panel title | display | 20px | 700 |
| Eyebrow, flag, label | display | 13–15px, 0.18em tracked, uppercase | 700 |
| Button | display | 15px, 0.1em tracked, uppercase | 700 |
| Triad value | display | 22px | 700 |
| Lead | body | 19px | 400 |
| Body | body | 16px | 400 |
| Small / meta | body | 14px | 400 |

Body at 16px/1.6 capped at **68ch** — the design system's prose measure, down from v2.0's 72ch. Never rely on colour alone: every coloured element carries a shape, label or position difference as well.

> **The fonts are not loaded from Google.** NextEd says to pull Roboto and Roboto Condensed from Google Fonts. Doing that would put a request to `fonts.googleapis.com` on every page load, which breaks D-8 — the app makes **no** network requests, and that claim is printed on the screen next to the survey. The stacks above are the design system's own, fallbacks included, so a machine with Roboto installed gets Roboto and everything else gets Helvetica or Arial. Self-hosting the two woff2 files would satisfy both the brand and D-8, and is the right fix when someone wants the real condensed face; it is a small, separate piece of work and nothing in the current build depends on it.

---
## 11. Accessibility

WCAG 2.1 AA. The dial is the hard part, and it is substantially easier than v1's wheel was.

### 11.1 The graphic

```html
<figure>
  <svg role="img" aria-labelledby="dial-title dial-desc"> … </svg>
  <h2 id="dial-title" class="visually-hidden">
    The change cycle as an open dial
  </h2>
  <p id="dial-desc" class="visually-hidden">
    Six stages around an open dial, read clockwise. It begins at Loss at
    the lower left, climbs through Doubt to a narrow band at Discomfort,
    then widens through Discovery and Understanding to Integration at the
    lower right. Each band is as wide as the options available there. The
    dial does not close, and the one route backward runs from Discomfort
    to Doubt. You are at Discomfort, stage 3 of 6. Your field, Craft and
    Composition, is positioned such that your field is 1.2 stages ahead.
  </p>
  <figcaption class="visually-hidden">
    <ol><!-- one li per station, aria-current on the user's --></ol>
  </figcaption>
  <button aria-expanded="false">Text view</button>
</figure>
```

The description is **generated from state**, not static, so it always says where the user is. The ordered list gives a screen reader a linear structure with the current position marked — which a six-wedge pie chart cannot provide.

`Text view` is a visible toggle that replaces the SVG with the same information as a table. This serves screen-reader users, users who find the graphic unclear, and anyone who simply prefers the numbers.

### 11.2 Keyboard

- One tab stop for the dial; `←`/`→` move between bands (roving tabindex)
- Mode toggle, Start fresh, and every control reachable in document order
- Survey: full keyboard support on all inputs; `Enter` advances when an option is selected
- Focus ring: 2px `--accent` with a 2px offset, on every focusable element, never removed
- Focus moves to the new content region's heading on stage change, so a screen reader announces it

### 11.3 Reduced motion

Under `prefers-reduced-motion: reduce`:

- Reveal sequence (§7.2) collapses to a single 150ms cross-fade
- Danger Zone glow renders static
- The sweep is replaced by a static "Thinking…" label
- Marker overshoot easing becomes linear
- Survey transitions become instant
### 11.4 Compact labels below 768px

The dial scales its entire coordinate space to the viewport, so at 375px a 20-unit label renders at about 11px. Six stage names will not fit around a ring at that width anyway — "Understanding" at a readable size is wider than the arc its band occupies. Below 768px the outer labels are dropped entirely and the numbers on the bands carry the identification, with the current stage named in the hole at 46 units (26px) and the full table one tap away behind **Text view** — which on mobile sits below the figure rather than floating over it, because the dial now occupies that space.

The panel heading states "Stage 3 of 6", so the numbering on the bands is anchored by text that is always present.

This was found by looking at the rendered page at 375px, not by reasoning about it; the original spec said only "the segments remain clickable."

### 11.5 Touch

All interactive targets ≥44×44px, including the 20° Danger Zone band, whose hit path is padded past the ring on both sides to reach it (§4.3). No hover-only content anywhere — which is why the experience triad is three cards rather than v1's hover-expanding columns, and why both doors open real dialogs rather than tooltips.

Below 768px the modals become bottom sheets: full width, anchored to the bottom edge, 92vh maximum. The close button stays a 44px target in the top right, and Escape still works for anyone with a keyboard attached.

---

## 12. Assets

| Asset | Notes |
|---|---|
| Dial SVG | Generated from the span table, not hand-drawn |
| Arrowhead markers | Two `<marker>` defs — retreat and gap — reused |
| Gradients | One `<linearGradient>` for the column behind the dial. The ring is flat fills: a gradient across a band would fight the opacity that carries state. |
| Lock glyph | Inline SVG, 14px |
| Close glyph | Inline SVG, 16px, in a 44px target |
| **Modal images** | Forty-two photographs: twelve stage-level, one per stage per door, plus thirty per-domain pictures for the `why` door. Not generated yet: each modal currently shows a dashed placeholder with that image's caption under it. |
| Print stylesheet | For export (§9) |

No icon font, no illustration set, no animation library. v1 called for stage icons, attribute icons, and a loading animation; none survive, because the triad moved into the panel and the loading state moved into the hole.

### 12.1 The forty-two images

Briefs live in [imageBriefs.ts](../src/content/imageBriefs.ts) — one `alt` line and one prompt each — to be generated in Krea2 and dropped in where the placeholders sit. Twelve are stage-level; thirty are per-domain and serve the `why` door, because what you are losing differs by field. The forward door stays stage-level: the first move out of a stage is the same move whoever you are. `briefFor()` resolves this and `U-V-11`/`U-V-12` assert both halves.

The house rules are in that file, and they are derived from the content rather than from a style preference:

- **A person, in a situation.** Every frame has someone in it, doing or visibly not doing something that belongs to that stage. An empty desk is a still life; the person is what makes it a stage of anything. `U-V-14` asserts a person is named in every prompt.
- **No text, anywhere.** Not on paper, not on a screen, not on a sign or a spine or a whiteboard. Generated writing is always subtly wrong, it dates the image, it cannot be translated, and a screen reader gets nothing from it. Where writing would naturally appear, the brief shoots it out of focus, from behind, or leaves it out. The rule reaches the generator through the exported `PROMPT_RULES`, appended to every prompt; `U-V-13` keeps text-bearing props — syllabus, checklist, printout, label — out of the briefs in the first place.
- **Somewhat abstract.** The situation reads before the detail does: posture, the distance between two people, where the light is, what someone is not doing. These are not illustrations of the sentence beside them.
- **No technology as subject.** No screens dominating the frame, no circuitry, no glowing brains, no robot hands. A laptop may appear the way a stapler appears — the Doubt image has one, closed, being ignored by both people arguing over it.
- **No metaphor for the emotion.** No head in hands, no silhouette on a summit, no light at the end of a tunnel. The image shows a moment; the text does the naming.
- **Quiet, specific, documentary.** Natural light, muted palette, one warm source against cooler shadow. They sit on a near-black ground in dark mode, so an evenly-lit studio frame will glare.
- **Faces optional, dignity mandatory.** Nobody is shown as pitiable, foolish, or behind. Several of these people are standing still, and standing still is not being stuck.

An earlier set paired each `why` image as *a state* with each `forward` image as *an object within reach* — a desk of unsorted printouts, then a timer wound to twenty minutes beside a blank sheet. That pairing is gone: it leaned on props that carry writing, and the objects crowded the person out of the frame. What replaced it is the person's posture and what they are not doing — in Discomfort, standing still while the office moves past, then pulling the chair in at a cleared desk.

**The images have landed.** [imageAssets.ts](../src/content/imageAssets.ts) resolves a door to a file through `imageSlug()`, which mirrors `briefFor()` exactly, so the picture and the caption can never disagree about which frame this is. Vite resolves the glob at build time, so a missing file is a `null` rather than a broken request, and `imageAssets.test.ts` turns that null into a failing test.

The caption did **not** go with the placeholder, which is a change from what this section planned. The `<img>` ships with `alt=""` and the brief's line renders as a visible `<figcaption>` instead. That is the right call for the images that were generated: they are abstract enough that a sighted reader benefits from the same sentence a screen-reader user gets, and putting the line in both `alt` and the caption would announce it twice. If the captions are ever dropped, the `alt` has to come back in the same commit.
