import { create } from 'zustand';
import type { Diagnosis, Mode, Stage } from './domain/types';
import { isStage } from './domain/types';
import { scoreQuick, quickRationale } from './diagnostic/score';
import type { BehaviorKey, QuickAnswers } from './diagnostic/quickQuestions';
import { QUICK_QUESTION_COUNT } from './diagnostic/quickQuestions';
import {
  OPENING_QUESTION,
  atTurnCap,
  classify,
  nextTurn,
  probeProxy,
  type Turn,
} from './diagnostic/conversation';

const STORAGE_KEY = 'tgi.session.v2';
const SCHEMA_VERSION = 2;

export type SurveyStatus =
  | 'idle'
  | 'asking'
  | 'talking'
  | 'thinking'
  | 'revealing'
  | 'done';

export type SurveyPath = 'quick' | 'conversation' | null;

/** Shown once when a conversation drops the user into the Quick path. */
export const FALLBACK_NOTICE =
  'Something went wrong on my end. Rather than make you start over — here are six quick questions instead. They stay entirely in your browser.';

interface Persisted {
  v: number;
  mode: Mode;
  selectedStage: Stage | null;
  diagnosis: Diagnosis | null;
  rationale: string | null;
  quickAnswers: Partial<QuickAnswers>;
  quickIndex: number;
  status: SurveyStatus;
  path: SurveyPath;
  transcript: Turn[];
  fallbackNotice: string | null;
}

export interface AppState {
  mode: Mode;
  selectedStage: Stage | null;
  diagnosis: Diagnosis | null;
  rationale: string | null;

  quickAnswers: Partial<QuickAnswers>;
  quickIndex: number;
  status: SurveyStatus;
  path: SurveyPath;

  /** The conversation so far. Persisted, so a refresh mid-talk is survivable. */
  transcript: Turn[];
  /** Set when a conversation failed and handed over to Quick. */
  fallbackNotice: string | null;

  /** Set once at mount. False hides the Conversation path entirely. */
  conversationAvailable: boolean;

  setMode(m: Mode): void;
  selectStage(s: Stage): void;
  startQuick(): void;
  startConversation(): void;
  sendTurn(text: string): Promise<void>;
  classifyNow(): Promise<void>;
  fallBackToQuick(): void;
  probeConversation(): Promise<void>;
  answer<K extends keyof QuickAnswers>(key: K, value: QuickAnswers[K]): void;
  toggleBehavior(key: BehaviorKey): void;
  nextQuestion(): void;
  backQuestion(): void;
  submitQuick(): void;
  finishReveal(): void;
  resetSession(): void;
}

function loadPersisted(): Partial<Persisted> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Persisted;
    // A schema mismatch discards rather than migrates. Session-scoped data is
    // cheap to lose and a half-migrated diagnosis is worse than none.
    if (parsed.v !== SCHEMA_VERSION) return {};
    return parsed;
  } catch {
    return {};
  }
}

