# Test Scenarios

**Version**: 2.0
**Last updated**: 2026-10-31

---

## 1. Principles

### 1.1 Never assert on exact presentation values

v1's pass criteria pinned literal numbers: "Discomfort segment highlighted (100% opacity, cyan outline, 8px expansion)," "adjacent segments at 85% opacity," "transition takes ~0.4s." Every one of those fails the first time a designer nudges anything, and none of them tests whether the feature works.

Assert on **state and semantics**, not on rendered style:

| Don't | Do |
|---|---|
| `opacity === 0.85` | `station.getAttribute('data-state') === 'adjacent'` |
| `transform` contains `8px` | `station.getAttribute('aria-current') === 'step'` |
| transition is 400ms | the content region updates within 100ms |
| color is `#f58220` | the element carries `data-stage="discomfort"` |

Components expose `data-state` and `data-stage` attributes specifically so tests have a stable contract. Visual appearance is covered once, by screenshot comparison (§7), where a change is reviewed deliberately rather than failing a hundred assertions.

### 1.2 Test the pure functions hardest

v2's diagnostic logic is a pure function ([software-design-document.md](software-design-document.md) §9.1). That is where the product's correctness actually lives and where tests are cheapest, fastest, and most meaningful. Under v1 this logic was inside a model call and could only be evaluated statistically.

### 1.3 Guarantees are checks, not comments

The application has no network boundary and therefore no transport failure modes. What it does have are guarantees that are easy to erode silently — it makes no network requests, it never writes `localStorage`, it never puts a diagnosis in the URL — and each of those is a CI check (§9) rather than a comment. Two of them are themselves verified against deliberately planted violations, because a check that has never failed is a check nobody knows works.

---

## 2. Unit: Quick scoring

The highest-value suite in the project. Pure function, no mocks, no network.

| ID | Test | Expect |
|---|---|---|
| U-S-01 | Canonical Stage 3 faculty case (fixture `facultyStuck`) | `stage: 'discomfort'`, `confidence: 'high'` |
| U-S-02 | `trained` selected, no implementation | `discomfort` wins by ≥10 |
| U-S-03 | `trained` **plus** `tried` | danger-zone bonus **not** applied |
| U-S-04 | Behavior says Discovery, emotion says Loss | `stage` follows behavior; `signalConflict: true` |
| U-S-05 | Exact tie between `doubt` and `discomfort` | resolves to `doubt` (earlier stage) |
| U-S-06 | Adjacent top two, margin < 3 | `transitionToward` set to the later stage |
| U-S-07 | Non-adjacent top two, margin < 3 | `transitionToward: null`, `confidence: 'low'` |
| U-S-08 | `teaching` + `discomfort` | `gap === 0.1` |
| U-S-09 | `coordination` + `understanding` | `gap === -2.6` |
| U-S-10 | `coordination` + `loss` | `gap === 1.4` |
| U-S-11 | `Q5 = ethical` | `ethicalPosition: 'primary'`; stage scoring unchanged |
| U-S-12 | Redundant threat pair selected | both returned by scoring; assembly drops the second |
| U-S-13 | Q4 = indifference (option g) | contributes to `loss`, not `discovery` |
| U-S-14 | **Property**: all 6×5×7×5×7 answer combinations | always a valid `Diagnosis`; `gap` within [−5, 5]; never throws |
| U-S-15 | **Property**: every behavior subset (2⁷ = 128) | always a valid stage; danger-zone rule fires iff the condition holds |

U-S-14 and U-S-15 are exhaustive rather than sampled. The input space is small enough to enumerate completely, so there is no reason to guess.

---

## 3. Unit: content assembly

