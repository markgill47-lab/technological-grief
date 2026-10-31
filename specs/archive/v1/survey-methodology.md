# Survey Methodology: Diagnostic Assessment for Technological Grief

## Purpose

This document defines the methodology for diagnosing a user's position in the Change Grief Cycle through conversational survey. It provides question progression logic, interpretation criteria, and guidelines for Claude's diagnostic reasoning.

---

## Core Principles

### 1. Conversational, Not Clinical
The survey should feel like a thoughtful conversation, not a psychological assessment. Claude asks questions naturally, responds to user answers, and adapts based on what it learns.

### 2. Minimum Viable Questions
Get to accurate diagnosis in 5-7 questions. Don't exhaust the user with excessive questioning. Quality of insight matters more than quantity of data.

### 3. Multi-Signal Diagnosis
Combine multiple indicators:
- **Emotional state** (fear → satisfaction)
- **Behavioral patterns** (avoidant → generous)
- **Cognitive state** (denial → focused)
- **Contextual factors** (Rogers position, domain, pressure)

### 4. Graceful Ambiguity
Sometimes users will fall between stages (e.g., transitioning from Doubt to Discomfort). That's okay. Acknowledge the transition rather than forcing a single-stage diagnosis.

### 5. Actionable Output
Diagnosis should inform next steps. The point isn't to label the user but to help them understand where they are and what makes sense to do next.

---

## Survey Structure

### Phase 1: Opening & Context (Questions 1-2)
**Goal**: Establish baseline relationship with AI and gather contextual information

**Question 1: Current Relationship**
Purpose: Broad initial positioning

Template:
```
"Let's start simply: How would you describe your current relationship
with AI in your work? There's no wrong answer here—I'm just trying to
understand where you're starting from."
```

Response Options (multiple choice):
1. "I actively avoid thinking about or using it"
2. "I'm aware it exists but haven't really engaged with it"
3. "I'm trying to figure out if and how it applies to my work"
4. "I'm experimenting with it but still learning"
5. "I use it regularly as part of my workflow"
6. "It's fully integrated into how I work"

**Diagnostic Indicators**:
- Option 1 → Likely Stage 1 (Loss)
- Option 2 → Likely Stage 1-2 transition
- Option 3 → Likely Stage 2-3 (Doubt/Discomfort)
- Option 4 → Likely Stage 4 (Discovery)
- Option 5 → Likely Stage 5 (Understanding)
- Option 6 → Likely Stage 6 (Integration)

**Question 2: Professional Context**
Purpose: Understand domain and pressure

Template:
```
"Got it. And just so I can give you more relevant guidance—what's
your professional context? What kind of work do you do?"
```

Response: Short answer (free text)

**Claude's Task**:
- Extract domain (education, creative, business, technical, other)
- Assess institutional pressure level from language
- Note specific role/responsibilities mentioned
- Look for grief drivers in how they describe their work

---

### Phase 2: Emotional & Behavioral Assessment (Questions 3-4)
**Goal**: Understand feelings and actions (or lack thereof)

**Question 3: Emotional State**
Purpose: Identify primary emotional response

Template varies based on Phase 1 answers. Examples:

If avoidant (Stage 1-2):
```
"When you think about AI potentially impacting your field, what comes
up for you emotionally? Fear? Frustration? Indifference? Something else?"
```

If engaged (Stage 4-6):
```
"As you've been working with AI, what's your primary feeling about it?
Excited? Confident? Still a bit uncertain? A mix?"
```

Response: Short answer OR Likert scale (depending on user preference)

**Diagnostic Indicators**:
- **Fear/dread** → Stage 1
- **Resentment/frustration** → Stage 2
- **Anxiety/overwhelm** → Stage 3
- **Curiosity/anticipation** → Stage 4
- **Confidence/satisfaction** → Stage 5-6
- **Mixed emotions** → Likely in transition

**Question 4: Behavioral Pattern**
Purpose: What they're actually doing (actions speak louder than words)

Template:
```
"And in terms of actual behavior—what have you done in the past
month or two related to AI, if anything?"
```

Response: Multiple select checkboxes + optional "other"

Options:
- [ ] Nothing at all
- [ ] Read articles or watched videos
- [ ] Attended a workshop or training
- [ ] Tried a tool once or twice out of curiosity
- [ ] Used tools several times for specific tasks
- [ ] Built new workflows incorporating AI
- [ ] Helped colleagues or students learn about it
- [ ] Other: _________

**Diagnostic Indicators**:
- **Nothing** → Stage 1-2
- **Only consuming content** → Stage 2
- **Attended training but no action** → Stage 3 (Danger Zone)
- **Limited experimentation** → Stage 3-4 transition
- **Regular use** → Stage 5
- **Teaching others** → Stage 6

