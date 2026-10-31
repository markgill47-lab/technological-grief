# UI Specification: Technological Grief Interactive

**Version**: 2.0
**Last updated**: 2026-10-31

---

## 1. What changed from v1

v1 specified a closed six-segment clockwise wheel, 600×600px, in a 55/45 two-panel split on a fixed 1920×1080 canvas. Each wedge carried the stage name in an outer ring and three stacked attributes in a middle ring.

v2 replaces it with a **terrain cross-section**: a wide, short side-elevation path with six stations. The reasons, in order of weight:

1. **A closed circle asserts endless cycling.** The framework describes a progression with one specific regression path and a genuine endpoint. The geometry was arguing against the content.
2. **The wheel could not show the Grief Gap.** That construct is the framework's most original claim, and a single-position indicator cannot express a distance between two positions. See [README.md](README.md) D-5.
3. **The wheel could not show direction of travel or the regression path.** Both are load-bearing claims.
4. **Three stacked attributes per wedge is illegible.** At v1's own stated mobile size of 360px, each segment is roughly 180px of arc carrying four text elements at varying rotations. v2 moves the emotion/cognition/behavior triad out of the graphic entirely and into the content panel, where it reads as a table.
5. **A pie of rotated text is a poor screen-reader target.** A path with ordered stations has an obvious linear equivalent.

---

## 2. The metaphor

**A mountain pass.**

The path climbs from Loss through Doubt to a narrow saddle at Discomfort, then descends on the far side into a widening valley through Discovery, Understanding, and Integration.

This fits the framework more closely than a wheel does, in four ways that fell out of the geometry rather than being imposed on it:

- **The hardest point is the highest, narrowest point.** The Danger Zone does not need a red overlay and an explanatory legend. It is where the trail is a knife edge.
- **You cannot stand on a saddle.** The framework says Discomfort is unstable — a fork, not a waiting room. A summit with downhill on both sides says that without words.
- **Both exits are easier than staying.** Retreat to Doubt is downhill. Progress to Discovery is downhill. This is exactly the framework's claim, and it is why people cycle: the backward exit is as available as the forward one.
- **The far side is wider.** Trail width encodes available options, so Integration's "regained flexibility" is visible as open ground.

---

## 3. Layout

v1's two-panel split is dropped. The terrain is a wide, short shape, so it reads best as a full-width banner with content beneath — which also makes the desktop and mobile layouts the same structure at different scales, rather than two layouts.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     T E R R A I N                           │
│              (full width, max-height 380px)                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Explore ·  Diagnose]        Start fresh   🔒 Ephemeral     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ┌───────────────────────────────┐              │
│              │                               │              │
│              │    C O N T E N T  (72ch)      │              │
│              │                               │              │
│              └───────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

| Breakpoint | Terrain | Content |
|---|---|---|
| ≥1200px | Full width, max-height 380px | 72ch, centered |
| 768–1199px | Full width, max-height 300px | 68ch, centered, 32px gutters |
| <768px | Full width, max-height 220px | Full width, 16px gutters |

Content is capped at 72ch regardless of viewport. A full-width prose column on a 1920px display is unreadable, and the whole point of this content is that someone reads it.

---

## 4. Terrain geometry

### 4.1 Coordinate system

`viewBox="0 0 1000 310"`, `preserveAspectRatio="xMidYMid meet"`. Ground baseline at `y=310`. Lower `y` is higher elevation.

> **Corrected during implementation.** This was specified as `1000 420`. Against a banner capped at 300px tall, `meet` scales to the height and letterboxes — which threw away a third of the available width and rendered the terrain at 714px inside a 1009px container. A wide, short graphic needs a wide, short coordinate space: the viewBox aspect must stay near the banner's own, which `geometry.test.ts` now asserts (`VIEW_W / VIEW_H > 3`).

### 4.2 Stations

| Stage | `position` | x | y | Trail width | Label anchor |
|---|---|---|---|---|---|
| `loss` | 1 | 90 | 216 | 26 | below |
| `doubt` | 2 | 235 | 148 | 18 | below |
| `discomfort` | 3 | 370 | 55 | **8** | above |
| `discovery` | 4 | 545 | 143 | 20 | below |
| `understanding` | 5 | 740 | 206 | 34 | below |
| `integration` | 6 | 930 | 231 | 48 | below |