| ID | Test | Expect |
|---|---|---|
| U-C-01 | No diagnosis | stage core only; page is complete and non-empty |
| U-C-02 | Full diagnosis | core + lens + threat + pace, in the §4.6 order |
| U-C-03 | Domain with no authored lens for that stage | section omitted entirely, no empty heading |
| U-C-04 | Two redundant threats | one threat block rendered |
| U-C-05 | Two non-redundant threats | two rendered, primary first |
| U-C-06 | Three threats passed in | at most two rendered |
| U-C-07 | `threats[0] === 'ethical'` | threat block **above** the lens; `firstExperiment` absent |
| U-C-08 | `gap > 0.5` | pace note renders `fieldAhead` framing |
| U-C-09 | `gap < -0.5` | pace note renders `userAhead` framing |
| U-C-10 | `|gap| <= 0.5` | pace note renders `neutral` framing |
| U-C-11 | Stage core splits on `<!--@why-->` / `<!--@forward-->` | three sections, in order, none empty |
| U-C-12 | Ambiguous `stageScope` variants | **throws** at build time |
| U-C-13 | No user text appears in any assembled block | no interpolation, ever |


### 3.1 Panel grouping

The page is split between the panel and the two modals in [panels.ts](../src/content/panels.ts) ([README.md](README.md) D-11).

| ID | Test | Expect |
|---|---|---|
| U-P-01 | Every stage × {no diagnosis, diagnosis, ethical diagnosis} | every section lands in exactly one group; none lost, none duplicated |
| U-P-02 | Any stage | the panel always has a description and a triad |
| U-P-03 | Grouped page | each modal leads with its invariant core section |
| U-P-04 | Ethical diagnosis | threat response still precedes the domain lens inside the why group |
| U-P-05 | No diagnosis | each modal holds exactly its core section |
| U-P-06 | Full diagnosis | no section appears behind both doors |

U-P-01 is the one that matters. Moving text behind a button and dropping it look identical from the outside, so the grouping is asserted rather than eyeballed.

### 3.2 Reading through another field

In [view.test.ts](../src/domain/view.test.ts) ([README.md](README.md) D-13).

| ID | Test | Expect |
|---|---|---|
| U-V-01 | Each of the five domains | the gap is recomputed for the field being read |
| U-V-02 | Any switch | stage, threats, confidence, transition and Rogers position pass through untouched |
| U-V-03 | Several switches in a row | the stored diagnosis is not mutated — the export must still match the survey |
| U-V-04 | No override, or the same domain | the diagnosis itself is returned, not a copy |
| U-V-05 | Borrowed-field check | true only when the field being read differs from the one answered |
| U-V-06 | A field behind the reader | the gap goes negative, which means isolation rather than pressure |

U-V-03 is the one worth keeping honest: the stored diagnosis is the record of what someone said, and five fields can be read through it without any of them rewriting it.

### 3.3 Sources

In [sources.test.ts](../src/content/sources.test.ts) ([README.md](README.md) D-14).

| ID | Test | Expect |
|---|---|---|
| U-S-01 | Each of the five fields | at least two sources of its own; a heading above nothing reads as "nothing to say about your work" |
| U-S-02 | Every entry | authors, title, venue and a four-digit year — enough to find it without the link |
| U-S-03 | Every entry | a note, in our own words, on why it is there |
| U-S-04 | Every link | parses as an absolute https URL |
| U-S-05 | The framework group | still contains the two works that argue against this tool |
| U-S-06 | Preprints and vendor surveys | each carries its own caveat, not a blanket note |
| U-S-07 | The whole list | nothing appears twice |

U-S-05 is the one with a reason to exist beyond tidiness. The two entries it names — the direct test that found stage theory does not hold, and the paper warning against walking people through stages — are the ones most likely to be dropped in a later tidy-up, and dropping them turns the list into marketing.


### 3.4 Palette and themes

In [palette.test.ts](../src/theme/palette.test.ts) ([README.md](README.md) D-12).

| ID | Test | Expect |
|---|---|---|
| U-N-01 | tokens.css against the palette record | every token matches, both themes |
| U-N-02 | The two dark rule blocks | the media query and `[data-theme=dark]` declare the same tokens and values |
| U-N-03 | The stage ramp in CSS | matches the ramp record, both themes |
| U-N-04 | Each station number on its band | ≥4.5:1, and the CSS ink is the one the luminance rule picks |
| U-N-05 | Band keylines | ≥3:1 on surface and on surface-subtle |
| U-N-05b | Dark fills on the dark surface | ≥2.5:1 — the reason dark takes the lighter token values |
| U-N-06 | The light ramp in greyscale | adjacent bands differ by ≥0.05 luminance, peaking at stage 3 |
| U-N-07 | Text pairs the app uses | ≥4.5:1, both themes |
| U-N-08 | Focus ring on every surface | ≥3:1, both themes |
| U-N-09 | Brand presence | Spirit Red and Granite Black in both themes |

