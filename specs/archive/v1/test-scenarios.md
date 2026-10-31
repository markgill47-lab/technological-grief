# Test Scenarios: Technological Grief Interactive Wheel

## Purpose

This document provides concrete test scenarios for validating the Grief Wheel application. It includes happy paths, edge cases, error conditions, and expected outcomes for both Mode 1 (Explore) and Mode 2 (Diagnose).

---

## Test Organization

Tests are organized by:
1. **Functional Tests**: Core features work as designed
2. **Integration Tests**: Claude API integration functions correctly
3. **User Journey Tests**: End-to-end scenarios
4. **Edge Case Tests**: Unusual or problematic scenarios
5. **Accessibility Tests**: Keyboard nav, screen readers, color contrast
6. **Performance Tests**: Load times, API response times

---

## Functional Tests: Mode 1 (Explore)

### FT-M1-01: Stage Selection via Click
**Preconditions**: Application loaded, Mode 1 active
**Steps**:
1. Click on "Discomfort" segment of wheel
2. Observe right panel content
3. Observe wheel visual state

**Expected Results**:
- Discomfort segment highlighted (100% opacity, cyan outline, 8px expansion)
- Adjacent segments (Doubt, Discovery) at 85% opacity
- Other segments at 30% opacity
- Right panel displays Discomfort stage content
- Transition animation takes ~0.4s

**Pass Criteria**: All expected results occur within 500ms

---

### FT-M1-02: Stage Navigation via Breadcrumb
**Preconditions**: Discovery stage selected
**Steps**:
1. Click "← Previous" breadcrumb link
2. Observe transition to Discomfort
3. Click "Next →" breadcrumb link twice
4. Observe transition to Discovery, then Understanding

**Expected Results**:
- Each click transitions to adjacent stage
- Wheel updates appropriately
- Content updates with smooth fade transition
- Navigation wraps (Integration → Loss when clicking Next)

**Pass Criteria**: Smooth navigation through all 6 stages

---

### FT-M1-03: Mode Toggle Functionality
**Preconditions**: Application loaded, Mode 1 active
**Steps**:
1. Click mode toggle to switch to Mode 2
2. Observe interface changes
3. Click toggle again to return to Mode 1

**Expected Results**:
- Toggle animates smoothly
- Wheel becomes non-interactive in Mode 2
- Right panel changes to Welcome Screen
- Mode 1 returns to previous state (or home state)
- Transition takes <300ms

**Pass Criteria**: Smooth mode switching without errors

---

### FT-M1-04: Hover States
**Preconditions**: Mode 1 active, desktop view
**Steps**:
1. Hover over Loss segment
2. Observe highlight
3. Hover over Integration segment
4. Move mouse off wheel

**Expected Results**:
- Hovered segment brightens to 100%
- Other segments dim to 40%
- Cursor changes to pointer
- No hover effect when segment already selected
- Smooth opacity transitions

**Pass Criteria**: Hover effects work on all segments

---

### FT-M1-05: Content Persistence with Personalization
**Preconditions**: User completed Mode 2 survey, returned to Mode 1
**Steps**:
1. Select any stage
2. Observe right panel content
3. Check for personalization section

**Expected Results**:
- Standard stage content displays
- Additional section appears: "Context for Your Situation"
- Section references specific concerns from survey
- Section has distinct styling (light yellow background)

**Pass Criteria**: Personalization appears when available, doesn't when not

---

## Functional Tests: Mode 2 (Diagnose)

### FT-M2-01: Survey Initialization
**Preconditions**: Application loaded, Mode 1 active
**Steps**:
1. Switch to Mode 2
2. Observe Welcome Screen
3. Click "Begin" button

**Expected Results**:
- Welcome screen displays with:
  - Headline: "Where are you in the change cycle?"
  - Subhead explaining purpose
  - Disclaimer: "This is a reflection tool, not a judgment"
  - Large cyan "Begin" button
- Clicking Begin transitions to Question 1
- Transition animates smoothly (slide left)

**Pass Criteria**: Welcome screen displays correctly, Begin initiates survey

---

