# Software Design Document: Technological Grief Interactive Wheel

## 1. Executive Summary

### 1.1 Purpose
This document describes the software architecture and implementation strategy for the Technological Grief Interactive Wheel, an educational and diagnostic tool that helps users understand their position in the Change Grief Cycle relative to AI adoption and technological change.

### 1.2 Scope
The application provides two primary modes:
- **Mode 1 (Explore)**: Educational interface allowing users to explore the six stages of technological grief
- **Mode 2 (Diagnose)**: Interactive survey that uses Claude AI to diagnose a user's current stage and provide personalized guidance

### 1.3 Key Requirements
- Single-page application (SPA) with no persistent user data
- Integration with Anthropic Claude API for content generation and survey analysis
- Session-based conversation memory (ephemeral)
- Responsive design supporting desktop, tablet, and mobile
- WCAG 2.1 AA accessibility compliance

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Client                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              React Application Layer                     ││
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  ││
│  │  │   UI Layer  │  │ State Manager│  │ Claude Client │  ││
│  │  │  (Components│  │   (Zustand)  │  │   Interface   │  ││
│  │  │     /View)  │  └──────────────┘  └───────────────┘  ││
│  │  └─────────────┘                                         ││
│  │         │                                                 ││
│  │         ▼                                                 ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │         Session Storage (Conversation History)       │││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│                            │ HTTPS                           │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │           Anthropic Claude API (Messages)                ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

**Frontend Framework**:
- React 18+ (with hooks)
- TypeScript for type safety
- Vite for build tooling

**State Management**:
- Zustand (lightweight, session-based state)
- React Context for theme/accessibility settings

**UI Components**:
- Custom components built with Tailwind CSS
- Framer Motion for animations
- SVG manipulation library (react-svg or native)

**API Integration**:
- Anthropic SDK (@anthropic-ai/sdk)
- Fetch API with retry logic

**Development Tools**:
- ESLint + Prettier for code quality
- Vitest for unit testing
- Playwright for E2E testing

---

## 3. Component Architecture

### 3.1 Component Hierarchy

```
App
├── Layout
│   ├── LeftPanel
│   │   ├── GriefWheel (interactive SVG)
│   │   ├── ModeToggle
│   │   ├── SessionReset
│   │   └── PrivacyBadge
│   └── RightPanel
│       ├── Mode1Content (Explore)
│       │   ├── StageHeader
│       │   ├── StageOverview
│       │   ├── ExperienceGrid
│       │   ├── WhyThisHappens
│       │   ├── MovingForward
│       │   └── PersonalizedContext
│       └── Mode2Content (Diagnose)
│           ├── WelcomeScreen
│           ├── SurveyQuestion
│           ├── ThinkingScreen
│           └── DiagnosisScreen
├── ClaudeProvider (context)
└── AccessibilityProvider (context)
```

### 3.2 Key Components

#### 3.2.1 GriefWheel Component
```typescript
interface GriefWheelProps {
  currentStage: Stage | null;
  intensity: 'subtle' | 'moderate' | 'strong';
  mode: 'explore' | 'diagnose';
  onStageSelect?: (stage: Stage) => void;
  isInteractive: boolean;
}

// Renders 6-segment SVG wheel with dynamic styling
// Handles click/hover interactions
// Animates transitions between stages
```

#### 3.2.2 Mode1Content Component
```typescript
interface Mode1ContentProps {
  stage: Stage;
  personalizedContext?: PersonalizationData;
}

// Fetches stage-specific content from Claude
// Displays educational information
// Provides navigation between stages
```

#### 3.2.3 Mode2Content Component
```typescript
interface Mode2ContentProps {
  onDiagnosisComplete: (stage: Stage, context: PersonalizationData) => void;
}

// Manages survey flow
// Sends responses to Claude for analysis
// Displays diagnosis results
```

---

## 4. State Management

### 4.1 Application State