Virtual endpoints at `(0, 255)` and `(1000, 239)` extend the terrain to the viewport edges so the ground fill spans full width. They carry no station.

Two deliberate asymmetries:

**X-spacing tightens on the climb** (145, 135 px) and widens on the descent (175, 195, 190 px). This renders the framework's "compressed grief cycles" claim — the early stages arrive faster than they can be processed, while the later ones take the time they take.

**Trail width is narrowest at Discomfort** (8px against 26px at Loss and 48px at Integration). Width is the visual encoding of available options, so the pinch at the saddle is the paralysis.

### 4.3 Path construction

The ridge is a single smooth path through all six stations using Catmull-Rom interpolation converted to cubic Béziers, with **tension 0.32**. Do not hand-author the `d` attribute — generate it, so that moving a station in the table above moves the path.

```typescript
const RIDGE_D = catmullRomToBezier(CURVE_POINTS, 0.32);
```

> **Corrected during implementation.** Specified as tension 0.5, which broadened the summit enough that the whole thing read as a rounded hill rather than a pass — the shape stopped making its point. Lower tension keeps the curve tighter to the station polyline and restores the saddle.

The trail band is the ridge stroked with a variable width. Since SVG has no native variable-width stroke, render it as a filled shape: offset the ridge polyline perpendicular by ±`width/2` interpolated between stations, then close the two offset curves.

Ground fill is the ridge path closed down to `y=420` across the full width, filled with the ground gradient. Sky is the remainder.

### 4.4 The regression path

From Discomfort back to Doubt, as an arc **through the sky above the ridge**.

```
M 342 50  C 316 20, 258 32, 232 136
```

- `stroke-dasharray="6 7"`, `stroke-width="2.5"`, `stroke="var(--regress)"`, `opacity="0.7"`
- Arrowhead at the Doubt end, pointing backward
- Rendered **over** the trail band
- Label `retreat` at `(276, 70)`, in the sky clear of the ridge

> **Corrected during implementation.** Specified as a line down the near face. In a cross-section the near face *is* the ridge, so a second path inside the hill reads as a tunnel through the mountain rather than as a route. An arc above the surface reads as what it actually is: a direction of travel available from the summit. The arc also had to start at `x=342` rather than at the summit itself, or it crossed the "Discomfort" label.

This is the only element in the graphic that exists purely to make a theoretical claim visible. It earns its place: "most people cycle between Doubt and Discomfort several times before moving forward" is a central assertion of the framework and v1's wheel had no way to show it.

### 4.5 Fractional positions

Field positions are fractional (`teaching: 3.1`, `craft: 4.2`), so markers must sit between stations.

Curve segment `j` runs from `CURVE_POINTS[j]` to `CURVE_POINTS[j+1]`. Because the virtual left endpoint is index 0, **segments 1–5 are exactly the station-to-station spans**, so the Bézier parameter `t` within segment `j` maps linearly to position `j + t`. Evaluating the Bézier directly is therefore exact:

```typescript
function pointAtPosition(position: number): Point {
  const p = clamp(position, 1, 6);
  let j = Math.floor(p);
  let t = p - j;
  if (j === 6) { j = 5; t = 1; }       // the right endpoint
  return bezierPoint(SEGMENTS[j], t);
}
```

> **Corrected during implementation.** Specified as walking the rendered path with `getPointAtLength` against a precomputed length table. Two problems. First, **jsdom implements no SVG layout**, so `getPointAtLength` does not exist there — the geometry unit tests the test plan calls for (U-T-01 to U-T-06) could not have run. Second, it was unnecessary: the parameter mapping above is exact arithmetic, needs no DOM, no mount-time measurement, and no memoization. Position is not an arc-length measure — it is "which station, and how far between" — which is precisely what the Bézier parameter already is.

---

## 5. Markers

### 5.1 You