### FT-M2-02: Multiple Choice Question Flow
**Preconditions**: Survey started, Question 1 displayed
**Steps**:
1. Select option 3: "I'm trying to figure out if and how it applies to my work"
2. Observe "Next" button activation
3. Click "Next"
4. Observe transition to Question 2

**Expected Results**:
- Next button disabled until selection made
- Next button turns cyan when active
- Selection is visually confirmed (radio button filled)
- Smooth slide transition to next question
- Question counter updates (1 of 6 → 2 of 6)

**Pass Criteria**: Selection, navigation work smoothly

---

### FT-M2-03: Short Answer Question Handling
**Preconditions**: Survey in progress, short answer question displayed
**Steps**:
1. Type response: "I'm worried students will use it to cheat"
2. Click "Next"
3. Use "Back" button
4. Verify response preserved

**Expected Results**:
- Text area accepts input
- Character count displays (if implemented)
- Next button activates after typing begins
- Back button preserves entered text
- Response sent to Claude on Next

**Pass Criteria**: Text input and preservation work correctly

---

### FT-M2-04: Likert Scale Question
**Preconditions**: Survey in progress, Likert question displayed
**Steps**:
1. Drag slider to "Strongly Agree" position
2. Observe current value display
3. Click "Next"

**Expected Results**:
- Slider moves smoothly
- Current selection displays clearly
- Endpoint labels visible ("Strongly Disagree" ↔ "Strongly Agree")
- Next activates immediately on interaction

**Pass Criteria**: Slider functions correctly, value captured

---

### FT-M2-05: Survey Completion and Diagnosis
**Preconditions**: User on final survey question
**Steps**:
1. Answer final question
2. Click "Next"
3. Observe "Thinking" screen
4. Wait for diagnosis
5. Observe diagnosis screen

**Expected Results**:
- Thinking screen displays with animation
- Duration: 2-3 seconds minimum
- Wheel on left shows subtle animation
- Diagnosis screen displays:
  - Top: "You're currently in: [STAGE NAME]"
  - Middle: Personalized interpretation
  - Bottom: Two action buttons
- Wheel on left highlights diagnosed stage dramatically

**Pass Criteria**: Full flow from final question to diagnosis works

---

### FT-M2-06: Post-Diagnosis Navigation
**Preconditions**: Diagnosis screen displayed
**Steps**:
1. Click "Learn about this stage"
2. Verify Mode 1 activated with current stage selected
3. Return to Mode 2 (via toggle)
4. Click "See the full cycle"
5. Verify Mode 1 activated showing overview

**Expected Results**:
- "Learn about this stage" → Mode 1, current stage highlighted, personalized content
- "See the full cycle" → Mode 1, no specific stage selected (or home view)
- Mode switching preserves diagnosis context

**Pass Criteria**: Post-diagnosis navigation works correctly

---

## Integration Tests: Claude API

### IT-01: Mode 1 Content Generation
**Preconditions**: Application loaded, API key configured
**Steps**:
1. Select Discovery stage in Mode 1
2. Wait for Claude response
3. Observe generated content

**Expected Results**:
- API call made to Claude with appropriate prompt
- Response received within 2-3 seconds
- Content displays in right panel
- Content includes:
  - Stage description
  - What You Might Experience section
  - Why This Happens
  - Moving Forward
- Content is natural language, not generic template

**Pass Criteria**: Content generated successfully, displays correctly

**Validation Points**:
- Check network tab for API call
- Verify request includes system prompt with framework context
- Verify response includes `display_stage_content` tool call

---

### IT-02: Survey Question Adaptation
**Preconditions**: Survey in progress, Question 3 about to display
**Steps**:
1. Complete Questions 1-2 with specific responses
2. Observe Question 3
3. Verify it's contextually relevant

**Expected Results**:
- Question 3 adapts based on Q1-2 responses
- If user said "avoid AI" → Question focuses on fear/loss
- If user said "experimenting" → Question focuses on challenges
- Claude maintains conversation history
- Question feels natural, not scripted

**Pass Criteria**: Questions adapt to context, conversation feels coherent

---