```typescript
interface AppState {
  // Core state
  mode: 'explore' | 'diagnose';
  currentStage: Stage | null;

  // Survey state
  surveyResponses: SurveyResponse[];
  surveyProgress: number;

  // Claude conversation
  conversationHistory: Message[];
  isClaudeThinking: boolean;

  // Personalization
  personalizationContext: PersonalizationData | null;

  // UI state
  wheelIntensity: 'subtle' | 'moderate' | 'strong';
  showAdjacentStages: boolean;

  // Actions
  setMode: (mode: 'explore' | 'diagnose') => void;
  selectStage: (stage: Stage) => void;
  addSurveyResponse: (response: SurveyResponse) => void;
  resetSession: () => void;
  updateWheelState: (stage: Stage, intensity: string, showAdjacent: boolean) => void;
}
```

### 4.2 Session Persistence

- All state stored in SessionStorage (not LocalStorage)
- Conversation history maintained only during active session
- Clear warning to user: "This conversation is ephemeral"
- Session cleared on:
  - Browser tab close
  - Manual "Start Fresh" button
  - 30 minutes of inactivity (optional)

---

## 5. Claude API Integration

### 5.1 API Configuration

```typescript
const claudeClient = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-20250514';
```

### 5.2 Function Calling Schema

Claude can invoke these functions to manipulate the UI:

```typescript
const tools = [
  {
    name: 'update_wheel_state',
    description: 'Update the grief wheel visual state',
    input_schema: {
      type: 'object',
      properties: {
        stage: {
          type: 'string',
          enum: ['loss', 'doubt', 'discomfort', 'discovery', 'understanding', 'integration'],
          description: 'The stage to highlight'
        },
        intensity: {
          type: 'string',
          enum: ['subtle', 'moderate', 'strong'],
          description: 'How prominently to highlight the stage'
        },
        show_adjacent: {
          type: 'boolean',
          description: 'Whether to also highlight adjacent stages'
        }
      },
      required: ['stage', 'intensity']
    }
  },
  {
    name: 'display_stage_content',
    description: 'Populate the right panel with stage-specific information',
    input_schema: {
      type: 'object',
      properties: {
        stage: {
          type: 'string',
          enum: ['loss', 'doubt', 'discomfort', 'discovery', 'understanding', 'integration']
        },
        emphasis: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['what_causes_this', 'feelings', 'behaviors', 'next_steps']
          },
          description: 'Which aspects to emphasize in the explanation'
        },
        personalized_context: {
          type: 'string',
          description: 'Optional personalization based on survey responses'
        }
      },
      required: ['stage']
    }
  },
  {
    name: 'show_comparison',
    description: 'Display multiple stages for comparison',
    input_schema: {
      type: 'object',
      properties: {
        stages: {
          type: 'array',
          items: { type: 'string' },
          description: 'Stages to compare'
        },
        comparison_type: {
          type: 'string',
          enum: ['adjacent', 'before_after', 'full_cycle'],
          description: 'Type of comparison to display'
        }
      },
      required: ['stages', 'comparison_type']
    }
  },
  {
    name: 'suggest_resources',
    description: 'Provide stage-specific resources or next actions',
    input_schema: {
      type: 'object',
      properties: {
        stage: { type: 'string' },
        resource_type: {
          type: 'string',
          enum: ['educational', 'actionable', 'institutional'],
          description: 'Type of resources to suggest'
        }
      },
      required: ['stage', 'resource_type']
    }
  }
];
```

### 5.3 System Prompt Strategy

Two different system prompts depending on mode:

**Mode 1 System Prompt** (Educational):
```
You are an expert guide helping users understand the Change Grief Cycle
as it relates to technological change, particularly AI adoption.

You have access to the complete framework document (provided in context).

When a user selects a stage on the grief wheel:
1. Provide clear, empathetic explanation of that stage
2. Use the update_wheel_state function to highlight relevant stages
3. Use display_stage_content to populate educational information
4. Adapt your language based on the user's apparent literacy level
5. If the user previously completed a survey, reference their specific situation

Remember: Every interaction is unique. Vary your explanations naturally
while maintaining conceptual consistency.
```