These check tokens, which is not the same as checking the page. The rendered app was walked separately in both themes, measuring each text node against its real background; that walk is what found the four failures recorded in D-12, and none of them were visible to U-N-07.

---

## 4. Unit: dial geometry

| ID | Test | Expect |
|---|---|---|
| U-D-01 | One band per stage | six bands, in `STAGE_IDS` order, positions 1–6 |
| U-D-02 | Band layout | every `a2 > a1`; neighbours separated by exactly `SECTOR_GAP` |
| U-D-03 | The ring does not close | total sweep < 360°, opening > 40° |
| U-D-03b | Opening placement | its midpoint within 40° of six o'clock |
| U-D-04 | Span encodes options | Discomfort is the minimum and Integration the maximum, monotone on both sides |
| U-D-04b | Climb against descent | degrees before the narrow band < degrees after it |
| U-D-05 | `angleAtPosition(n)` for integer n | returns band n's centre exactly |
| U-D-05b | `angleAtPosition(3.5)` | midway between the centres of bands 3 and 4 |
| U-D-05c | Monotonic and clamped | increases across [1, 6]; `(0)` → `(1)`, `(7)` → `(6)` |
| U-D-06 | Angle convention | 0° is straight up, 90° is right, and `pointAt(r, θ)` is at radius r |
| U-D-07 | Paths derived, not hard-coded | each band's `d` contains its own computed outer start point |
| U-D-08 | Uncertainty half-width | `high < moderate < low`, and the wedge widens with it |
| U-D-08b | `transitionToward` set | wedge is biased toward the named stage |
| U-D-09 | The retreat runs backward | sweep flag 0, from Discomfort's angle to Doubt's |
| U-D-10 | Gap sweep sign | clockwise when the field is ahead, anticlockwise when the user is |
| U-D-11 | Nothing escapes the viewBox | ring and all six label points inside the bounds |
| U-D-12 | Hit areas | ≥44 units radially and along the inner arc, Discomfort included |
| — | viewBox aspect | between 0.9 and 1.6; the terrain's `> 3` is what a dial must not be |

U-D-07 guards the thing most likely to decay: someone pasting a literal path string during a design tweak, after which the span table stops being the source of truth.

U-D-04 is not a tautology test. It failed on the first span table, which was authored to put Discomfort at twelve o'clock and in doing so made Loss (60°) wider than Integration (56°) — breaking the encoding the whole graphic rests on. An invariant that only restates the data is worthless; this one restates the *claim*, which is why it caught a table that satisfied the eye and not the argument.

---
## 5. Content validation (CI)

All eight checks from [content-architecture.md](content-architecture.md) §5, run as tests so they fail the build.

| ID | Check |
|---|---|
| U-V-01 | All 6 stage cores and 5 pace notes present |
| U-V-02 | Every stage has either all 5 domain lenses or none |
| U-V-03 | No duplicate block ids |
| U-V-04 | No stage resolves to >1 variant of a block |
| U-V-05 | **Coverage**: all 1,050 (stage × domain × threat × rogers) combinations assemble cleanly — no empty section, no duplicated paragraph, no heading above nothing |
| U-V-06 | Every block within ±40% of its target word count |
| U-V-07 | Warn on `lastReviewed` older than 12 months |
| U-V-08 | Warn, naming each, on `domain_lens` without `domainVerified: true` |
| U-V-09 | **Tone scan**: no banned vocabulary from [content-specification.md](content-specification.md) §2.2 |
| U-V-10 | No `firstExperiment` on any Loss or Doubt lens (framework §10 — never offer a tool at these stages) |

U-V-05 is the check that makes the content library safe to extend. U-V-10 encodes a framework rule that is easy to violate while writing in a hurry.

---

## 6. Component