### IT-03: Tool Use: update_wheel_state
**Preconditions**: Survey diagnosis in progress
**Steps**:
1. Complete survey
2. Monitor Claude response during diagnosis
3. Verify tool call made

**Expected Results**:
- Claude's response includes `update_wheel_state` tool use
- Tool call parameters:
  - stage: [diagnosed stage]
  - intensity: "strong"
  - show_adjacent: true/false
- Application processes tool call
- Wheel visual state updates accordingly

**Pass Criteria**: Tool call made and processed correctly

**Debug Check**:
```javascript
// In console, verify tool call structure:
{
  "type": "tool_use",
  "name": "update_wheel_state",
  "input": {
    "stage": "discomfort",
    "intensity": "strong",
    "show_adjacent": true
  }
}
```

---

### IT-04: API Error Handling - Rate Limit
**Preconditions**: Rate limit artificially triggered (or naturally hit)
**Steps**:
1. Trigger rate limit (429 response)
2. Observe application behavior

**Expected Results**:
- Application shows loading indicator
- Automatic retry with exponential backoff
- If successful after retry: content displays
- If max retries exceeded: User-friendly error message
  - "We're experiencing high demand. Please try again in a moment."
  - Retry button available
- No application crash

**Pass Criteria**: Graceful handling, no data loss, retry works

---

### IT-05: API Error Handling - Overloaded
**Preconditions**: Claude API overloaded (529 response)
**Steps**:
1. Trigger overload scenario
2. Observe application behavior

**Expected Results**:
- Similar to IT-04
- Retry with 2x delay
- User-friendly message if persistent
- Application remains functional for non-API features (wheel interaction)

**Pass Criteria**: Graceful degradation

---

### IT-06: Network Timeout
**Preconditions**: Network delay simulated (>30s)
**Steps**:
1. Make API call with simulated delay
2. Wait for timeout
3. Observe error handling

**Expected Results**:
- Loading indicator for reasonable duration (10-15s)
- Timeout message after threshold
- "This is taking longer than expected. The AI might be busy. Retry?"
- Retry and Cancel options
- No hanging state

**Pass Criteria**: Timeout handled gracefully

---

### IT-07: Malformed API Response
**Preconditions**: API returns unexpected format
**Steps**:
1. Mock malformed response
2. Observe error handling

**Expected Results**:
- Application catches parsing error
- Fallback to generic content or clear error message
- No console errors that crash app
- User can continue using other features

**Pass Criteria**: No crash, graceful fallback

---

## User Journey Tests

### UJ-01: First-Time User - Exploration Path
**Persona**: Faculty member, curious but cautious
**Steps**:
1. Land on application
2. Read any intro text
3. Click through 2-3 stages in Mode 1
4. Switch to Mode 2
5. Complete survey
6. Return to Mode 1 with personalization

**Expected Results**:
- Clear value proposition on landing
- Intuitive navigation through stages
- Smooth transition to survey
- Survey feels conversational, not interrogative
- Diagnosis feels accurate and helpful
- Personalized Mode 1 content references survey responses

**Pass Criteria**: Complete journey without confusion or frustration

**Success Metrics**:
- Time to complete: 8-12 minutes
- No backtracking due to confusion
- Post-test survey: "I understand where I am now" (Agree/Strongly Agree)

---

### UJ-02: Returning User - Quick Diagnosis
**Persona**: Business professional, wants quick assessment
**Steps**:
1. Land on application
2. Immediately switch to Mode 2
3. Complete survey quickly (minimal responses)
4. Get diagnosis
5. Exit

**Expected Results**:
- Can skip Mode 1 entirely
- Survey works with brief responses
- Diagnosis still accurate (even with less data)
- Complete journey in <5 minutes

**Pass Criteria**: Fast path works without compromising accuracy

---

### UJ-03: Skeptical User - Doubt Stage Journey
**Persona**: Late majority adopter, very skeptical of AI hype
**Survey Responses**:
- Q1: "I'm aware it exists but haven't really engaged"
- Q2: Role = "Mid-level manager, manufacturing"
- Q3: Emotion = "Frustration and skepticism"
- Q4: Behavior = "Read articles, nothing else"
- Q5: Concern = "It's overhyped, won't work in my industry"
- Q6: Obstacle = "I've seen tech fads before"