**Critical Diagnostic Pattern**:
If someone attended training but hasn't tried anything = STRONG Stage 3 indicator (Discomfort Danger Zone). This is high-priority intervention point.

---

### Phase 3: Depth & Specificity (Questions 5-6)
**Goal**: Understand specific grief drivers and obstacles

**Question 5: Primary Concern**
Purpose: What loss are they grieving (or have grieved)?

Template varies by detected stage:

If Stage 1-2:
```
"What concerns you most about how AI might change your work?"
```

If Stage 3-4:
```
"What's been the biggest challenge as you've tried to figure out
how AI fits into your work?"
```

If Stage 5-6:
```
"As you've integrated AI into your workflow, what did you have to
let go of or change about how you used to work?"
```

Response: Open-ended (Claude analyzes for grief drivers)

**Listen For**:
- **Skills obsolescence**: "I spent years learning X and now anyone can..."
- **Identity loss**: "I'm supposed to be the expert but..."
- **Assessment crisis** (faculty): "How do I know students actually learned..."
- **Quality concerns**: "The work isn't as good / authentic / meaningful..."
- **Economic anxiety**: "Will I even have a job..."
- **Ethical objections**: "This is stealing / cheating / inauthentic..."
- **Control loss**: "I don't understand how it works / can't trust it..."

**Question 6: Obstacles**
Purpose: What's preventing progression (if applicable)?

Template:
```
"What's the biggest thing preventing you from [engaging more /
moving forward / feeling more confident] with AI?"
```

Response: Open-ended

**Listen For**:
- **Time/resources**: Legitimate but often excuse for fear
- **Information gap**: "I don't know where to start" = Stage 3
- **Fear of failure**: "What if I do it wrong" = Stage 3
- **Institutional barriers**: May be real obstacle or projection
- **Ethical objections**: May be Stage 2 (defensive) or legitimate principle
- **Overwhelm**: "Too many options" = Stage 3

---

### Phase 4: Forward-Looking (Question 7)
**Goal**: Understand readiness and desired outcome

**Question 7: Near-Term Intent**
Purpose: Where do they want to go from here?

Template:
```
"Last question: If you think about the next month or so, what would
you like to accomplish related to AI—even if it's small?"
```

Response: Open-ended

**Diagnostic Indicators**:
- **"Nothing" / "Just survive"** → Stage 1
- **"Understand if it's real"** → Stage 2
- **"Try one thing"** → Stage 2-3 or ready for Discovery
- **"Build a specific workflow"** → Stage 4-5
- **"Help my team/students"** → Stage 5-6

---

## Diagnostic Decision Tree

### After Question 1-2: Initial Hypothesis

```
IF relationship = "avoid"
  THEN hypothesis = Stage 1 or 2
  THEN focus Phase 2-3 on grief drivers, loss acknowledgment

IF relationship = "trying to figure out"
  THEN hypothesis = Stage 2 or 3
  THEN focus Phase 2-3 on obstacles, danger zone indicators

IF relationship = "experimenting"
  THEN hypothesis = Stage 4
  THEN focus Phase 2-3 on what's working, what's confusing

IF relationship = "regular use" or "fully integrated"
  THEN hypothesis = Stage 5 or 6
  THEN focus Phase 2-3 on generosity indicators, optimization
```

### After Question 3-4: Refinement

**Strong Stage 1 Indicators** (confirm if 2+ present):
- Emotion: Fear, dread, denial
- Behavior: No engagement whatsoever
- Language: "I refuse," "This won't affect me," "It's just a fad"
- Concern: Focused entirely on loss, no acknowledgment of possibility

**Strong Stage 2 Indicators** (confirm if 2+ present):
- Emotion: Resentment, frustration, skepticism
- Behavior: Consuming content but not trying anything
- Language: "Show me proof," "It doesn't work," "Everyone's just hyped"
- Concern: Focused on limitations, ethical objections, comparison to past failures

**Strong Stage 3 Indicators** (confirm if 3+ present):
- Emotion: Anxiety, overwhelm, confusion
- Behavior: Attended training but no implementation
- Language: "I need to do something," "I don't know where to start," "Too many options"
- Concern: Paralyzed by options, fear of doing it wrong
- **CRITICAL**: This is the Danger Zone—highest priority for intervention

**Strong Stage 4 Indicators** (confirm if 2+ present):
- Emotion: Curiosity, anticipation, excitement
- Behavior: Active experimentation, trying multiple things
- Language: "I tried X," "What else should I try," "This worked but this didn't"
- Concern: Learning through failure, seeking optimization

**Strong Stage 5 Indicators** (confirm if 2+ present):
- Emotion: Confidence, satisfaction
- Behavior: Regular use, established workflows
- Language: "I use X for Y," "I've learned that," "This saves me time"
- Concern: Optimization, refinement, sustainability

