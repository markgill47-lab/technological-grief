# UI Specification: Technological Grief Interactive Wheel

## Overall Layout & Structure

**Canvas Dimensions**: 1920x1080 (16:9 aspect ratio)

**Two-Panel Split**:
- **Left Panel** (55% width): Houses the interactive grief wheel and minimal controls
- **Right Panel** (45% width): Dynamic content area that responds to wheel interaction or survey flow

**Color Palette**:
- Background: Deep charcoal (#2A2D34)
- Stage 1 (Loss): Deep red (#C83737)
- Stage 2 (Doubt): Burgundy red (#B83A4B)
- Stage 3 (Discomfort): Warm amber (#E8A547)
- Stage 4 (Discovery): Bright amber (#F4C542)
- Stage 5 (Understanding): Teal green (#4A9B8E)
- Stage 6 (Integration): Deep forest green (#2F6B5D)
- Danger Zone: Crimson gradient overlay between stages 2-3
- Text: Off-white (#F5F5F0) with reduced opacity variants for hierarchy
- Accent/Interactive: Bright cyan (#00D9FF)

---

## Left Panel: The Grief Wheel

### Visual Structure

**The Wheel Itself**:
- Circular diagram, 600x600px, centered vertically in left panel
- Six segments radiating from center, each representing a stage
- Segments arranged clockwise: Loss → Doubt → Discomfort → Discovery → Understanding → Integration
- Each segment has three concentric zones:
  - **Outer ring**: Stage name in bold caps, white text
  - **Middle ring**: Three descriptive attributes stacked:
    - "Feelings of: [EMOTION]"
    - "Thoughts are: [STATE]"
    - "Behavior is: [PATTERN]"
  - **Inner ring**: Gear/cog icon in center (representing the "thinking brain" from original graphic)

**The Danger Zone**:
- Semi-transparent crimson overlay spanning the border between Discomfort (Stage 3) and the previous stages
- Subtle pulsing glow effect (1.5s cycle)
- When a user is diagnosed in this zone, add animated warning icon (⚠️) that orbits the boundary

**Outer Ring: "Change" Label**:
- Curved text following the outer perimeter of wheel
- Light blue color (#00D9FF)
- Small directional arrows showing clockwise progression

### Interactive States

**Resting State** (Mode 1):
- All segments at 70% opacity
- Subtle hover glow on rollover (segment brightens to 100%, other segments dim to 40%)
- Cursor changes to pointer on segments

**Active State** (clicked or diagnosed):
- Selected segment: 100% opacity + 8px outward expansion + bright cyan outline
- Adjacent stages: 85% opacity
- Other stages: 30% opacity
- Smooth 0.4s transition between states

**Survey Mode State** (Mode 2):
- Wheel becomes non-clickable
- Subtle overall glow suggesting "analyzing"
- As Claude interprets responses, segments can pulse individually (like a loading indicator)
- Final diagnosis: dramatic transition to Active State

### Controls Below Wheel

**Mode Toggle** (centered, 40px below wheel):
- Pill-shaped toggle button (180px width)
- Left state: "Explore" (Mode 1)
- Right state: "Diagnose" (Mode 2)
- Smooth slide animation, active side highlighted in cyan

**Session Reset** (bottom-left of panel):
- Small text button: "Start Fresh"
- Only visible after survey has been started
- Gray when inactive, cyan on hover

**Privacy Badge** (bottom-right of panel):
- Small icon (🔒) + text: "Ephemeral Session"
- Tooltip on hover: "This conversation exists only in your browser. Nothing is saved or analyzed."

---

## Right Panel: Dynamic Content Area

### Mode 1: Educational/Exploratory

**Header Section** (fixed at top):
- Stage name in large type (48px, stage color)
- Subtitle: "Stage [X] of the Change Cycle"
- Small nav breadcrumb: "← Previous | Next →" (links to adjacent stages)

**Content Layout** (scrollable):

**Section 1: Overview** (260px height)
- 2-3 paragraph description of this stage
- Natural language, conversational tone
- Key phrases highlighted in stage color

**Section 2: What You Might Experience** (340px height)
- Three columns, each with icon + label:
  - **Feelings**: Icon (heart) + emotion keywords
  - **Thoughts**: Icon (brain) + cognitive state
  - **Behaviors**: Icon (person) + behavioral patterns
- Each column expands on hover to show more detail

**Section 3: Why This Happens** (200px height)
- Brief explanation of psychological/organizational drivers
- Boxed callout style, subtle border in stage color

**Section 4: Moving Forward** (180px height)
- If not the final stage: actionable guidance for progression
- If Integration: emphasis on "generosity" role
- Bulleted list, cyan accent bullets

**Section 5: Context for Your Situation** (if personalized from Mode 2)
- Only appears if user has done survey first
- Light yellow background box
- References their specific concerns/situation
- "Based on what you shared about [X], here's how this applies..."

### Mode 2: Diagnostic Survey

**Survey Flow Layout**:

**Welcome Screen** (when Mode 2 first activated):
- Centered content
- Headline: "Where are you in the change cycle?"
- Subhead: "Answer a few questions to find your current stage"
- Small disclaimer: "This is a reflection tool, not a judgment"
- Large cyan "Begin" button

**Question Screens** (5-7 questions total):
- Question number indicator at top (e.g., "Question 2 of 6")
- Large question text (32px)
- Response area:
  - **Multiple choice**: 4-5 radio button options, generous padding
  - **Likert scale**: Horizontal slider, labeled endpoints, current value displayed
  - **Short answer**: Text area, 3 rows, placeholder text guides response
- "Next" button (cyan, bottom-right) becomes active after response
- "Back" button (gray text, bottom-left) to revise previous answers

**Thinking Screen** (between final question and diagnosis):
- Centered animated graphic (thinking gears?)
- Text: "Analyzing your responses..."
- 2-3 second duration (gives Claude time to process, builds anticipation)
- Wheel on left should show subtle animation during this phase

**Diagnosis Screen**:
- Left panel: Wheel dramatically transitions to highlight diagnosed stage
- Right panel:
  - **Top section**: "You're currently in: [STAGE NAME]"
  - **Middle section**: Personalized interpretation of their responses
  - **Bottom section**: Two action buttons:
    - "Learn about this stage" → Mode 1 with current stage
    - "See the full cycle" → Mode 1 overview of all stages with current position marked

---

## Responsive Considerations

**Tablet (768px - 1366px)**:
- Maintain two-panel split but reduce to 50/50
- Wheel scales down to 480px
- Right panel: reduce section heights proportionally

**Mobile (< 768px)**:
- Stack layout: Wheel on top, content below
- Wheel: 360px, segments remain clickable
- Content: full-width cards, swipe between sections
- Mode toggle: sticky at bottom of screen

---

## Animations & Micro-interactions

**Wheel rotation** (Mode 1 only):
- Entire wheel can be dragged to rotate (optional feature)
- Segments snap to "top-center" position when close
- Smooth easing function (cubic-bezier)

**Stage transitions**:
- Fade out current content (0.2s)
- Update wheel state (0.4s)
- Fade in new content (0.3s)
- Total: ~0.9s transition, feels deliberate but not sluggish

**Survey progression**:
- Questions slide left-to-right on "Next"
- Slide right-to-left on "Back"
- 0.3s duration, smooth

**Wheel pulse** (when user is in Danger Zone):
- Stage 3 segment + Danger Zone overlay pulse together
- 2s cycle, 10% brightness variation
- Gentle, non-distracting

---

## Typography

**Primary Font**: Inter or similar sans-serif
- Headers: 600 weight
- Body: 400 weight
- Small text: 14px
- Body text: 18px
- Section headers: 24px
- Stage names: 48px

**Hierarchy**:
- Use color + size + weight together for clear information architecture
- Never rely on color alone (accessibility)

---

## Accessibility

- High contrast ratios (4.5:1 minimum)
- All interactive elements keyboard navigable
- Stage segments: Tab through, Enter to select
- Survey: Full keyboard support for all input types
- Screen reader: ARIA labels on wheel segments, clear form labels
- Reduced motion preference: Disable animations, use instant transitions

---

## Technical Notes for Implementation

**State Management**:
- Current mode (1 or 2)
- Current stage (if selected/diagnosed)
- Survey responses (array of objects)
- Conversation history (for Claude API)
- Personalization context (extracted from survey)

**Claude Function Calls** (available throughout):
- `update_wheel_state(stage, intensity, show_adjacent)`
- `display_stage_content(stage, emphasis, personalized_context)`
- `show_comparison(stages, comparison_type)`
- `suggest_resources(stage, resource_type)`

**Assets Needed**:
- Wheel SVG (six segments, customizable colors)
- Stage icons (6 simple glyphs representing each emotion)
- Attribute icons (heart, brain, person)
- Thinking/loading animation
- Privacy/lock icon