- Filled circle, r=9, fill = current stage color
- Ring: 2.5px stroke in `--accent` (#00D9FF), plus a 1px dark inner stroke for contrast against light terrain
- Drop shadow: `0 2px 4px rgba(0,0,0,0.4)`
- Label above (or below if the station anchor is `above`): **"You"**, 13px, 600 weight
- Sits **on** the trail band, vertically centered on the ridge

### 5.2 Your field

- Hollow diamond, 14px across, 2px stroke in `--field` (#8A93A5), no fill
- Label: the domain's display name, 12px, 400 weight, `--field`
- Rendered at 70% opacity — present but clearly secondary to the user's own marker
- Suppressed entirely when `|gap| < 0.25`, where the two markers would overlap illegibly. The gap sentence in the content panel still states the alignment; the graphic just does not draw two shapes on top of each other.

### 5.3 The gap span

Drawn only when `|gap| ≥ 0.25`.

- A horizontal line at `y=280`, from the user marker's x to the field marker's x
- 1.5px, `--field`, with 4px end ticks
- Centered label, 12px: `"your field is 2.6 stations ahead"` / `"you are 2.6 ahead of your field"`
- When the gap is negative, the line is drawn in `--accent` rather than `--field` — the negative case is a different condition, not a lesser amount of the same one ([grief-framework-context.md](grief-framework-context.md) §5.2), and it should not read as a deficit

### 5.4 Uncertainty band

Diagnostic confidence is rendered as horizontal extent, not as a hard point.

| `stageConfidence` | Half-width |
|---|---|
| `high` | ±0.15 stations |
| `moderate` | ±0.35 stations |
| `low` | ±0.60 stations |

A soft radial gradient ellipse centered on the user marker, horizontal radius from the table, vertical radius 16px, in the stage color at 28% peak opacity fading to 0. Rendered under the marker and over the trail band.

When `transitionToward` is set, the band is asymmetric: it extends 1.5× further toward the named stage. This is how "transitioning from Doubt to Discomfort" is drawn, and it is better than either picking one station or drawing two markers.

---

## 6. Color

v1's stage palette is retained unchanged. Terrain-specific tokens are added.

```css
:root {
  /* Surface */
  --bg:            #2A2D34;   /* deep charcoal */
  --text:          #F5F5F0;   /* off-white */
  --text-dim:      rgba(245, 245, 240, 0.68);
  --text-faint:    rgba(245, 245, 240, 0.42);
  --accent:        #00D9FF;   /* bright cyan — interactive */

  /* Stages (unchanged from v1) */
  --loss:          #C83737;
  --doubt:         #B83A4B;
  --discomfort:    #E8A547;
  --discovery:     #F4C542;
  --understanding: #4A9B8E;
  --integration:   #2F6B5D;

  /* Terrain */
  --sky-top:       #1E2128;
  --sky-bottom:    #2A2D34;
  --ground-top:    #343842;
  --ground-bottom: #22252B;
  --trail:         rgba(245, 245, 240, 0.14);
  --trail-edge:    rgba(245, 245, 240, 0.30);
  --field:         #8A93A5;   /* field marker, gap span */
  --regress:       #B83A4B;   /* regression path — Doubt's color, deliberately */
  --saddle-warn:   rgba(232, 165, 71, 0.22);
}
```

The regression path uses Doubt's color because that is where it leads. This is a small thing that makes the diagram self-documenting.

### 6.1 Trail segment coloring

The trail band is a neutral translucent fill by default. The segment containing the user's position is tinted with that stage's color at 35% opacity, feathered over ±0.4 stations so it does not read as a hard boundary where none exists.

In Explore mode, hovering a station tints its segment at 20%.

### 6.2 Contrast

Light text on dark terrain throughout. Every text element must reach 4.5:1 against its actual local background, which varies across the gradient — verify against the darkest and lightest points under each label, not against `--bg`. The amber stages (`--discomfort`, `--discovery`) do not reach 4.5:1 as text on the dark ground and are therefore **never used for text**; they appear only as fills, strokes, and tints, with labels rendered in `--text`.

---

## 7. Interaction

### 7.1 Explore mode

| Element | Behavior |
|---|---|
| Station marker | Click or Enter selects that stage. Hit area ≥44×44px regardless of visual size. |
| Station label | Same hit target as the marker; they are one control. |
| Trail segment | Clicking a segment selects the nearer station. |
| Hover | Station grows to r=7 (from r=5), label brightens from `--text-dim` to `--text`, segment tints 20%. |
| Keyboard | Stations are a single roving-tabindex group. `←`/`→` move between stations, `Home`/`End` jump to Loss/Integration, `Enter`/`Space` select. One tab stop for the whole graphic. |
| Selected | Station r=8, 2px `--accent` ring, label at 600 weight. |

Selecting a station updates the content panel and the URL hash (`#/explore/discomfort`), so stages are linkable and the back button works.

### 7.2 Diagnose mode

The terrain is **not interactive** during a diagnostic. Stations lose their tab stops and pointer cursors.

During the Conversation path, between turns, the trail shows a slow travelling highlight — a 120px-wide gradient sweeping left to right along the band, 2.4s per pass. This is the thinking indicator. It is on the trail rather than a separate spinner because the trail is what is about to change.

On diagnosis, the reveal sequence:

| t | Event |
|---|---|
| 0ms | Sweep stops |
| 0–400ms | Uncertainty band fades in at the diagnosed position (ease-out) |
| 300–700ms | "You" marker scales from 0 to r=9 with a slight overshoot (`cubic-bezier(0.34, 1.56, 0.64, 1)`) |
| 700–1000ms | Trail segment tint fades in |
| 900–1300ms | Field marker fades in at 70% |
| 1100–1500ms | Gap span draws from the user marker toward the field marker |
| 1500ms | Content panel fades in |

The order matters: the user sees themselves placed, then the trail colored, then — last — the comparison to their field. Leading with the gap would make the tool's first statement a judgment about how far behind they are.

### 7.3 The saddle

When the diagnosed stage is `discomfort`, the saddle region gets a `--saddle-warn` glow — a soft ellipse behind the ridge at the summit, 2.4s pulse, 10% opacity variation.

No warning icon. v1 specified an orbiting ⚠️; that is alarming in a context where the framework's entire position is that this stage is normal, common, and not a failure. The glow marks the place without editorializing.

Under `prefers-reduced-motion`, the glow renders static at its mid value.

---

## 8. Content panel

### 8.1 Explore mode

Sections render in the order given by [content-architecture.md](content-architecture.md) §4.6. Sections with no resolved block are omitted — never a heading above nothing.

| Section | Treatment |
|---|---|
| Stage header | Name 40px / 600 in stage color; "Stage 3 of 6" 14px `--text-faint` |
| Breadcrumb | `← Doubt` / `Discovery →`, 14px `--accent`. **Does not wrap** at the ends — Integration has no "next". v1 specified wrapping, which asserts a cycle the framework denies. |
| Overview | 18px / 1.65 line-height, max 72ch |
| What you might experience | Three-row table: Feelings / Thoughts / Behavior. A table, not three hover-expanding columns — hover-to-reveal hides content from touch and from screen readers. |
| In your work | Left border 3px in stage color, 20px padding-left |
| **Try this** | Boxed callout, `--accent` left border 4px, slightly raised background. The most important element on the page for a Stage 3 user. |
| About what you said | Same treatment as "In your work" |
| Why this happens | Inset box, 1px border in stage color at 40% |
| Moving forward | Bulleted, `--accent` markers |
| Your pace | 16px, `--text-dim`, no border — a closing aside, not a section |

### 8.2 Diagnose mode

**Welcome.** Headline: "Where are you in the change cycle?" Sub: "A few questions to find your current stage." Disclaimer, 14px: "This is a reflection tool, not a judgment."

Then the path choice — two cards, not a dropdown, because the tradeoff is worth seeing:

| | **Six quick questions** | **Talk it through** |
|---|---|---|
| | Multiple choice. About two minutes. Nothing leaves your browser. | A short back-and-forth. More accurate, and it can follow what you actually say. |
| | *(primary button)* | *(secondary)* |

Quick is primary. It is free, instant, private, and good enough for most users. The Conversation card is shown with its tradeoff stated plainly, and it is hidden entirely when no proxy is configured.

**Quick path questions.** One per screen. Progress as "3 of 6" plus a six-segment bar. Options as large tap targets (min-height 56px), radio semantics, full keyboard support. `Back` revises; answers persist so revising does not clear later answers. `Next` activates on selection.

**Conversation path.** A transcript, newest at the bottom. User turns right-aligned, assistant left. A text area with `Enter` to send and `Shift+Enter` for a newline. No progress indicator — there is no fixed count, and faking one would be a lie about what the path is. Instead, a quiet line: "Usually five or six questions."

**Thinking.** No separate screen. The trail sweep (§7.2) is the indicator, and the transcript shows a three-dot pulse. v1 specified a dedicated 2–3 second screen "to build anticipation"; an artificial delay is a cost paid by every user forever, and the reveal sequence already provides the beat.

**Diagnosis.** Format per [survey-methodology.md](survey-methodology.md) §6. Then:

- `Read more about this stage` → Explore mode at the diagnosed stage
- `See the whole path` → Explore overview
- `Download a copy` → §9
- Then, quietly: "Does this feel accurate?" Yes / Not really / Skip (§7 of the survey doc)

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

Inter, or the system sans fallback stack.

| Element | Size | Weight | Line height |
|---|---|---|---|
| Stage name | 40px | 600 | 1.1 |
| Section heading | 22px | 600 | 1.3 |
| Body | 18px | 400 | 1.65 |
| Station label | 13px | 600 | 1.2 |
| Small / meta | 14px | 400 | 1.5 |
| Graphic annotation | 12px | 400 | 1.2 |

Body at 18px/1.65 capped at 72ch. Never rely on color alone to convey state — every colored element carries a shape, label, or position difference as well.

---

## 11. Accessibility

WCAG 2.1 AA. The terrain is the hard part, and it is substantially easier than v1's wheel was.

### 11.1 The graphic

```html
<figure>
  <svg role="img" aria-labelledby="terrain-title terrain-desc"> … </svg>
  <h2 id="terrain-title" class="visually-hidden">
    The change cycle as a mountain pass
  </h2>
  <p id="terrain-desc" class="visually-hidden">
    Six stages along a path. It climbs from Loss through Doubt to a narrow
    summit at Discomfort, where the path forks — forward and down into
    Discovery, or back down to Doubt. Beyond the summit it widens through
    Understanding to Integration. You are at Discomfort, stage 3 of 6.
    Your field is at roughly the same point.
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

- One tab stop for the terrain; `←`/`→` move between stations (roving tabindex)
- Mode toggle, Start fresh, and every control reachable in document order
- Survey: full keyboard support on all inputs; `Enter` advances when an option is selected
- Focus ring: 2px `--accent` with a 2px offset, on every focusable element, never removed
- Focus moves to the new content region's heading on stage change, so a screen reader announces it

### 11.3 Reduced motion

Under `prefers-reduced-motion: reduce`:

- Reveal sequence (§7.2) collapses to a single 150ms cross-fade
- Saddle glow renders static
- Trail sweep is replaced by a static "Thinking…" label
- Marker overshoot easing becomes linear
- Survey transitions become instant

### 11.4 Compact labels below 768px

The terrain scales its entire coordinate space to the viewport, so a 15-unit label renders at about 6px on a 375px screen. Six stage names cannot be made legible at that width — enlarging them enough to read makes them overlap, since "Understanding" at a readable size is wider than the gap between stations.

Below 768px the graphic therefore shows the **station number** for each stage and the **full name only for the current one**, at 30 and 26 viewBox units respectively (≈11px and ≈10px at 375px). The content heading states "Stage 3 of 6", so the numbering is anchored, and the full table is one tap away behind **Text view** — which on mobile sits below the figure rather than floating over it, because the station numbers now occupy that space.

This was found by looking at the rendered page at 375px, not by reasoning about it; the original spec said only "the segments remain clickable."

### 11.5 Touch

All interactive targets ≥44×44px, including station markers whose visual radius is 5–9px. No hover-only content anywhere — this is the reason §8.1 specifies the experience triad as a table rather than v1's hover-expanding columns.

---

## 12. Assets

| Asset | Notes |
|---|---|
| Terrain SVG | Generated from the station table at build time, not hand-drawn |
| Arrowhead marker | One `<marker>` def, reused |
| Gradients | Four `<linearGradient>` (sky, ground, trail tint, sweep) + one `<radialGradient>` (uncertainty band) |
| Lock glyph | Inline SVG, 14px |
| Print stylesheet | For export (§9) |

No icon font, no illustration set, no animation library. v1 called for stage icons, attribute icons, and a loading animation; none survive, because the triad moved to a table and the loading state moved onto the trail.