**Expected Diagnosis**: Stage 2 (Doubt)

**Expected Guidance**:
- Validation of skepticism as rational
- Acknowledgment that some concerns are legitimate
- Challenge to distinguish productive skepticism from defensive resistance
- Invitation to define what evidence would change their mind

**Pass Criteria**:
- Diagnosis = Doubt
- Guidance doesn't dismiss their concerns
- Guidance also doesn't endorse permanent avoidance

---

### UJ-04: Overwhelmed User - Danger Zone Journey
**Persona**: Faculty member, attended workshops but paralyzed
**Survey Responses**:
- Q1: "I'm trying to figure out if and how it applies"
- Q2: Role = "English professor, composition"
- Q3: Emotion = "Anxiety and overwhelm"
- Q4: Behavior = "Attended workshop, tried tool once"
- Q5: Concern = "Don't know where to start, afraid of doing it wrong"
- Q6: Obstacle = "Too many tools, unclear which to use"

**Expected Diagnosis**: Stage 3 (Discomfort - Danger Zone)

**Expected Guidance**:
- Recognition of the Directional Paradox
- Emphasis that confusion is not incompetence
- ONE specific, low-stakes experiment
- Example: "Ask ChatGPT to explain [concept] three ways"
- Psychological safety: "You cannot break anything"

**Pass Criteria**:
- Diagnosis = Discomfort
- Guidance includes specific first step
- User feels less overwhelmed after reading

---

### UJ-05: Engaged User - Discovery Journey
**Persona**: Creative professional, actively experimenting
**Survey Responses**:
- Q1: "I'm experimenting with it but still learning"
- Q2: Role = "Graphic designer, freelance"
- Q3: Emotion = "Curiosity mixed with some uncertainty"
- Q4: Behavior = "Used tools several times, tried different approaches"
- Q5: Concern = "Still figuring out when AI is useful vs. when it's not"
- Q6: Obstacle = "Learning what works through trial and error"

**Expected Diagnosis**: Stage 4 (Discovery)

**Expected Guidance**:
- Celebration of their experimentation
- Encouragement to keep trying things
- Pattern recognition: Track what works vs. what doesn't
- Suggestion to share experiments with peers
- Reassurance that "failure" is part of learning

**Pass Criteria**:
- Diagnosis = Discovery
- Guidance encourages continued exploration
- User feels validated in their approach

---

### UJ-06: Advanced User - Integration Journey
**Persona**: Early adopter, using AI extensively, wants to help others
**Survey Responses**:
- Q1: "It's fully integrated into how I work"
- Q2: Role = "Product manager, tech startup"
- Q3: Emotion = "Confident and satisfied"
- Q4: Behavior = "Built new workflows, help colleagues learn"
- Q5: Concern = "Want to help team adopt more effectively"
- Q6: Goal = "Scale adoption across organization"

**Expected Diagnosis**: Stage 6 (Integration)

**Expected Guidance**:
- Recognition of their "generosity"
- Validation that helping others is valuable
- Guidance on peer mentorship strategies
- Emphasis on meeting others where they are
- Reminder that not everyone is ready for their level

**Pass Criteria**:
- Diagnosis = Integration
- Guidance leverages their desire to help others
- Tactical advice on mentoring

---

## Edge Case Tests

### EC-01: User Contradicts Themselves
**Scenario**: Emotional state says Stage 1, behavior says Stage 4
**Example Responses**:
- Q1: "I'm experimenting with it but still learning"
- Q3: "Fear and dread"
- Q4: "Used tools several times"

**Expected Behavior**:
- Claude notices contradiction
- Asks clarifying question: "You mentioned feeling fearful, but you've also been experimenting actively. Can you tell me more about that?"
- Waits for clarification
- Diagnoses based on weighted signals (behavior > emotion)

**Pass Criteria**: Contradiction addressed, accurate diagnosis

---