**Mode 2 System Prompt** (Diagnostic):
```
You are a diagnostic assistant helping users identify their position in
the Change Grief Cycle relative to AI adoption.

You will conduct a conversational survey (5-7 questions) to assess:
- Their current relationship with AI/technology
- Emotional state (fear, anxiety, excitement, confidence)
- Behavioral patterns (avoidance, experimentation, integration)
- Professional context (faculty, creative, business)

After gathering responses:
1. Analyze which stage best fits their situation
2. Consider the "Grief Gap" (Rogers position vs. Gartner maturity)
3. Use update_wheel_state to visually indicate their stage
4. Provide empathetic, personalized interpretation
5. Extract PersonalizationData for use in Mode 1

Be conversational, not clinical. This is reflection, not judgment.
```

### 5.4 API Call Flow

**Mode 1 (Stage Exploration)**:
```typescript
async function exploreStage(stage: Stage, context?: PersonalizationData) {
  const messages = [
    {
      role: 'user',
      content: `Tell me about the ${stage} stage${
        context ? `, considering my situation: ${context.summary}` : ''
      }`
    }
  ];

  const response = await claudeClient.messages.create({
    model: MODEL,
    max_tokens: 2048,
    tools: tools,
    messages: [...conversationHistory, ...messages]
  });

  // Handle tool calls and text response
  processClaudeResponse(response);
}
```

**Mode 2 (Survey Flow)**:
```typescript
async function processSurveyResponse(userAnswer: string) {
  const messages = [
    {
      role: 'user',
      content: userAnswer
    }
  ];

  const response = await claudeClient.messages.create({
    model: MODEL,
    max_tokens: 1024,
    tools: tools,
    messages: [...conversationHistory, ...messages]
  });

  // Check if Claude is ready to diagnose or needs more questions
  if (isReadyToDiagnose(response)) {
    await performDiagnosis();
  } else {
    displayNextQuestion(response);
  }
}
```

### 5.5 Error Handling

```typescript
async function safeClaudeCall(apiCall: () => Promise<any>) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.status === 429) {
        // Rate limit - exponential backoff
        await sleep(RETRY_DELAY * Math.pow(2, attempt));
        continue;
      } else if (error.status === 529) {
        // Overloaded - wait and retry
        await sleep(RETRY_DELAY * 2);
        continue;
      } else {
        // Other errors - show user-friendly message
        handleApiError(error);
        throw error;
      }
    }
  }

  throw new Error('Max retries exceeded');
}
```

---

## 6. Data Models

### 6.1 Core Types

```typescript
type Stage = 'loss' | 'doubt' | 'discomfort' | 'discovery' | 'understanding' | 'integration';

interface StageData {
  name: string;
  emotion: string;
  cognition: string;
  behavior: string;
  color: string;
  order: number;
  inDangerZone: boolean;
}

interface SurveyResponse {
  questionId: string;
  questionText: string;
  responseType: 'multiple_choice' | 'likert' | 'short_answer';
  response: string | number;
  timestamp: number;
}

interface PersonalizationData {
  summary: string; // Brief summary of user's situation
  concerns: string[]; // Key concerns identified
  context: 'faculty' | 'creative' | 'business' | 'general';
  rogersPosition?: 'innovator' | 'early_adopter' | 'early_majority' | 'late_majority' | 'laggard';
}

interface Message {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
  timestamp: number;
}

interface ContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  name?: string;
  input?: any;
  tool_use_id?: string;
  content?: string;
}
```

### 6.2 Stage Configuration

