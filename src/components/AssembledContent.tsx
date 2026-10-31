import { useEffect, useRef } from 'react';
import { assemble, TRIAD_SEPARATOR } from '../content/assemble';
import { STAGES, nextStage, previousStage } from '../domain/stages';
import type { Diagnosis, Stage } from '../domain/types';
import { Prose } from './Prose';

interface Props {
  stage: Stage;
  diagnosis: Diagnosis | null;
  onNavigate: (s: Stage) => void;
}

export function AssembledContent({ stage, diagnosis, onNavigate }: Props) {
  const data = STAGES[stage];
  const page = assemble(stage, diagnosis);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the new heading so a screen reader announces the change.
  // preventScroll matters: without it, focusing on first mount scrolls the
  // terrain off the top of the screen before the user has seen it.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [stage]);

  const prev = previousStage(stage);
  const next = nextStage(stage);

  return (
    <article className="content" data-stage={stage}>
      <header className="content__header">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="content__title"
          style={{ color: data.color }}
        >
          {data.name}
        </h1>
        <p className="content__meta">
          Stage {data.position} of 6
          {data.isDangerZone && <span className="content__flag"> · the Danger Zone</span>}
        </p>

        {/* The breadcrumb does NOT wrap. v1 specified wrapping, which asserts
            a closed cycle the framework explicitly denies. */}
        <nav className="content__crumbs" aria-label="Adjacent stages">
          {prev ? (
            <button type="button" className="link-button" onClick={() => onNavigate(prev)}>
              ← {STAGES[prev].name}
            </button>
          ) : (
            <span className="content__crumb-end">Start of the path</span>
          )}
          {next ? (
            <button type="button" className="link-button" onClick={() => onNavigate(next)}>
              {STAGES[next].name} →
            </button>
          ) : (
            <span className="content__crumb-end">End of the path</span>
          )}
        </nav>
      </header>

      {page.sections.map((section) => {
        if (section.kind === 'experience') {
          const [emotion, cognition, behavior] = section.body.split(TRIAD_SEPARATOR);
          return (
            <section key={section.key} className="content__section">
              <h2>{section.heading}</h2>
              {/* A table, not hover-expanding columns: hover-to-reveal hides
                  content from touch and from screen readers. */}
              <table className="triad">
                <tbody>
                  <tr>
                    <th scope="row">Feelings</th>
                    <td>{emotion}</td>
                  </tr>
                  <tr>
                    <th scope="row">Thoughts</th>
                    <td>{cognition}</td>
                  </tr>
                  <tr>
                    <th scope="row">Behaviour</th>
                    <td>{behavior}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          );
        }

        return (
          <section
            key={section.key}
            className={`content__section content__section--${section.kind}`}
            data-block={section.blockId ?? undefined}
          >
            {section.heading && <h2>{section.heading}</h2>}
            <Prose body={section.body} />
          </section>
        );
      })}
    </article>
  );
}