### EC-02: User Refuses to Answer Multiple Questions
**Scenario**: User gives "I don't know" or skips 3+ questions
**Steps**:
1. Answer Q1 normally
2. Skip or say "I don't know" to Q2, Q3, Q4
3. Observe Claude response

**Expected Behavior**:
- After 2 "I don't know" responses, Claude rephrases questions
- After 3, Claude works with available data
- Diagnosis includes uncertainty acknowledgment:
  - "Based on limited information, you might be in [X], but I'm not certain. Does that feel right?"
- User can still get value from general stage exploration

**Pass Criteria**: Application doesn't break, diagnosis still provided (with caveats)

---

### EC-03: User Clicks Back Multiple Times
**Scenario**: User goes backward through survey, changes answers
**Steps**:
1. Answer questions 1-4
2. Click Back to Q3
3. Change answer
4. Click Back to Q2
5. Click Next to Q3
6. Continue to Q5

**Expected Behavior**:
- Previous answers preserved when going back
- Changes are captured when modified
- Conversation history updated appropriately
- No duplicate questions
- Claude incorporates updated information

**Pass Criteria**: Survey flow handles backtracking correctly

---

### EC-04: User on Ethical Principle (Never Will Use)
**Scenario**: User has principled objection to AI
**Example Response**:
- Q5: "I will never use AI because it violates copyright and exploits artists"

**Expected Behavior**:
- Claude validates concern as legitimate
- Distinguishes between defensive resistance (Stage 2) and principled stance
- Asks: "Is this 'never under any circumstances' or 'not until ethics are addressed'?"
- Diagnosis acknowledges ethical dimension
- Guidance respects their position while noting:
  - Understanding AI helps advocate for ethical alternatives
  - Can engage with concept without personal use

**Pass Criteria**: Ethical objections respected, nuanced guidance provided

---

### EC-05: Multiple Contexts (Personal vs. Professional)
**Scenario**: User uses AI personally but not professionally
**Example**:
- "I use ChatGPT at home all the time, but I don't use it for teaching"

**Expected Behavior**:
- Claude recognizes split context
- Asks which context to focus on
- Diagnoses for specified context (usually professional)
- Acknowledges different stages in different contexts

**Pass Criteria**: Context handled appropriately

---

### EC-06: Mobile Device, Small Screen
**Preconditions**: View on mobile (375px width)
**Steps**:
1. Load application
2. Navigate through Mode 1
3. Complete survey in Mode 2

**Expected Results**:
- Wheel stacks above content (not side-by-side)
- Wheel scales down to 360px
- Touch interactions work (tap, not hover)
- Survey questions readable, input elements accessible
- Mode toggle remains accessible
- All functionality works

**Pass Criteria**: Full functionality on mobile

---

### EC-07: Screen Reader Navigation
**Preconditions**: Screen reader active (NVDA, JAWS, or VoiceOver)
**Steps**:
1. Navigate application with keyboard only
2. Use screen reader to understand wheel segments
3. Complete survey with screen reader
4. Navigate Mode 1 content

**Expected Results**:
- Wheel segments have clear ARIA labels
- Tab order logical
- Screen reader announces stage changes
- Survey questions clearly read
- All interactive elements keyboard accessible
- Skip links available for long content

**Pass Criteria**: Full accessibility compliance

---

### EC-08: Reduced Motion Preference
**Preconditions**: User has "prefers-reduced-motion" set
**Steps**:
1. Load application
2. Navigate through stages
3. Switch modes
4. Complete survey

**Expected Results**:
- All animations disabled or reduced
- Transitions instant or very brief (<100ms)
- Functionality unchanged
- No jarring jumps (content still fades in/out, just faster)

**Pass Criteria**: Respects reduced motion preference

---

### EC-09: Session Timeout / Inactivity
**Scenario**: User leaves application open for 30+ minutes
**Steps**:
1. Start survey, complete 3 questions
2. Leave browser idle for 30 minutes
3. Return and try to continue

**Expected Behavior**:
- Session data preserved in SessionStorage
- Claude conversation might need to reconnect
- If API call fails after inactivity, retry logic kicks in
- User can continue or start fresh

**Pass Criteria**: Graceful handling of inactivity

---