| ID | Test |
|---|---|
| C-D-01 | Renders six bands with correct names and `data-stage` values |
| C-D-02 | Explore mode: bands are focusable, one tab stop for the group |
| C-D-03 | `←`/`→` move focus between bands; `Home`/`End` jump to the ends |
| C-D-04 | `Enter` and `Space` both select; `onStageSelect` fires once |
| C-D-05 | Locate mode: bands are not focusable and do not respond to clicks |
| C-D-06 | `stage: 'discomfort'` renders the danger wedge; other stages do not |
| C-D-07 | **No warning icon** anywhere in the DOM (v1 specified one; v2 removed it deliberately) |
| C-D-08 | `|gap| < 0.25` suppresses the field marker and the gap sweep |
| C-D-09 | Negative gap renders the sweep in the accent color, not the field color |
| C-D-10 | `aria-describedby` text is generated from state and names the current stage |
| C-D-11 | The hidden `<ol>` has six items with `aria-current` on the user's |
| C-D-12 | `Text view` toggle swaps the dial for a table with equivalent information |
| C-D-13 | Band hit areas are ≥44×44px despite the 20° Danger Zone sliver |
| C-D-14 | Retreat arc renders from Discomfort to Doubt, drawn anticlockwise |
| C-D-15 | No `You` marker in Explore without a result; it appears once `confidence` is set |

### 6.2 Explore content

| ID | Test |
|---|---|
| C-E-01 | Selecting a station updates the content region within 100ms |
| C-E-02 | Breadcrumb navigates to adjacent stages |
| C-E-03 | **Breadcrumb does not wrap**: Integration has no "next", Loss has no "previous" |
| C-E-04 | Experience triad renders as a table, not hover-revealed columns |
| C-E-05 | No content requires hover to be readable |
| C-E-06 | Focus moves to the new content heading on stage change |
| C-E-07 | URL hash updates; deep link to `#/explore/discovery` loads that stage |
| C-E-08 | With a diagnosis present, personalized sections appear; without, they are absent |

### 6.3 Quick survey

| ID | Test |
|---|---|
| C-Q-01 | Six questions, one per screen, progress reads "n of 6" |
| C-Q-02 | `Next` is disabled until an answer is selected |
| C-Q-03 | `Back` preserves later answers rather than clearing them |
| C-Q-04 | Q3 is multi-select; Q1/Q2/Q4/Q6 are single-select |
| C-Q-05 | Q5 offers an optional second selection |
| C-Q-06 | Fully keyboard operable; `Enter` advances when an option is chosen |
| C-Q-07 | Option targets are ≥56px tall |
| C-Q-08 | Zero network requests during the entire flow |

C-Q-08 is asserted by failing the test if any `fetch` occurs. It is the claim the Quick path makes to users, so it is tested rather than trusted.

### 6.4 Modals

| ID | Test |
|---|---|
| C-M-01 | Opening a door renders a `role="dialog"` with `aria-modal` and a title |
| C-M-02 | Focus moves to the dialog box, not to its close button |
| C-M-03 | Tab cycles within the dialog and does not reach the page behind |
| C-M-04 | Escape, the backdrop and the close button all dismiss it |
| C-M-05 | On dismissal focus returns to the door that opened it |
| C-M-06 | The app root carries `inert` while a dialog is open, and loses it after |
| C-M-07 | Body scroll is locked while open and restored after |
| C-M-08 | `#/locate` opens the survey overlay directly |
| C-M-09 | Each modal renders its image placeholder with the brief caption |

C-M-02 and C-M-05 were verified in a browser rather than in jsdom. Focus restoration and `inert` are precisely the behaviours a unit test will assert happily and a real browser will then not do.

---

## 7. Visual regression

One screenshot suite, reviewed deliberately rather than asserted numerically (§1.1).

| ID | View |
|---|---|
| V-01 | Dial, no diagnosis, Explore |
| V-02 | Dial, Discomfort diagnosed, aligned gap |
| V-03 | Dial, Loss diagnosed, large positive gap |
| V-04 | Dial, Understanding diagnosed, negative gap |
| V-05 | Dial, low confidence with `transitionToward` |
| V-06 | Full page, desktop (1440) |
| V-07 | Full page, tablet (900) |
| V-08 | Full page, phone (390) |
| V-09 | Text view expanded |
| V-10 | Print stylesheet (export) |

