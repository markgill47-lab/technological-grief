import type { Domain, RogersPosition, Stage, ThreatId } from '../domain/types';

export type StageWeights = Partial<Record<Stage, number>>;

export type BehaviorKey =
  | 'nothing'
  | 'consumed'
  | 'trained'
  | 'tried'
  | 'used'
  | 'built'
  | 'taught';

export interface QuickAnswers {
  q1: string;
  q2: string;
  q3: BehaviorKey[];
  q4: string;
  q5: ThreatId;
  q5b?: ThreatId;
  q6: string;
}

/**
 * Relative weight of each stage signal.
 *
 * Behaviour outranks emotion outranks self-report. See
 * specs/grief-framework-context.md section 8.1 - someone who reports feeling
 * overwhelmed while describing three successful experiments is in Discovery
 * with lagging feelings, not in Discomfort.
 */
export const LAYER_WEIGHT = {
  selfReport: 1.0,
  behavior: 2.0,
  emotion: 1.5,
} as const;

// --- Q1: current relationship (self-report) --------------------------------

export const Q1 = {
  id: 'q1',
  prompt:
    'How would you describe your current relationship with AI in your work?',
  help: "There's no wrong answer — I'm just trying to understand where you're starting from.",
  options: [
    { id: 'a', label: 'I actively avoid thinking about or using it' },
    { id: 'b', label: "I'm aware it exists but haven't really engaged" },
    { id: 'c', label: "I'm trying to work out if and how it applies to my work" },
    { id: 'd', label: "I'm experimenting with it but still learning" },
    { id: 'e', label: 'I use it regularly as part of my work' },
    { id: 'f', label: "It's just part of how I work now" },
  ],
} as const;

export const Q1_WEIGHTS: Record<string, StageWeights> = {
  a: { loss: 3 },
  b: { loss: 2, doubt: 2 },
  c: { doubt: 2, discomfort: 3 },
  d: { discovery: 3 },
  e: { understanding: 3 },
  f: { integration: 3 },
};

// --- Q2: domain -------------------------------------------------------------

export const Q2 = {
  id: 'q2',
  prompt: 'What kind of work do you do?',
  help: "I'm asking so the suggestions are concrete rather than generic.",
  options: [
    { id: 'a', label: "Teaching, training, or assessing people's learning" },
    { id: 'b', label: 'Making things — writing, design, image, sound, video' },
    { id: 'c', label: 'Analysis or advisory — research, law, consulting, accounts, policy' },
    { id: 'd', label: 'Building or running technical systems' },
    { id: 'e', label: 'Coordinating people, operations, admin, or care' },
  ],
} as const;

export const Q2_DOMAIN: Record<string, Domain> = {
  a: 'teaching',
  b: 'craft',
  c: 'analysis',
  d: 'building',
  e: 'coordination',
};

// --- Q3: behaviour (strongest signal) --------------------------------------

export const Q3 = {
  id: 'q3',
  prompt: 'In the past couple of months, what have you actually done related to AI?',
  help: 'If anything. Select all that apply.',
  multiSelect: true,
  options: [
    { id: 'nothing', label: 'Nothing at all' },
    { id: 'consumed', label: 'Read articles or watched videos about it' },
    { id: 'trained', label: 'Attended a workshop, training, or talk' },
    { id: 'tried', label: 'Tried a tool once or twice out of curiosity' },
    { id: 'used', label: 'Used it several times for specific tasks' },
    { id: 'built', label: 'Built it into how I do some part of my work' },
    { id: 'taught', label: 'Helped colleagues or students learn it' },
  ],
} as const;

export const Q3_WEIGHTS: Record<BehaviorKey, StageWeights> = {
  nothing: { loss: 3, doubt: 1 },
  consumed: { doubt: 3 },
  trained: { discomfort: 2 },
  tried: { discomfort: 1, discovery: 2 },
  used: { discovery: 2, understanding: 2 },
  built: { understanding: 3 },
  taught: { integration: 3 },
};

/** Any of these counts as having implemented something. */
export const IMPLEMENTED_KEYS: readonly BehaviorKey[] = [
  'tried',
  'used',
  'built',
  'taught',
];

/**
 * The framework's single highest-value diagnostic pattern: someone who
 * invested the effort to attend training and still has not tried anything is
 * in the Danger Zone almost by definition. Large enough to be decisive on its
 * own, which is intended.
 */
export const DANGER_ZONE_BONUS = 5;

// --- Q4: emotion ------------------------------------------------------------

export const Q4 = {
  id: 'q4',
  prompt: 'When you think about AI and your work, what’s the main feeling?',
  options: [
    { id: 'a', label: 'Fear, or a kind of grief' },
    { id: 'b', label: 'Resentment or irritation' },
    { id: 'c', label: 'Anxiety, or feeling overwhelmed' },
    { id: 'd', label: 'Curiosity, maybe some anticipation' },
    { id: 'e', label: 'Confidence — I know roughly what I’m doing' },
    { id: 'f', label: "Satisfaction. It's settled" },
    { id: 'g', label: 'Honestly, mostly indifference' },
  ],
} as const;

/**
 * Option (g) is new in v2. v1 offered no path for indifference, which read as
 * a gap in the instrument - people in Loss often present as uninterested
 * rather than afraid, and offering only "fear" invites a false negative.
 */
export const Q4_WEIGHTS: Record<string, StageWeights> = {
  a: { loss: 3 },
  b: { doubt: 3 },
  c: { discomfort: 3 },
  d: { discovery: 3 },
  e: { understanding: 3 },
  f: { understanding: 1, integration: 2 },
  g: { loss: 2 },
};

// --- Q5: primary threat -----------------------------------------------------

export const Q5 = {
  id: 'q5',
  prompt: 'Which of these is closest to what actually bothers you?',
  options: [
    {
      id: 'skills_obsolescence',
      label: "I spent years getting good at something that's now widely available",
    },
    {
      id: 'identity_authority',
      label: "I'm supposed to be the one who knows, and that's slipping",
    },
    {
      id: 'verification',
      label: "I can't tell what's genuine, learned, or actually someone's own work",
    },
    {
      id: 'authenticity_quality',
      label: 'The output is competent and hollow, and that matters',
    },
    { id: 'economic', label: "I'm not sure my role survives this" },
    { id: 'ethical', label: "It was built on other people's work without consent" },
    {
      id: 'control_opacity',
      label: "I'm accountable for results from a process I can't inspect",
    },
  ],
} as const;

export const Q5B_PROMPT = 'Anything else on that list also ring true?';

// --- Q6: pace (Rogers) ------------------------------------------------------

export const Q6 = {
  id: 'q6',
  prompt:
    'When something new comes along in your field, which is usually you?',
  help: "Last one, and it's about disposition rather than AI.",
  options: [
    { id: 'a', label: "I'm usually among the first to try it, before it's proven" },
    { id: 'b', label: "I move early, once it looks like it's real" },
    { id: 'c', label: "I wait until I've seen it work for people I trust" },
    { id: 'd', label: 'I come to it when it becomes necessary' },
    // Phrased to be chooseable without self-criticism. The framework's
    // position is that a laggard disposition is strategic, not deficient,
    // and a question that makes it embarrassing to pick skews the instrument.
    { id: 'e', label: "I rarely adopt new things, and that's served me well" },
  ],
} as const;

export const Q6_ROGERS: Record<string, RogersPosition> = {
  a: 'innovator',
  b: 'early_adopter',
  c: 'early_majority',
  d: 'late_majority',
  e: 'laggard',
};

export const QUICK_QUESTION_COUNT = 6;