### EC-10: Concurrent Tab Sessions
**Scenario**: User opens application in two tabs
**Steps**:
1. Open application in Tab 1
2. Complete survey, get diagnosis
3. Open application in Tab 2
4. Observe Tab 2 state

**Expected Behavior**:
- Each tab has independent session
- No data sharing between tabs
- No conflicts or errors
- User can use both independently

**Pass Criteria**: Tabs don't interfere with each other

---

## Performance Tests

### PT-01: Initial Page Load
**Test**: Measure time to first contentful paint, time to interactive
**Target**:
- First Contentful Paint: <1.5s (desktop, cable)
- Time to Interactive: <3s
- Largest Contentful Paint: <2.5s

**Pass Criteria**: Meets Web Vitals "Good" thresholds

---

### PT-02: Mode 1 Stage Switching
**Test**: Measure transition time between stages
**Target**: <500ms total from click to content visible

**Breakdown**:
- Claude API call: <2s
- Content fade transition: 0.9s
- Total: <3s

**Pass Criteria**: Feels responsive, not sluggish

---

### PT-03: Mode 2 Survey Progression
**Test**: Measure time from answer submission to next question
**Target**:
- Question transition: <300ms
- Claude thinking time (between questions): <1.5s
- Total: <2s

**Pass Criteria**: Survey feels conversational, not laggy

---

### PT-04: Diagnosis Generation
**Test**: Measure time from final answer to diagnosis display
**Target**:
- Minimum: 2s (artificial floor for "Thinking" screen)
- Maximum: 5s
- Average: 3s

**Pass Criteria**: Fast enough to feel responsive, slow enough to feel thoughtful

---

### PT-05: Concurrent Users (Stress Test)
**Test**: Simulate 100 concurrent users
**Scenarios**:
- 50 users in Mode 1 (clicking through stages)
- 50 users in Mode 2 (completing surveys)

**Measure**:
- API rate limit hits
- Response time degradation
- Error rate

**Target**:
- No crashes
- <10% of requests hit rate limits
- Average response time <3s

**Pass Criteria**: Handles concurrent load gracefully

---

## Accessibility Tests

### AT-01: Keyboard Navigation
**Test**: Navigate entire application without mouse

**Checklist**:
- [ ] Tab order is logical
- [ ] All interactive elements reachable
- [ ] Focus indicators visible
- [ ] Wheel segments selectable via Enter/Space
- [ ] Survey inputs keyboard-accessible
- [ ] Mode toggle keyboard-accessible
- [ ] No keyboard traps

**Pass Criteria**: Complete all tasks with keyboard only

---

### AT-02: Color Contrast
**Test**: Verify all text meets WCAG AA standards

