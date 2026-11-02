import { useEffect, useState } from 'react';
import { Dial } from './dial/Dial';
import { StagePanel } from './components/StagePanel';
import { DetailModal } from './components/DetailModal';
import { SurveyModal } from './components/SurveyModal';
import { SourcesModal } from './components/SourcesModal';
import { assemble } from './content/assemble';
import { viewDiagnosis, isBorrowedDomain } from './domain/view';
import { groupIntoPanels } from './content/panels';
import { imageFor } from './content/imageAssets';
import { briefFor } from './content/imageBriefs';
import { useStore } from './store';
import { useTheme } from './theme/useTheme';
import { STAGES } from './domain/stages';
import type { Stage } from './domain/types';

type Detail = 'why' | 'forward' | null;

export default function App() {
  const mode = useStore((s) => s.mode);
  const selectedStage = useStore((s) => s.selectedStage);
  const diagnosis = useStore((s) => s.diagnosis);
  const status = useStore((s) => s.status);
  const setMode = useStore((s) => s.setMode);
  const viewDomain = useStore((s) => s.viewDomain);
  const setViewDomain = useStore((s) => s.setViewDomain);
  const selectStage = useStore((s) => s.selectStage);
  const resetSession = useStore((s) => s.resetSession);
  const finishReveal = useStore((s) => s.finishReveal);

  const [detail, setDetail] = useState<Detail>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();

  // The reveal beat: the user sees themselves placed, then the band they are
  // on, then the comparison to their field. Leading with the gap would
  // make the tool's first statement a judgment about how far behind they are.
  useEffect(() => {
    if (status !== 'revealing') return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(finishReveal, reduced ? 150 : 1500);
    return () => clearTimeout(t);
  }, [status, finishReveal]);

  const surveyOpen = mode === 'diagnose';
  const showDiagnosisOnDial = !!diagnosis && (mode === 'explore' || status !== 'idle');

  /**
   * The dial marks where you are; the panel shows what you are reading. They
   * are the same stage until you click another band, and the dial is built to
   * hold both at once.
   */
  const panelStage: Stage | null = selectedStage ?? diagnosis?.stage ?? null;

  /**
   * Everything downstream reads the diagnosis through the field currently
   * selected, which is not always the one Q2 recorded. The stored diagnosis
   * stays as answered; only the lens and the gap follow the switch.
   */
  const seen = viewDiagnosis(diagnosis, viewDomain);
  const borrowed = isBorrowedDomain(diagnosis, viewDomain);
  const page = panelStage ? assemble(panelStage, seen) : null;
  const groups = page ? groupIntoPanels(page) : null;

  const overlayOpen = surveyOpen || detail !== null || sourcesOpen;

  return (
    <>
      <div className="app" inert={overlayOpen}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <header className="masthead">
          <span className="wordmark">
            Next<span className="wordmark__ed">Ed</span>
          </span>
          <div className="masthead__right">
            <span className="masthead__title">Technological Grief</span>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        <div className="layout">
          <div className="layout__dial">
            <Dial
              stage={showDiagnosisOnDial ? diagnosis!.stage : null}
              selected={panelStage}
              confidence={showDiagnosisOnDial ? seen!.stageConfidence : null}
              transitionToward={showDiagnosisOnDial ? seen!.transitionToward : null}
              gap={showDiagnosisOnDial ? seen!.gap : null}
              domain={showDiagnosisOnDial ? seen!.domain : null}
              mode={mode}
              onStageSelect={selectStage}
              revealing={status === 'revealing'}
            />

            <div className="controls">
              <button
                type="button"
                className="button button--primary"
                onClick={() => setMode('diagnose')}
                aria-haspopup="dialog"
              >
                {diagnosis ? 'Answer again' : 'Find your station'}
              </button>

              <div className="controls__right">
                {(diagnosis || status !== 'idle') && (
                  <button type="button" className="link-button" onClick={resetSession}>
                    Start fresh
                  </button>
                )}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setSourcesOpen(true)}
                  aria-haspopup="dialog"
                >
                  Sources
                </button>
              </div>
            </div>
          </div>

          <main id="main" className="layout__panel">
            {panelStage && groups ? (
              <StagePanel
                stage={panelStage}
                groups={groups}
                domain={seen?.domain ?? null}
                borrowed={borrowed}
                onNavigate={selectStage}
                onOpen={setDetail}
                onDomainChange={setViewDomain}
              />
            ) : (
              <PanelIntro onPick={selectStage} />
            )}
          </main>
        </div>

        <footer className="colophon">
          <p>St. Cloud State University is a member of Minnesota State.</p>
          <p>A reflection tool, not a judgment. Nothing you enter leaves this browser.</p>
        </footer>
      </div>

      {panelStage && groups && (
        <>
          <DetailModal
            id="detail-why"
            open={detail === 'why'}
            onClose={() => setDetail(null)}
            stage={panelStage}
            title="Why this happens"
            sections={groups.why}
            brief={briefFor(panelStage, 'why', seen?.domain ?? null)}
            image={imageFor(panelStage, 'why', seen?.domain ?? null)}
          />
          <DetailModal
            id="detail-forward"
            open={detail === 'forward'}
            onClose={() => setDetail(null)}
            stage={panelStage}
            title={panelStage === 'integration' ? 'What to do with it' : 'What to do about it'}
            sections={groups.forward}
            brief={briefFor(panelStage, 'forward', seen?.domain ?? null)}
            image={imageFor(panelStage, 'forward', seen?.domain ?? null)}
          />
        </>
      )}

      <SourcesModal
        open={sourcesOpen}
        onClose={() => setSourcesOpen(false)}
        domain={seen?.domain ?? null}
      />

      <SurveyModal open={surveyOpen} onClose={() => setMode('explore')} />
    </>
  );
}

function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: 'light' | 'dark';
  onToggle: () => void;
}) {
  const toDark = theme === 'light';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-pressed={!toDark}
    >
      {toDark ? <MoonGlyph /> : <SunGlyph />}
      {/* The word, not just the icon: a two-state control that is only an
          icon is a guess about what it does. */}
      {toDark ? 'Dark' : 'Light'}
    </button>
  );
}

function MoonGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <path
        d="M12.2 8.6A5.6 5.6 0 0 1 5.4 1.8 5.6 5.6 0 1 0 12.2 8.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SunGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <circle cx="7" cy="7" r="3" fill="currentColor" />
      <path
        d="M7 0v2M7 12v2M0 7h2M12 7h2M2.1 2.1l1.4 1.4M10.5 10.5l1.4 1.4M11.9 2.1l-1.4 1.4M3.5 10.5l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PanelIntro({ onPick }: { onPick: (s: Stage) => void }) {
  return (
    <div className="intro">
      <h1>The change cycle</h1>
      <p className="intro__lead">
        Six stages people move through when a technology takes something away.
        Each band on the dial is as wide as the options you have there, which is
        why Discomfort is a sliver, and why the ring never closes.
      </p>
      <p>Pick a stage on the dial, or start anywhere:</p>
      <div className="intro__stages">
        {Object.values(STAGES).map((s) => (
          <button
            key={s.id}
            type="button"
            className="intro__stage"
            style={{ borderTopColor: s.color }}
            onClick={() => onPick(s.id)}
          >
            <span className="intro__stage-n">{s.position}</span>
            <span className="intro__stage-name">{s.name}</span>
            <span className="intro__stage-sub">{s.emotion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
