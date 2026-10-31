import { useEffect } from 'react';
import { Terrain } from './terrain/Terrain';
import { AssembledContent } from './components/AssembledContent';
import { QuickSurvey } from './components/QuickSurvey';
import { ConversationSurvey } from './components/ConversationSurvey';
import { DiagnosisResult } from './components/DiagnosisResult';
import { useStore } from './store';
import { STAGES } from './domain/stages';

export default function App() {
  const mode = useStore((s) => s.mode);
  const selectedStage = useStore((s) => s.selectedStage);
  const diagnosis = useStore((s) => s.diagnosis);
  const rationale = useStore((s) => s.rationale);
  const status = useStore((s) => s.status);
  const setMode = useStore((s) => s.setMode);
  const selectStage = useStore((s) => s.selectStage);
  const resetSession = useStore((s) => s.resetSession);
  const startQuick = useStore((s) => s.startQuick);
  const startConversation = useStore((s) => s.startConversation);
  const probeConversation = useStore((s) => s.probeConversation);
  const finishReveal = useStore((s) => s.finishReveal);

  // One probe at mount. A missing or misconfigured proxy hides the
  // Conversation card rather than offering a button that fails.
  useEffect(() => {
    void probeConversation();
  }, [probeConversation]);

  // The reveal beat: the user sees themselves placed, then the trail
  // coloured, then the comparison to their field. Leading with the gap would
  // make the tool's first statement a judgment about how far behind they are.
  useEffect(() => {
    if (status !== 'revealing') return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(finishReveal, reduced ? 150 : 1500);
    return () => clearTimeout(t);
  }, [status, finishReveal]);

  const showDiagnosisOnTerrain = !!diagnosis && (mode === 'explore' || status !== 'idle');

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <Terrain
        stage={showDiagnosisOnTerrain ? diagnosis!.stage : selectedStage}
        confidence={showDiagnosisOnTerrain ? diagnosis!.stageConfidence : null}
        transitionToward={showDiagnosisOnTerrain ? diagnosis!.transitionToward : null}
        gap={showDiagnosisOnTerrain ? diagnosis!.gap : null}
        domain={showDiagnosisOnTerrain ? diagnosis!.domain : null}
        mode={mode}
        onStageSelect={mode === 'explore' ? selectStage : undefined}
        revealing={status === 'revealing'}
        thinking={status === 'thinking'}
      />

      <div className="controls">
        <div
          className="toggle"
          role="tablist"
          aria-label="Mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'explore'}
            data-active={mode === 'explore'}
            onClick={() => setMode('explore')}
          >
            Explore
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'diagnose'}
            data-active={mode === 'diagnose'}
            onClick={() => setMode('diagnose')}
          >
            Diagnose
          </button>
        </div>

        <div className="controls__right">
          {(diagnosis || status !== 'idle') && (
            <button type="button" className="link-button" onClick={resetSession}>
              Start fresh
            </button>
          )}
          <span className="badge" title="Nothing is saved or analysed.">
            <LockGlyph /> Ephemeral session
          </span>
        </div>
      </div>

      <main id="main" className="main">
        {mode === 'explore' ? (
          selectedStage ? (
            <AssembledContent
              stage={selectedStage}
              diagnosis={diagnosis}
              onNavigate={selectStage}
            />
          ) : (
            <ExploreIntro onPick={selectStage} />
          )
        ) : (
          <DiagnoseView
            status={status}
            onStartQuick={startQuick}
            onStartConversation={startConversation}
            diagnosis={diagnosis}
            rationale={rationale}
          />
        )}
      </main>
    </div>
  );
}

function ExploreIntro({ onPick }: { onPick: (s: import('./domain/types').Stage) => void }) {
  return (
    <div className="intro">
      <h1>The change cycle</h1>
      <p className="intro__lead">
        Six stages people move through when a technology takes something away.
        The path climbs to a narrow summit at Discomfort, where it forks — forward
        into experimentation, or back down the way you came.
      </p>
      <p>Pick a stage on the path above, or start anywhere:</p>
      <div className="intro__stages">
        {Object.values(STAGES).map((s) => (
          <button
            key={s.id}
            type="button"
            className="intro__stage"
            style={{ borderColor: s.color }}
            onClick={() => onPick(s.id)}
          >
            <span className="intro__stage-n">{s.position}</span>
            <span className="intro__stage-name">{s.name}</span>
            <span className="intro__stage-sub">{s.emotion}</span>
          </button>
        ))}
      </div>
      <p className="intro__aside">
        Not sure where you are?{' '}
        <strong>Diagnose</strong> asks six questions and places you on the path.
      </p>
    </div>
  );
}

function DiagnoseView({
  status,
  onStartQuick,
  onStartConversation,
  diagnosis,
  rationale,
}: {
  status: string;
  onStartQuick: () => void;
  onStartConversation: () => void;
  diagnosis: import('./domain/types').Diagnosis | null;
  rationale: string | null;
}) {
  const conversationAvailable = useStore((s) => s.conversationAvailable);
  const fallbackNotice = useStore((s) => s.fallbackNotice);

  if (status === 'done' && diagnosis) {
    return <DiagnosisResult diagnosis={diagnosis} rationale={rationale} />;
  }

  if (status === 'revealing') {
    return (
      <div className="thinking">
        <p>Placing you on the path…</p>
      </div>
    );
  }

  if (status === 'talking' || status === 'thinking') {
    return <ConversationSurvey />;
  }

  if (status === 'asking') {
    return (
      <>
        {fallbackNotice && (
          <p className="notice" role="status">
            {fallbackNotice}
          </p>
        )}
        <QuickSurvey />
      </>
    );
  }

  return (
    <div className="welcome">
      <h1>Where are you in the change cycle?</h1>
      <p className="welcome__sub">
        A few questions to find your current stage.
      </p>
      <p className="welcome__disclaimer">This is a reflection tool, not a judgment.</p>

      <div className="paths">
        <div className="path-card path-card--primary">
          <h2>Six quick questions</h2>
          <p>
            Multiple choice. About two minutes. Nothing you enter leaves your
            browser.
          </p>
          <button type="button" className="button button--primary" onClick={onStartQuick}>
            Begin
          </button>
        </div>

        {/* Hidden entirely when no proxy is configured, rather than offering a
            button that fails. The app is fully functional without one. */}
        {conversationAvailable && (
          <div className="path-card">
            <h2>Talk it through</h2>
            <p>
              A short back-and-forth. More accurate, and it can follow what you
              actually say. Your answers go to Anthropic to generate the next
              question, and are not stored anywhere.
            </p>
            <button type="button" className="button" onClick={onStartConversation}>
              Start talking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LockGlyph() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true" focusable="false">
      <path
        d="M2 6V4a4 4 0 0 1 8 0v2h.5A1.5 1.5 0 0 1 12 7.5v5A1.5 1.5 0 0 1 10.5 14h-9A1.5 1.5 0 0 1 0 12.5v-5A1.5 1.5 0 0 1 1.5 6H2Zm1.5 0h5V4a2.5 2.5 0 0 0-5 0v2Z"
        fill="currentColor"
      />
    </svg>
  );
}