---

## 8. Integration

**None required.** There is no network boundary to integrate across.

v2.0's §8 held 17 transport tests and 8 proxy tests, every one asserting that some failure mode fell back cleanly to the Quick path. All of it went with the Conversation path ([README.md](README.md) D-8). What is notable is that nothing replaced it: the failure modes it tested — rate limits, upstream errors, timeouts, malformed responses, schema-invalid output, a misconfigured proxy — do not have successors, because the surface that produced them is gone.

The nearest equivalents that remain are pure-function tests (§2, §3) and the storage behaviours in §6.3, none of which can fail intermittently.


## 9. Security (CI)

| ID | Check |
|---|---|
| S-00 | **No source file makes a network request** — no `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource`, or remote dynamic import. The product's defining property, so it is checked rather than trusted |
| S-01 | `@anthropic-ai/sdk` absent from both dependency lists **and** from every import |
| S-00b / S-01b | Both checks verified against a deliberately planted violation, so each is known to be able to fail |
| S-02 | Built bundle contains no `sk-ant-` |
| S-03 | Built bundle contains no reference to `api.anthropic.com` |
| S-04 | No `VITE_`-prefixed variable name contains `KEY`, `SECRET`, or `TOKEN` |
| S-05 | `localStorage` only in the theme hook, only for the theme key, and the session key never within reach of it |
| S-06 | CSP header present and matches [software-design-document.md](software-design-document.md) §7.3 |
| S-07 | Diagnosis never appears in the URL or in `history` entries |

---

## 10. User journeys (E2E, Playwright)

| ID | Journey | Key assertions |
|---|---|---|
| UJ-01 | **Explore only.** Land, click through all six stations, read each, never open Locate. | Content for every stage; zero network requests after load; breadcrumb does not wrap |
| UJ-02 | **Quick path, faculty in Discomfort.** Six questions → diagnosis → read the stage → export. | Diagnosis is Discomfort; the dial shows both markers, one band apart; the teaching first experiment is present; the download produces a non-empty file |
| UJ-03 | **Doubt journey.** Skeptical answers: consumed content, resentment, ethical threat. | Diagnosis is Doubt; the ethical override fires — threat block above the lens, **no first experiment** |
| UJ-04 | **Danger Zone journey.** Attended training, tried nothing, overwhelmed. | High-confidence Discomfort; danger wedge present on band 3; exactly **one** suggested action |
| UJ-05 | **Discovery journey.** Experimenting, curious, skills threat. | Discovery; encouraging register; no "you should be further along" language |
| UJ-06 | **Integration journey.** Teaching others, satisfied. | Integration; breadcrumb offers no "next"; content is outward-facing |
| UJ-07 | **Negative gap.** Coordination domain, Understanding stage. | Gap is negative; span rendered in the accent color; pace note uses the `userAhead` framing |
| UJ-10 | **Locate then explore.** Locate, then browse all six stages. | Personalization persists across every stage; the diagnosed stage is marked on the dial throughout |
| UJ-11 | **Start fresh.** Locate, then reset. | All state cleared; the dial returns to undiagnosed, with no You marker; sessionStorage key removed |
| UJ-12 | **Refresh mid-survey.** Reload at question 4. | Answers so far restored from sessionStorage |
| UJ-13 | **Two tabs.** Locate in tab A, open tab B. | Independent sessions; no bleed (sessionStorage is per-tab) |
| UJ-14 | **Deep link.** Open `#/explore/discomfort` directly. | Loads that stage without a diagnosis; content is complete |
| UJ-15 | **Phone.** Entire Quick path at 390×844. | No horizontal scroll; all targets tappable; dial legible, outer labels dropped for numbers |
| UJ-16 | **Offline.** Load, disconnect, then use the whole app. | Explore and the full survey complete normally. Nothing degrades, because nothing was reaching the network to begin with |

UJ-16 is the clearest single statement of what v2 changed. Under v1 the application was unusable offline in both modes.

