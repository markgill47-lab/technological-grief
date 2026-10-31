import { useStore, currentAnswered } from '../store';
import {
  Q1,
  Q2,
  Q3,
  Q4,
  Q5,
  Q5B_PROMPT,
  Q6,
  QUICK_QUESTION_COUNT,
  type BehaviorKey,
} from '../diagnostic/quickQuestions';
import type { ThreatId } from '../domain/types';

export function QuickSurvey() {
  const index = useStore((s) => s.quickIndex);
  const answers = useStore((s) => s.quickAnswers);
  const answer = useStore((s) => s.answer);
  const toggleBehavior = useStore((s) => s.toggleBehavior);
  const next = useStore((s) => s.nextQuestion);
  const back = useStore((s) => s.backQuestion);

  const canAdvance = currentAnswered(answers, index);
  const isLast = index === QUICK_QUESTION_COUNT - 1;

  return (
    <div className="survey">
      <div className="survey__progress">
        <p className="survey__count">
          {index + 1} of {QUICK_QUESTION_COUNT}
        </p>
        <div
          className="survey__bar"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={QUICK_QUESTION_COUNT}
          aria-label="Survey progress"
        >
          {Array.from({ length: QUICK_QUESTION_COUNT }, (_, i) => (
            <span key={i} data-filled={i <= index} />
          ))}
        </div>
      </div>

      {index === 0 && (
        <Single
          q={Q1}
          value={answers.q1}
          onPick={(v) => answer('q1', v)}
          onEnter={next}
          canAdvance={canAdvance}
        />
      )}
      {index === 1 && (
        <Single
          q={Q2}
          value={answers.q2}
          onPick={(v) => answer('q2', v)}
          onEnter={next}
          canAdvance={canAdvance}
        />
      )}
      {index === 2 && (
        <fieldset className="survey__question">
          <legend>
            <span className="survey__prompt">{Q3.prompt}</span>
            <span className="survey__help">{Q3.help}</span>
          </legend>
          <div className="survey__options">
            {Q3.options.map((o) => {
              const checked = (answers.q3 ?? []).includes(o.id as BehaviorKey);
              return (
                <label key={o.id} className="option" data-checked={checked}>
                  <input
                    type="checkbox"
                    name="q3"
                    value={o.id}
                    checked={checked}
                    onChange={() => toggleBehavior(o.id as BehaviorKey)}
                  />
                  <span>{o.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
      {index === 3 && (
        <Single
          q={Q4}
          value={answers.q4}
          onPick={(v) => answer('q4', v)}
          onEnter={next}
          canAdvance={canAdvance}
        />
      )}
      {index === 4 && (
        <>
          <Single
            q={Q5}
            value={answers.q5}
            onPick={(v) => answer('q5', v as ThreatId)}
            onEnter={next}
            canAdvance={canAdvance}
          />
          {answers.q5 && (
            <fieldset className="survey__question survey__question--secondary">
              <legend>
                <span className="survey__prompt survey__prompt--small">{Q5B_PROMPT}</span>
                <span className="survey__help">Optional.</span>
              </legend>
              <div className="survey__options">
                {Q5.options
                  .filter((o) => o.id !== answers.q5)
                  .map((o) => {
                    const checked = answers.q5b === o.id;
                    return (
                      <label key={o.id} className="option option--compact" data-checked={checked}>
                        <input
                          type="radio"
                          name="q5b"
                          value={o.id}
                          checked={checked}
                          onChange={() => answer('q5b', o.id as ThreatId)}
                        />
                        <span>{o.label}</span>
                      </label>
                    );
                  })}
              </div>
            </fieldset>
          )}
        </>
      )}
      {index === 5 && (
        <Single
          q={Q6}
          value={answers.q6}
          onPick={(v) => answer('q6', v)}
          onEnter={next}
          canAdvance={canAdvance}
        />
      )}

      <div className="survey__nav">
        <button
          type="button"
          className="link-button"
          onClick={back}
          disabled={index === 0}
        >
          Back
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={next}
          disabled={!canAdvance}
        >
          {isLast ? 'See where I am' : 'Next'}
        </button>
      </div>
    </div>
  );
}

interface QuestionDef {
  id: string;
  prompt: string;
  help?: string;
  options: readonly { readonly id: string; readonly label: string }[];
}

function Single({
  q,
  value,
  onPick,
  onEnter,
  canAdvance,
}: {
  q: QuestionDef;
  value: string | undefined;
  onPick: (v: string) => void;
  onEnter: () => void;
  canAdvance: boolean;
}) {
  return (
    <fieldset
      className="survey__question"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && canAdvance) {
          e.preventDefault();
          onEnter();
        }
      }}
    >
      <legend>
        <span className="survey__prompt">{q.prompt}</span>
        {q.help && <span className="survey__help">{q.help}</span>}
      </legend>
      <div className="survey__options">
        {q.options.map((o) => (
          <label key={o.id} className="option" data-checked={value === o.id}>
            <input
              type="radio"
              name={q.id}
              value={o.id}
              checked={value === o.id}
              onChange={() => onPick(o.id)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
