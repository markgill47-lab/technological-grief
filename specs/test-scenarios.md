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
| color is `#E8A547` | the element carries `data-stage="discomfort"` |

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

---

## 4. Unit: terrain geometry

| ID | Test | Expect |
|---|---|---|
| U-T-01 | `pointAtPosition(n)` for integer n | returns exactly station n's coordinates |
| U-T-02 | `pointAtPosition(3.5)` | lies on the rendered path, between stations 3 and 4 |
| U-T-03 | `pointAtPosition(0)` and `(7)` | clamped to stations 1 and 6 |
| U-T-04 | Ridge path generated from the station table | passes within 1px of all six stations |
| U-T-05 | Trail band width at each station | matches the table; monotonic decrease 1→3, increase 3→6 |
| U-T-06 | Moving a station in the table | path regenerates; no hard-coded `d` anywhere in the source |
| U-T-07 | Uncertainty half-width | `high < moderate < low` |
| U-T-08 | `transitionToward` set | band is asymmetric toward the named stage |

U-T-06 guards the thing most likely to decay: someone pasting a literal path string during a design tweak, after which the station table stops being the source of truth.

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

### 6.1 Terrain

| ID | Test |
|---|---|
| C-T-01 | Renders six stations with correct names and `data-stage` values |
| C-T-02 | Explore mode: stations are focusable, one tab stop for the group |
| C-T-03 | `←`/`→` move focus between stations; `Home`/`End` jump to the ends |
| C-T-04 | `Enter` and `Space` both select; `onStageSelect` fires once |
| C-T-05 | Diagnose mode: stations are not focusable and do not respond to clicks |
| C-T-06 | `stage: 'discomfort'` renders the saddle glow; other stages do not |
| C-T-07 | **No warning icon** anywhere in the DOM (v1 specified one; v2 removed it deliberately) |
| C-T-08 | `|gap| < 0.25` suppresses the field marker and the gap span |
| C-T-09 | Negative gap renders the span in the accent color, not the field color |
| C-T-10 | `aria-describedby` text is generated from state and names the current stage |
| C-T-11 | The hidden `<ol>` has six items with `aria-current` on the user's |
| C-T-12 | `Text view` toggle swaps the SVG for a table with equivalent information |
| C-T-13 | Station hit areas are ≥44×44px despite a 5–9px visual radius |
| C-T-14 | Regression path renders from Discomfort to Doubt, with the `retreat` label |

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

---

## 7. Visual regression

One screenshot suite, reviewed deliberately rather than asserted numerically (§1.1).

| ID | View |
|---|---|
| V-01 | Terrain, no diagnosis, Explore |
| V-02 | Terrain, Discomfort diagnosed, aligned gap |
| V-03 | Terrain, Loss diagnosed, large positive gap |
| V-04 | Terrain, Understanding diagnosed, negative gap |
| V-05 | Terrain, low confidence with `transitionToward` |
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
| S-05 | No `localStorage` access anywhere in the source |
| S-06 | CSP header present and matches [software-design-document.md](software-design-document.md) §7.3 |
| S-07 | Diagnosis never appears in the URL or in `history` entries |

---

## 10. User journeys (E2E, Playwright)

| ID | Journey | Key assertions |
|---|---|---|
| UJ-01 | **Explore only.** Land, click through all six stations, read each, never diagnose. | Content for every stage; zero network requests after load; breadcrumb does not wrap |
| UJ-02 | **Quick path, faculty in Discomfort.** Six questions → diagnosis → read the stage → export. | Diagnosis is Discomfort; the terrain shows both markers near the saddle; the teaching first experiment is present; the download produces a non-empty file |
| UJ-03 | **Doubt journey.** Skeptical answers: consumed content, resentment, ethical threat. | Diagnosis is Doubt; the ethical override fires — threat block above the lens, **no first experiment** |
| UJ-04 | **Danger Zone journey.** Attended training, tried nothing, overwhelmed. | High-confidence Discomfort; saddle glow present; exactly **one** suggested action |
| UJ-05 | **Discovery journey.** Experimenting, curious, skills threat. | Discovery; encouraging register; no "you should be further along" language |
| UJ-06 | **Integration journey.** Teaching others, satisfied. | Integration; breadcrumb offers no "next"; content is outward-facing |
| UJ-07 | **Negative gap.** Coordination domain, Understanding stage. | Gap is negative; span rendered in the accent color; pace note uses the `userAhead` framing |
| UJ-10 | **Diagnose then explore.** Diagnose, then browse all six stages. | Personalization persists across every stage; the diagnosed stage is marked on the terrain throughout |
| UJ-11 | **Start fresh.** Diagnose, then reset. | All state cleared; terrain returns to undiagnosed; sessionStorage key removed |
| UJ-12 | **Refresh mid-survey.** Reload at question 4. | Answers so far restored from sessionStorage |
| UJ-13 | **Two tabs.** Diagnose in tab A, open tab B. | Independent sessions; no bleed (sessionStorage is per-tab) |
| UJ-14 | **Deep link.** Open `#/explore/discomfort` directly. | Loads that stage without a diagnosis; content is complete |
| UJ-15 | **Phone.** Entire Quick path at 390×844. | No horizontal scroll; all targets tappable; terrain legible |
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
| A-05 | Terrain is a single tab stop with arrow navigation | automated |
| A-06 | Focus ring visible on every focusable element | automated + manual |
| A-07 | Screen reader announces the current stage and the path shape | manual: NVDA, VoiceOver |
| A-08 | Text view conveys everything the graphic does | manual |
| A-09 | Survey fully usable with a screen reader | manual |
| A-10 | `prefers-reduced-motion` disables the reveal, glow, and sweep | automated |
| A-11 | Nothing conveyed by color alone | manual |
| A-12 | All targets ≥44×44px | automated |
| A-13 | Zoom to 200% without loss of content or function | manual |

A-02 is more demanding than a standard contrast check: the terrain is a gradient, so a label passing against `--bg` can still fail against the ground beneath it. Sample at the darkest and lightest points under each label.

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