**Check**:
- Body text (18px on #2A2D34): Ratio 4.5:1 minimum
- Large text (24px+ on #2A2D34): Ratio 3:1 minimum
- Stage names on wheel segments: Ratio 4.5:1
- Buttons: Ratio 4.5:1
- Links: Ratio 4.5:1

**Pass Criteria**: All combinations meet or exceed requirements

---

### AT-03: Screen Reader Content
**Test**: Verify meaningful content announced

**Checklist**:
- [ ] Wheel segments have descriptive labels
- [ ] Stage changes announced
- [ ] Form labels clear and associated
- [ ] Error messages announced
- [ ] Loading states announced
- [ ] Dynamic content changes announced (ARIA live regions)

**Pass Criteria**: Screen reader user can complete all tasks

---

### AT-04: Focus Management
**Test**: Verify focus moves logically

**Scenarios**:
- Mode switch: Focus moves to first interactive element in new mode
- Survey progression: Focus moves to next question heading
- Diagnosis: Focus moves to diagnosis heading
- Modal/overlay: Focus trapped inside, returns on close

**Pass Criteria**: Focus never lost, always logical

---

## Testing Tools & Environment

### Required Tools
- **Unit Tests**: Vitest
- **E2E Tests**: Playwright
- **Accessibility**: axe-core, WAVE
- **Performance**: Lighthouse, WebPageTest
- **API Mocking**: MSW (Mock Service Worker)

### Test Environments
- **Development**: `localhost:5173`
- **Staging**: `staging.griefwheel.example.com`
- **Production**: `griefwheel.example.com`

### Browser Matrix
| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | Latest 2 | High |
| Firefox | Latest 2 | High |
| Safari | Latest 2 | High |
| Edge | Latest 2 | Medium |
| Mobile Safari (iOS) | 14+ | High |
| Chrome Android | Latest | Medium |

### Device Testing
- Desktop: 1920x1080, 1366x768
- Tablet: iPad (768x1024), iPad Pro (1024x1366)
- Mobile: iPhone 12 (390x844), Pixel 5 (393x851)

---

## Test Execution Plan

### Phase 1: Development (Continuous)
- Unit tests run on every commit
- Integration tests run on every PR
- Accessibility tests run on every PR

### Phase 2: Pre-Launch
- Full E2E test suite
- Manual testing across browser matrix
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Performance audit with Lighthouse
- Security review

### Phase 3: Post-Launch
- Monitor error rates (Sentry or similar)
- Track performance metrics (Web Vitals)
- Collect user feedback
- A/B test variations

### Phase 4: Ongoing
- Regression tests on every release
- Quarterly accessibility audit
- Monthly performance review
- Continuous user feedback integration

---

## Success Criteria Summary

**Functional**:
- 100% of core features work as designed
- <1% error rate in production

**Performance**:
- Core Web Vitals: All "Good" thresholds
- API response time: <3s average
- Page load: <2s (desktop, cable)

**Accessibility**:
- WCAG 2.1 AA compliance: 100%
- Screen reader usability: No critical issues
- Keyboard navigation: 100% coverage

**User Experience**:
- Survey completion rate: >80%
- Post-diagnosis satisfaction: >4.0/5.0
- Mode 1 engagement: >3 stages viewed per session

---

## Appendix: Mock Data for Testing

### Mock Survey Responses - Stage 3 User

```json
{
  "responses": [
    {
      "questionId": "q1-relationship",
      "response": "trying_to_figure_out"
    },
    {
      "questionId": "q2-context",
      "response": "Faculty, teaching writing"
    },
    {
      "questionId": "q3-emotion",
      "response": "Anxiety and overwhelm"
    },
    {
      "questionId": "q4-behavior",
      "response": ["attended_workshop", "tried_once"]
    },
    {
      "questionId": "q5-concern",
      "response": "Don't know where to start with all the different tools"
    },
    {
      "questionId": "q6-obstacle",
      "response": "Afraid of doing it wrong or wasting time"
    },
    {
      "questionId": "q7-goal",
      "response": "Try one thing successfully"
    }
  ]
}
```

### Mock Claude API Response - Diagnosis

```json
{
  "id": "msg_123abc",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "tool_use",
      "id": "toolu_abc123",
      "name": "update_wheel_state",
      "input": {
        "stage": "discomfort",
        "intensity": "strong",
        "show_adjacent": true
      }
    },
    {
      "type": "text",
      "text": "Based on our conversation, you're currently in the Discomfort stage—what we call the 'Danger Zone.'\n\nYou mentioned attending a workshop but feeling stuck on where to start, and that overwhelm is the hallmark of this stage. You've moved past denial and doubt—you know AI matters—but the gap between 'I should do something' and 'I know what to do' is creating paralysis.\n\nThis is actually the most critical stage because it's a choice point. You can move forward into Discovery (experimentation) or retreat backward into Doubt.\n\nWhat you need right now isn't more information—you need one specific, low-stakes thing to try. For your writing courses, here's a tiny first experiment: Ask ChatGPT to explain a concept from your syllabus in three different ways—one for visual learners, one using a pop culture analogy, and one in simple terms. Just see what it generates. You're not using this in class yet—you're just exploring.\n\nWould you like to learn more about the Discomfort stage, or explore what Discovery looks like when you move through?"
    }
  ],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 1250,
    "output_tokens": 220
  }
}
```

---

**Version**: 1.0
**Last Updated**: 2026-01-24
**Review Cycle**: After each sprint
**Maintainer**: Mark Gill / NextEd Initiative