---

## 11. Accessibility

| ID | Test | Method |
|---|---|---|
| A-01 | Zero axe-core violations on every view | automated, every CI run |
| A-02 | All text meets 4.5:1 against its **local** background | automated, sampled under each label across the gradient |
| A-03 | Amber stage colors never used for text | automated source check |
| A-04 | Full app operable with keyboard only | manual |
| A-05 | Dial is a single tab stop with arrow navigation | automated |
| A-06 | Focus ring visible on every focusable element | automated + manual |
| A-07 | Screen reader announces the current stage and the path shape | manual: NVDA, VoiceOver |
| A-08 | Text view conveys everything the graphic does | manual |
| A-09 | Survey fully usable with a screen reader | manual |
| A-10 | `prefers-reduced-motion` disables the reveal, glow, and sweep | automated |
| A-11 | Nothing conveyed by color alone | manual |
| A-12 | All targets ≥44×44px | automated |
| A-13 | Zoom to 200% without loss of content or function | manual |

A-02 is more demanding than a standard contrast check: the station numbers sit on the bands, so no single ink passes against all six stage colors. Check each number against its own band, not against `--bg`, and check the annotations against the banner gradient at its darkest and lightest.

---

## 12. Performance

| ID | Metric | Target | Method |
|---|---|---|---|
| P-01 | First contentful paint | <1.2s | Lighthouse CI |
| P-02 | Time to interactive | <2.0s | Lighthouse CI |
| P-03 | Stage switch | <50ms | `performance.measure` in E2E |
| P-04 | Quick question advance | <50ms | same |
| P-05 | Quick scoring | <5ms | unit benchmark |
| P-06 | Content coverage test (1,050 combinations) | <1s | CI timing |
| P-07 | JS bundle, gzipped | <180KB | `check:bundle` |
| P-08 | Content blocks, gzipped | <40KB | same |
| P-09 | Reveal sequence | no frame over 16ms | Playwright trace |

---

## 13. What v1 tested that v2 does not

Stated explicitly so these are not reinstated by habit.

| v1 | Why it is gone |
|---|---|
| Concurrent-user stress test (PT-05) | Static files on a CDN plus one rate-limited function. There is nothing to stress that the host does not already guarantee, and the app has no server-side state to contend over. |
| Browser matrix across three versions each | One modern-evergreen matrix (current Chrome, Firefox, Safari, plus iOS Safari and Chrome Android). The app uses no exotic platform features; `getPointAtLength` is twenty-year-old SVG. |
| Mode-1 content-generation tests (IT-01, IT-02) | Mode 1 makes no API calls. The equivalent coverage is §3 and §5, which is stronger: deterministic rather than statistical. |
| Tool-use tests (IT-03) | No tools. The v1 mechanism returns HTTP 400 on current models. |
| Pixel-pinned pass criteria throughout | See §1.1. Replaced by `data-state` assertions plus one reviewed screenshot suite. |
| Session-timeout test (EC-09) | No inactivity timeout. v1 proposed discarding state after 30 minutes, which would delete someone's diagnosis while they read it in another tab. |
| "Thinking screen displays for 2–3 seconds" | There is no thinking screen and no artificial delay. The trail sweep is the indicator. |

Net: the suite is roughly a third the size of v1's and covers substantially more of what can actually break, because the surface that could break shrank.

---

## 14. Execution

| Phase | Runs |
|---|---|
| Pre-commit | Lint, typecheck, affected unit tests |
| Every CI run | All unit, content validation (§5), security (§9), component, integration, axe (A-01) |
| Pre-merge | Full E2E (§10), visual regression (§7), Lighthouse (§12) |
| Pre-release | Manual accessibility pass (A-04, A-07–A-09, A-11, A-13), manual read of every assembled page |

### 14.1 Release gates

Ships only when:

- All automated suites green
- Content coverage (U-V-05) passes with zero gaps
- Security checks (§9) pass
- Zero axe violations
- Manual screen-reader pass complete
- Someone has read all six assembled pages end to end and found them good

The last gate is not automatable and is the most important one in the list.