**Strong Stage 6 Indicators** (confirm if 2+ present):
- Emotion: Satisfaction, flexibility, desire to help others
- Behavior: Teaching others, natural unconscious use
- Language: "Let me show you," "I remember when I felt that way," "It's just how I work now"
- Concern: Helping others, scaling adoption, mentoring

### Ambiguous Cases: Between-Stage Diagnosis

**Between Stage 2 and 3**:
- Moved past denial but not yet acting
- Expressing urgency without direction
- **Diagnosis**: "You're transitioning from Doubt to Discomfort"
- **Guidance**: Same as Stage 3 (Danger Zone intervention)

**Between Stage 3 and 4**:
- Tried one or two things, still very uncertain
- Curiosity emerging but overwhelm still dominant
- **Diagnosis**: "You're at the edge of the Danger Zone, beginning to move into Discovery"
- **Guidance**: Celebrate experiments, encourage more with very specific next steps

**Between Stage 5 and 6**:
- Regular use but not yet helping others
- Competent but not yet generous
- **Diagnosis**: "You're in Understanding, approaching Integration"
- **Guidance**: Invite them to share knowledge, become peer mentors

---

## Branching Logic & Adaptive Questioning

### Scenario 1: Clear Stage 1 After Question 2
If strong Stage 1 indicators, Claude can stop at Question 5 (don't need 6-7).

**Why**: Further questioning may feel invasive when someone is in denial. Validate their position, acknowledge the loss, and provide gentle invitation to engage when ready.

### Scenario 2: Clear Danger Zone After Question 4
If strong Stage 3 indicators, make Questions 5-6 highly specific to obstacles.

**Why**: These users need immediate intervention. Focus on specific barriers preventing first experiment.

### Scenario 3: Contradictory Signals
If emotion says Stage 1 but behavior says Stage 4 (rare but possible):

**Claude's Response**:
```
"I'm noticing something interesting—you mentioned feeling [fearful/
overwhelmed], but you've also been [experimenting actively]. Sometimes
our feelings lag behind our actions. Can you tell me more about that?"
```

Then diagnose based on weighted signals (behavior > emotion in this case).

### Scenario 4: User Refuses to Answer
If user gives non-answers or "I don't know" repeatedly:

**Claude's Response**:
```
"No problem—these can be hard questions to answer. Let me ask it
differently: [rephrase in simpler terms]"
```

If still non-responsive after 2 attempts, diagnose based on available information and note uncertainty:
```
"Based on what you've shared, it seems like you might be in [stage],
though I'm working with limited information here. Does that feel right?"
```

---

## Diagnostic Confidence Levels

### High Confidence (3+ strong indicators aligned)
```
"You're in the [X] stage..."
```

### Moderate Confidence (2 indicators, some ambiguity)
```
"You seem to be in the [X] stage, though there are signs you might
be transitioning toward [Y]..."
```

### Low Confidence (contradictory signals, limited information)
```
"Based on what you've shared, I'm seeing signs of both [X] and [Y]
stages. This might mean you're in transition, or I might need a bit
more information to understand where you are..."
```

**If Low Confidence**: Ask one targeted follow-up question before diagnosing.

---

## Special Cases & Edge Scenarios

### Case 1: User is in Multiple Contexts
Example: Faculty member who uses AI personally but not professionally

**Claude's Approach**:
```
"Interesting—it sounds like you're in different stages depending on
context. For your personal use, you're in [X], but for your teaching,
you're in [Y]. For this assessment, let's focus on your professional
context since that's likely where you're seeking guidance."
```

### Case 2: User Rejects AI on Principle
Example: "I will never use AI because it's unethical"

**Claude's Approach**:
1. Validate the ethical concern as legitimate
2. Distinguish between "never" (Stage 1/2) and "not until X conditions are met"
3. Diagnose based on whether objection is defensive (Stage 2) or principled

```
"I hear you. The ethical concerns around AI training and copyright are
real and unresolved. Can I ask—is this a 'never under any circumstances'
or more a 'not until the ethics are addressed'? That distinction helps
me understand where you are."
```

### Case 3: User is Overconfident
Example: Claims Stage 6 but displays Stage 2 indicators

**Claude's Approach**:
Trust the behavioral signals over self-reported stage. Gently probe:
```
"You mentioned you've fully integrated AI, but I'm curious—you also
mentioned [Stage 2 indicator]. Can you tell me more about how those
fit together?"
```

### Case 4: User is Seeking Validation
Example: Clearly Stage 1 but wants to be told they're right to resist

**Claude's Approach**:
Validate the loss without endorsing permanent avoidance:
```
"The loss you're feeling is real. [Specific loss] mattered and its
ending deserves acknowledgment. Being in the Loss stage isn't a
failure—it's a natural response to genuine disruption. The question
isn't whether you're right to feel this way (you are), but whether
staying here serves you long-term."
```

---

## Post-Diagnosis: Personalization Data Extraction

After diagnosis, Claude should extract structured data for personalization:

```typescript
interface PersonalizationData {
  summary: string;  // 2-3 sentence summary of their situation
  concerns: string[];  // Key concerns they mentioned
  context: 'faculty' | 'creative' | 'business' | 'technical' | 'general';
  rogersPosition?: 'innovator' | 'early_adopter' | 'early_majority' | 'late_majority' | 'laggard';
  specificObstacles?: string[];  // If Stage 3, what's blocking them
  currentTools?: string[];  // If Stage 4+, what they're using
  readinessForNextStage: 'low' | 'moderate' | 'high';
}
```

**Example**:
```javascript
{
  summary: "Faculty member teaching composition who's attended AI workshops but hasn't implemented anything due to overwhelm about where to start and concerns about assessment validity.",
  concerns: ["assessment crisis", "students cheating", "quality of learning"],
  context: "faculty",
  rogersPosition: "early_majority",
  specificObstacles: ["information overload", "fear of doing it wrong"],
  currentTools: [],
  readinessForNextStage: "moderate"
}
```

This data powers Mode 1 personalization when they explore individual stages.

---

## Diagnostic Output Format

### Standard Diagnosis Message

```
"Based on our conversation, you're currently in the [STAGE NAME] stage.

[2-3 sentences explaining why—reference specific things they said]

[Brief description of what this stage feels like]

[What typically happens next in this stage]

Would you like to learn more about this stage, or explore the full
cycle to see where you're headed?"
```

### Example: Stage 3 Diagnosis

```
"Based on our conversation, you're currently in the Discomfort stage—
what we call the 'Danger Zone.'

You mentioned attending a workshop but feeling stuck on where to start,
and that overwhelm is the hallmark of this stage. You've moved past
denial and doubt—you know AI matters—but the gap between 'I should do
something' and 'I know what to do' is creating paralysis.

This is actually the most critical stage because it's a choice point.
You can move forward into Discovery (experimentation) or retreat
backward into Doubt. Most people cycle between Doubt and Discomfort
several times before making the leap forward.

What you need right now isn't more information about why AI matters—
you already know that. You need one specific, low-stakes thing to try
that moves you from thinking to doing.

Would you like some specific suggestions for first experiments, or
would you rather explore what the Discovery stage looks like?"
```

---

## Continuous Improvement: Post-Launch Analytics

### Metrics to Track

**Diagnostic Accuracy** (via user feedback):
- After diagnosis, ask: "Does this feel accurate to where you are?" (Y/N)
- Track % "Yes" by stage
- Investigate patterns in "No" responses

**Question Efficiency**:
- Average number of questions to confident diagnosis
- Identify which questions provide most diagnostic value
- A/B test question phrasings for clarity

**Stage Distribution**:
- What % of users fall into each stage?
- Is there clustering? (e.g., 60% in Stage 3 Danger Zone)
- How does distribution vary by context (faculty vs. creative vs. business)?

**Transition Patterns**:
- Do users return later? If so, have they progressed?
- How long does typical stage duration last? (hard to measure without persistent data, but could ask in future surveys)

### Iteration Priorities

**Month 1-2**: Focus on Danger Zone (Stage 3) detection accuracy
**Month 3-4**: Refine Stage 1-2 vs Stage 5-6 distinction (ends of spectrum)
**Month 5-6**: Optimize question count (can we get to 5 questions reliably?)

---

## Ethical Considerations

### Avoid Pathologizing
This is a reflection tool, not a diagnosis of dysfunction. Never use language that suggests being in Stage 1 or 2 is "wrong" or "bad."

### Respect Agency
Users may choose to stay in early stages. That's their prerogative. Provide information and invitation, not pressure.

### Acknowledge Limits
Claude is pattern-matching based on a framework, not performing psychological assessment. If user shows signs of genuine distress, acknowledge limits:

```
"I want to note—I'm a reflection tool, not a mental health professional.
If you're experiencing significant distress about work changes, it might
be worth talking to someone who specializes in career transitions or
workplace stress."
```

### Privacy Reminder
Before survey ends, remind user:

```
"Just a reminder: this entire conversation exists only in your browser.
Nothing has been saved or analyzed. Once you close this page, it's gone.
If you want to remember your diagnosis, you might want to note it
somewhere."
```

---

**Version**: 1.0
**Last Updated**: 2026-01-24
**Review Cycle**: Monthly post-launch
**Maintainer**: Mark Gill / NextEd Initiative