```typescript
const STAGES: Record<Stage, StageData> = {
  loss: {
    name: 'Loss',
    emotion: 'FEAR',
    cognition: 'CAUTIOUS',
    behavior: 'PARALYZED',
    color: '#C83737',
    order: 1,
    inDangerZone: false
  },
  doubt: {
    name: 'Doubt',
    emotion: 'RESENTMENT',
    cognition: 'SKEPTICAL',
    behavior: 'RESISTANT',
    color: '#B83A4B',
    order: 2,
    inDangerZone: true
  },
  discomfort: {
    name: 'Discomfort',
    emotion: 'ANXIETY',
    cognition: 'CONFUSED',
    behavior: 'UNPRODUCTIVE',
    color: '#E8A547',
    order: 3,
    inDangerZone: true
  },
  discovery: {
    name: 'Discovery',
    emotion: 'ANTICIPATION',
    cognition: 'RESOURCEFUL',
    behavior: 'ENERGIZED',
    color: '#F4C542',
    order: 4,
    inDangerZone: false
  },
  understanding: {
    name: 'Understanding',
    emotion: 'CONFIDENCE',
    cognition: 'PRAGMATIC',
    behavior: 'PRODUCTIVE',
    color: '#4A9B8E',
    order: 5,
    inDangerZone: false
  },
  integration: {
    name: 'Integration',
    emotion: 'SATISFACTION',
    cognition: 'FOCUSED',
    behavior: 'GENEROUS',
    color: '#2F6B5D',
    order: 6,
    inDangerZone: false
  }
};
```

---

## 7. Security & Privacy

### 7.1 Data Privacy

**No Persistent Storage**:
- All user data exists only in browser SessionStorage
- No server-side logging of user responses
- No analytics tracking of individual responses
- Conversation history never leaves the client except for API calls

**API Key Security**:
- API key stored in environment variable (not in code)
- Rate limiting on client side to prevent abuse
- No API key exposed to client (if using proxy)

**Alternative Architecture (Proxy Server)**:
```
Client → Proxy Server (Vercel/Netlify Function) → Claude API
```
- Proxy handles API key
- Proxy adds rate limiting per session
- No authentication required (public tool)

### 7.2 Content Security

- Content Security Policy headers to prevent XSS
- Input sanitization on all survey responses
- No execution of user-provided code
- SVG sanitization to prevent SVG-based attacks

---

## 8. Performance Considerations

### 8.1 Optimization Strategies

**Code Splitting**:
```typescript
const Mode1Content = lazy(() => import('./components/Mode1Content'));
const Mode2Content = lazy(() => import('./components/Mode2Content'));
```

**Memoization**:
```typescript
const GriefWheel = memo(({ stage, intensity }) => {
  // Expensive SVG rendering
});
```

**API Call Optimization**:
- Debounce user input in surveys (avoid API call on every keystroke)
- Cache stage content for Mode 1 (per session)
- Progressive loading: Show partial Claude response as it streams

### 8.2 Performance Targets

- Initial page load: < 2s (desktop, cable)
- Time to interactive: < 3s
- Mode switch: < 300ms
- Claude response (Mode 1): < 2s
- Claude diagnosis (Mode 2): < 4s
- Smooth animations: 60fps

---

## 9. Testing Strategy

### 9.1 Unit Tests

```typescript
// Example: GriefWheel component tests
describe('GriefWheel', () => {
  it('renders 6 segments', () => {});
  it('highlights selected stage', () => {});
  it('calls onStageSelect when clicked', () => {});
  it('disables interaction in diagnose mode', () => {});
  it('applies correct colors to stages', () => {});
});

// Example: Claude integration tests
describe('ClaudeService', () => {
  it('handles tool calls correctly', () => {});
  it('retries on rate limit', () => {});
  it('gracefully handles API errors', () => {});
  it('maintains conversation history', () => {});
});
```

### 9.2 Integration Tests

- Mode 1: Click through all stages, verify content loads
- Mode 2: Complete full survey, verify diagnosis
- Mode switching: Verify state preservation
- Session reset: Verify clean state

### 9.3 E2E Tests (Playwright)

