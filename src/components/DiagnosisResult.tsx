import { STAGES } from '../domain/stages';
import { gapSentence } from '../domain/gap';
import type { Diagnosis } from '../domain/types';
import { downloadMarkdown } from '../export/toMarkdown';
import { useStore } from '../store';
import { Prose } from './Prose';

interface Props {
  diagnosis: Diagnosis;
  rationale: string | null;
}

export function DiagnosisResult({ diagnosis: d, rationale }: Props) {
  const selectStage = useStore((s) => s.selectStage);
  const setMode = useStore((s) => s.setMode);
  const stage = STAGES[d.stage];

  return (
    <div className="result">
      {d.signalConflict && (
        <p className="result__conflict">
          Worth noting: what you’re doing and what you’re feeling are pointing in
          different directions. Feelings often lag actions by a while — this reading
          follows the actions.
        </p>
      )}

      <h1 className="result__title">
        {d.transitionToward ? (
          <>
            You look like you’re in{' '}
            <span className="result__stage">{stage.name}</span>, with some signs
            of {STAGES[d.transitionToward].name}
          </>
        ) : d.stageConfidence === 'low' ? (
          <>
            I’m seeing signs of both{' '}
            <span className="result__stage">{stage.name}</span> and the stage
            next to it
          </>
        ) : (
          <>
            You’re in <span className="result__stage">{stage.name}</span>
          </>
        )}
      </h1>

      {rationale && <Prose body={rationale} className="result__rationale" />}

      <p className="result__gap">{gapSentence(d.gap, d.domain)}</p>

      {d.stageConfidence === 'low' && (
        <p className="result__note">
          This reading is on the uncertain side — your answers pointed in a couple of
          directions at once, which often means you’re between stages.
        </p>
      )}

      <div className="result__actions">
        <button
          type="button"
          className="button button--primary"
          onClick={() => {
            selectStage(d.stage);
            setMode('explore');
          }}
        >
          Read more about this stage
        </button>
        <button
          type="button"
          className="button"
          onClick={() => {
            selectStage('loss');
            setMode('explore');
          }}
        >
          See the whole path
        </button>
        <button
          type="button"
          className="button"
          onClick={() => downloadMarkdown(d, rationale)}
        >
          Download a copy
        </button>
      </div>

      {/* No "does this feel accurate?" prompt. There is no endpoint to
          collect it and there will not be one: the app makes no network
          requests at all, and an accuracy rate is not worth giving that up.
          Asking a question whose answer is discarded is theatre, and here it
          would also undercut the claim directly above it. */}
      <p className="result__privacy">
        This stayed entirely in your browser. Nothing was stored and nothing was sent
        anywhere. Close the tab and it’s gone.
      </p>
    </div>
  );
}