function persist(s: AppState): void {
  try {
    const data: Persisted = {
      v: SCHEMA_VERSION,
      mode: s.mode,
      selectedStage: s.selectedStage,
      diagnosis: s.diagnosis,
      rationale: s.rationale,
      quickAnswers: s.quickAnswers,
      quickIndex: s.quickIndex,
      status: s.status,
      path: s.path,
      transcript: s.transcript,
      fallbackNotice: s.fallbackNotice,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Private mode, blocked storage, quota. The app works without it.
  }
}

export interface Route {
  mode: Mode;
  stage: Stage | null;
}

/** Pure, so it can be tested without a document. */
export function parseHash(hash: string): Route | null {
  if (hash === '#/diagnose') return { mode: 'diagnose', stage: null };
  const m = /^#\/explore\/([a-z]+)$/.exec(hash);
  if (m && isStage(m[1])) return { mode: 'explore', stage: m[1] };
  if (hash === '' || hash === '#' || hash === '#/') {
    return { mode: 'explore', stage: null };
  }
  return null;
}

export function hashFor(mode: Mode, stage: Stage | null): string {
  if (mode === 'diagnose') return '#/diagnose';
  return stage ? `#/explore/${stage}` : '#/';
}

/** Set while applying a route from the URL, to avoid writing it straight back. */
let applyingRoute = false;

function writeHash(mode: Mode, stage: Stage | null): void {
  if (applyingRoute) return;
  const next = hashFor(mode, stage);
  if (window.location.hash === next) return;
  // pushState, not replaceState: stage selections are history entries, which
  // is what makes the back button work.
  history.pushState(null, '', next);
}

const saved = loadPersisted();
const initialRoute = parseHash(window.location.hash);

export const useStore = create<AppState>((set, get) => {
  const after = () => {
    const s = get();
    persist(s);
    writeHash(s.mode, s.selectedStage);
  };

  const runClassify = async (transcript: Turn[]) => {
    set({ status: 'thinking' });
    try {
      const diagnosis = await classify(transcript);
      set({
        diagnosis,
        rationale: diagnosis.rationale ?? null,
        status: 'revealing',
        selectedStage: diagnosis.stage,
      });
      after();
    } catch {
      get().fallBackToQuick();
    }
  };

  return {
    // A deep link wins over the restored session: the user asked for that page.
    mode: initialRoute?.stage ? 'explore' : (initialRoute?.mode ?? saved.mode ?? 'explore'),
    selectedStage: initialRoute?.stage ?? saved.selectedStage ?? null,
    diagnosis: saved.diagnosis ?? null,
    rationale: saved.rationale ?? null,
    quickAnswers: saved.quickAnswers ?? {},
    quickIndex: saved.quickIndex ?? 0,
    // 'thinking' is a transient state; a refresh mid-request resumes asking.
    status: saved.status === 'thinking' ? 'talking' : (saved.status ?? 'idle'),
    path: saved.path ?? null,
    transcript: saved.transcript ?? [],
    fallbackNotice: saved.fallbackNotice ?? null,
    conversationAvailable: false,

    setMode(mode) {
      set({ mode });
      after();
    },

    selectStage(selectedStage) {
      set({ selectedStage, mode: 'explore' });
      after();
    },

    startQuick() {
      set({ status: 'asking', quickIndex: 0, path: 'quick' });
      after();
    },

    async probeConversation() {
      const available = await probeProxy();
      set({ conversationAvailable: available });
    },

    startConversation() {
      set({
        status: 'talking',
        path: 'conversation',
        fallbackNotice: null,
        transcript: [{ role: 'assistant', content: OPENING_QUESTION }],
      });
      after();
    },

    /**
     * Send one user turn.
     *
     * Every failure path lands in the same place: the Quick survey, carrying
     * over whatever was already gathered. There is no state in which the user
     * is simply stuck — which is the structural payoff of having a path with
     * no network dependency at all.
     */
    async sendTurn(text) {
      const trimmed = text.trim();
      if (!trimmed || get().status === 'thinking') return;

      const transcript: Turn[] = [
        ...get().transcript,
        { role: 'user', content: trimmed },
      ];
      set({ transcript, status: 'thinking' });
      after();

      try {
        if (atTurnCap(transcript)) {
          await runClassify(transcript);
          return;
        }

        const reply = await nextTurn(transcript);
        const withReply: Turn[] = [...transcript, { role: 'assistant', content: reply }];
        set({ transcript: withReply, status: 'talking' });
        after();
      } catch {
        get().fallBackToQuick();
      }
    },

    async classifyNow() {
      await runClassify(get().transcript);
    },

    /**
     * Hand a failed conversation to the Quick path.
     *
     * Nothing is carried across, deliberately. The spec originally said the
     * first answer would transfer because both paths open with the same
     * question — but the conversation's opening takes free text and Quick's
     * Q1 is multiple choice, so transferring would mean classifying that text
     * onto an option. Classification is exactly what just failed, and a
     * keyword guess that lands on the wrong option corrupts the diagnosis
     * silently. Asking the six questions cleanly is the honest move; the
     * transcript is kept so nothing the person wrote is thrown away.
     */
    fallBackToQuick() {
      set({
        status: 'asking',
        path: 'quick',
        quickIndex: 0,
        fallbackNotice: FALLBACK_NOTICE,
      });
      after();
    },

    answer(key, value) {
      set((s) => ({ quickAnswers: { ...s.quickAnswers, [key]: value } }));
      after();
    },

    toggleBehavior(key) {
      set((s) => {
        const current = s.quickAnswers.q3 ?? [];
        const next = current.includes(key)
          ? current.filter((k) => k !== key)
          : [...current, key];
        return { quickAnswers: { ...s.quickAnswers, q3: next } };
      });
      after();
    },

    nextQuestion() {
      const { quickIndex } = get();
      if (quickIndex < QUICK_QUESTION_COUNT - 1) {
        set({ quickIndex: quickIndex + 1 });
        after();
      } else {
        get().submitQuick();
      }
    },

    // Back preserves later answers rather than clearing them.
    backQuestion() {
      set((s) => ({ quickIndex: Math.max(0, s.quickIndex - 1) }));
      after();
    },

    submitQuick() {
      const a = get().quickAnswers;
      if (!isComplete(a)) return;
      const diagnosis = scoreQuick(a);
      set({
        diagnosis,
        rationale: quickRationale(a, diagnosis),
        status: 'revealing',
        selectedStage: diagnosis.stage,
      });
      after();
    },

    finishReveal() {
      set({ status: 'done' });
      after();
    },

    resetSession() {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      set({
        mode: 'explore',
        selectedStage: null,
        diagnosis: null,
        rationale: null,
        quickAnswers: {},
        quickIndex: 0,
        status: 'idle',
        path: null,
        transcript: [],
        fallbackNotice: null,
      });
      writeHash('explore', null);
    },
  };
});

/**
 * Keep the store in step with the URL.
 *
 * `popstate` covers the back and forward buttons; `hashchange` covers a hash
 * typed or pasted into the address bar. `pushState` fires neither, so there
 * is no feedback loop with `writeHash`.
 */
function applyRouteFromUrl(): void {
  const route = parseHash(window.location.hash);
  if (!route) return;

  applyingRoute = true;
  try {
    useStore.setState((s) => ({
      mode: route.mode,
      selectedStage: route.stage ?? (route.mode === 'explore' ? null : s.selectedStage),
    }));
    persist(useStore.getState());
  } finally {
    applyingRoute = false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', applyRouteFromUrl);
  window.addEventListener('hashchange', applyRouteFromUrl);
}

export function isComplete(a: Partial<QuickAnswers>): a is QuickAnswers {
  return (
    !!a.q1 &&
    !!a.q2 &&
    Array.isArray(a.q3) &&
    a.q3.length > 0 &&
    !!a.q4 &&
    !!a.q5 &&
    !!a.q6
  );
}

/** True when the current question has an answer, so Next can activate. */
export function currentAnswered(a: Partial<QuickAnswers>, index: number): boolean {
  switch (index) {
    case 0:
      return !!a.q1;
    case 1:
      return !!a.q2;
    case 2:
      return Array.isArray(a.q3) && a.q3.length > 0;
    case 3:
      return !!a.q4;
    case 4:
      return !!a.q5;
    case 5:
      return !!a.q6;
    default:
      return false;
  }
}