```typescript
test('user can complete survey and receive diagnosis', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="mode-toggle"]');
  await page.click('[data-testid="begin-survey"]');

  // Answer questions
  for (let i = 0; i < 6; i++) {
    await page.fill('[data-testid="survey-input"]', 'Test response');
    await page.click('[data-testid="next-button"]');
  }

  // Verify diagnosis
  await expect(page.locator('[data-testid="diagnosis-stage"]')).toBeVisible();
});
```

### 9.4 Accessibility Testing

- Automated: axe-core integration
- Manual: Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard navigation: Full app navigable without mouse
- Color contrast: All text meets WCAG AA standards

---

## 10. Deployment

### 10.1 Build Process

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build production bundle
npm run build

# Preview production build
npm run preview
```

### 10.2 Hosting Options

**Option A: Static Hosting (Vercel/Netlify)**
- Deploy as static SPA
- Use serverless function for Claude API proxy
- Environment variables for API key

**Option B: Self-Hosted**
- Build static assets
- Serve via Nginx/Apache
- Separate Node.js proxy for API calls

### 10.3 Environment Variables

```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_API_PROXY_URL=https://api-proxy.example.com
VITE_ENABLE_ANALYTICS=false
```

---

## 11. Monitoring & Maintenance

### 11.1 Error Tracking

- Sentry or similar for client-side errors
- No PII in error reports
- Track Claude API errors separately

### 11.2 Analytics (Optional)

If analytics are needed:
- Aggregate usage only (not individual sessions)
- Track: mode usage, average survey completion time, stage view frequency
- No tracking of survey responses or diagnoses

### 11.3 Maintenance

**Regular Tasks**:
- Update Claude SDK when new versions released
- Monitor API rate limits and costs
- Review and update stage content as framework evolves
- Test with new browsers/devices

**Content Updates**:
- Stage descriptions can be updated without code changes
- System prompts versioned alongside framework document
- A/B testing different prompt strategies (with user consent)

---

## 12. Future Enhancements

### 12.1 Phase 2 Features

- **Multi-language support**: Translate UI and Claude prompts
- **Export functionality**: Allow users to download their diagnosis (PDF/text)
- **Comparison mode**: Compare two technologies (AI vs. previous disruptions)
- **Organizational dashboard**: Anonymous aggregate data for institutions

### 12.2 Advanced Features

- **Voice interface**: Audio input for survey responses
- **Adaptive questioning**: Claude adjusts survey length based on clarity of responses
- **Resource library**: Curated articles/videos for each stage
- **Peer stories**: Anonymous user-submitted experiences (moderated)

---

## 13. Appendices

### 13.1 API Rate Limits

Anthropic API Limits (as of implementation):
- Claude Sonnet 4: 50 requests/minute
- Max tokens per request: 8192
- Max output tokens: 4096

### 13.2 Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile: iOS Safari 14+, Chrome Android 90+

### 13.3 Dependencies

Core:
- react: ^18.2.0
- react-dom: ^18.2.0
- typescript: ^5.0.0
- @anthropic-ai/sdk: ^0.20.0
- zustand: ^4.5.0
- framer-motion: ^11.0.0

Development:
- vite: ^5.0.0
- vitest: ^1.0.0
- @playwright/test: ^1.40.0
- tailwindcss: ^3.4.0
- eslint: ^8.0.0
- prettier: ^3.0.0

---

## 14. Glossary

- **Change Grief Cycle**: Six-stage framework for understanding emotional response to change
- **Danger Zone**: Critical juncture (Stage 3) where users can progress or regress
- **Rogers' Curve**: Technology adoption lifecycle (innovators → laggards)
- **Gartner's Hype Cycle**: Technology maturity lifecycle
- **Grief Gap**: Distance between individual adoption position and technology maturity
- **Ephemeral Session**: Temporary data storage that persists only during active session

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-24 | Mark Gill / Claude | Initial design document |

---

**Status**: Draft for Review
**Next Review Date**: Upon completion of Phase 1 implementation
**Approval Required**: Technical Lead, Product Owner
