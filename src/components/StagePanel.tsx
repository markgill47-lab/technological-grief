import { useEffect, useId, useRef } from 'react';
import { TRIAD_SEPARATOR } from '../content/assemble';
import type { PanelGroups } from '../content/panels';
import { STAGES, nextStage, previousStage } from '../domain/stages';
import { DOMAINS } from '../domain/taxonomies';
import { DOMAIN_IDS } from '../domain/types';
import type { Domain, Stage } from '../domain/types';
import { Prose } from './Prose';

interface Props {
  stage: Stage;
  groups: PanelGroups;
  /** The field being read. Null before anyone has answered Q2. */
  domain: Domain | null;
  /** True when the field being read is not the one they answered with. */
  borrowed: boolean;
  onNavigate: (s: Stage) => void;
  onOpen: (which: 'why' | 'forward') => void;
  onDomainChange: (d: Domain) => void;
}

/**
 * The right-hand column: where you are, what it feels like, and two doors.
 *
 * Everything that explains or advises is behind the two buttons. The panel
 * answers one question — "what is this stage" — and the modals answer the
 * other two.
 */
export function StagePanel({
  stage,
  groups,
  domain,
  borrowed,
  onNavigate,
  onOpen,
  onDomainChange,
}: Props) {
  const data = STAGES[stage];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const domainId = useId();

  // Move focus to the new heading so a screen reader announces the change.
  // preventScroll matters: without it, focusing on first mount scrolls the
  // dial off the top of the screen before the user has seen it.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [stage]);

  const prev = previousStage(stage);
  const next = nextStage(stage);
  const [emotion, cognition, behavior] = groups.experience
    ? groups.experience.body.split(TRIAD_SEPARATOR)
    : [data.emotion, data.cognition, data.behavior];

  return (
    <article className="panel" data-stage={stage}>
      <header className="panel__head">
        <h1 ref={headingRef} tabIndex={-1} className="panel__title">
          {/* The colour is a fill, never type: Bold Orange is 2.6:1 on white
              and the system forbids it as text. The swatch carries it. */}
          <span
            className="panel__swatch"
            style={{ background: data.color }}
            aria-hidden="true"
          />
          {data.name}
        </h1>
        <p className="panel__meta">
          Stage {data.position} of 6
          {data.isDangerZone && <span className="panel__flag"> · the Danger Zone</span>}
        </p>

        {/* The breadcrumb does NOT wrap. v1 specified wrapping, which asserts
            a closed cycle the framework explicitly denies. */}
        <nav className="panel__crumbs" aria-label="Adjacent stages">
          {prev ? (
            <button type="button" className="link-button" onClick={() => onNavigate(prev)}>
              ← {STAGES[prev].name}
            </button>
          ) : (
            <span className="panel__crumb-end">Start of the path</span>
          )}
          {next ? (
            <button type="button" className="link-button" onClick={() => onNavigate(next)}>
              {STAGES[next].name} →
            </button>
          ) : (
            <span className="panel__crumb-end">End of the path</span>
          )}
        </nav>
      </header>

      {groups.description && (
        <section className="panel__section" aria-label="Description">
          <Prose body={groups.description.body} className="panel__prose" />
        </section>
      )}

      <section className="panel__section">
        <h2 className="panel__h2">What you might be feeling</h2>
        {/* Three across, not a table: at this size the triad is a glance, and
            each cell is one or two words. It stacks below 640px. */}
        <dl className="triad-row">
          <div className="triad-row__item">
            <dt>Feelings</dt>
            <dd>{emotion}</dd>
          </div>
          <div className="triad-row__item">
            <dt>Thoughts</dt>
            <dd>{cognition}</dd>
          </div>
          <div className="triad-row__item">
            <dt>Behaviour</dt>
            <dd>{behavior}</dd>
          </div>
        </dl>
      </section>

      {domain && (
        <section className="panel__section field">
          <div className="field__head">
            <label className="panel__h2" htmlFor={domainId}>
              In your work
            </label>
            {/* A real select. Five options with long labels is exactly what it
                is for, and it is one tab stop instead of five. */}
            <select
              id={domainId}
              className="field__select"
              value={domain}
              onChange={(e) => onDomainChange(e.target.value as Domain)}
            >
              {DOMAIN_IDS.map((d) => (
                <option key={d} value={d}>
                  {DOMAINS[d].name}
                </option>
              ))}
            </select>
          </div>

          {groups.lensSummary ? (
            <p className="field__summary">{groups.lensSummary}</p>
          ) : (
            <p className="field__summary field__summary--empty">
              Nothing specific to this field at this stage yet.
            </p>
          )}

          {borrowed && (
            <p className="field__borrowed">
              Reading as {DOMAINS[domain].name}. Your own position has not moved. The distance to the field
              has, because it is a different field.
            </p>
          )}
        </section>
      )}

      <section className="panel__section">
        <div className="doors">
          <Door
            label="Why this happens"
            hint={hint(groups.why.length, 'what is driving it')}
            onClick={() => onOpen('why')}
          />
          <Door
            label="What to do about it"
            hint={hint(groups.forward.length, 'the one move from here')}
            onClick={() => onOpen('forward')}
          />
        </div>
      </section>
    </article>
  );
}

function Door({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="door" onClick={onClick} aria-haspopup="dialog">
      <span className="door__label">{label}</span>
      <span className="door__hint">{hint}</span>
      <svg
        className="door__chev"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M6 3 L12 9 L6 15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/** Say when there is more behind the button than the stage's own section. */
function hint(count: number, base: string): string {
  if (count <= 1) return base;
  return `${base}, and ${count - 1} more for your situation`;
}
