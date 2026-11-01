import { STAGES, STAGE_ORDER } from '../domain/stages';
import { DOMAINS, FIELD_POSITION } from '../domain/taxonomies';
import { gapLabel } from '../domain/gap';
import type { Confidence, Domain, Stage } from '../domain/types';

interface Props {
  stage: Stage | null;
  domain: Domain | null;
  gap: number | null;
  confidence: Confidence | null;
}

/**
 * The same information the graphic carries, as a table.
 *
 * Serves screen-reader users, users who find the diagram unclear, and anyone
 * who simply prefers the numbers. A visible toggle rather than a hidden
 * fallback, because the second and third groups are real.
 */
export function DialTextView({ stage, domain, gap, confidence }: Props) {
  const fieldPos = domain ? FIELD_POSITION[domain] : null;

  return (
    <div className="textview">
      <table className="textview__table">
        <caption className="visually-hidden">
          The six stages of the change cycle, in order
        </caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Stage</th>
            <th scope="col">Feeling</th>
            <th scope="col">Thinking</th>
            <th scope="col">Behaviour</th>
            <th scope="col">Band</th>
          </tr>
        </thead>
        <tbody>
          {STAGE_ORDER.map((id) => {
            const s = STAGES[id];
            const isCurrent = id === stage;
            return (
              <tr
                key={id}
                data-stage={id}
                data-state={isCurrent ? 'current' : 'other'}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <td>{s.position}</td>
                <th scope="row">
                  {s.name}
                  {isCurrent && <strong className="textview__you"> — you are here</strong>}
                  {s.isDangerZone && (
                    <span className="textview__note"> (the Danger Zone)</span>
                  )}
                </th>
                <td>{s.emotion}</td>
                <td>{s.cognition}</td>
                <td>{s.behavior}</td>
                <td>{bandNote(s.position)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <dl className="textview__facts">
        {confidence && (
          <>
            <dt>Confidence</dt>
            <dd>{confidence}</dd>
          </>
        )}
        {domain && fieldPos !== null && (
          <>
            <dt>Your field</dt>
            <dd>
              {DOMAINS[domain].name}, at about stage {fieldPos}
            </dd>
          </>
        )}
        {gap !== null && (
          <>
            <dt>Grief gap</dt>
            <dd>{gapLabel(gap)}</dd>
          </>
        )}
      </dl>

      <p className="textview__shape">
        The six stages sit as bands around an open dial, read clockwise from the
        lower left. Each band is as wide as the options available at that stage,
        so stage 3 is the narrowest and stage 6 the widest. The dial does not
        close: stage 1 begins the path and stage 6 ends it. The one route
        backward runs from stage 3 to stage 2, and it is the easier of the two
        ways out of stage 3, which is why people cycle.
      </p>
    </div>
  );
}

/** How wide the band is, in words, for anyone reading instead of looking. */
function bandNote(position: number): string {
  switch (position) {
    case 1:
      return 'Narrow — the path starts here';
    case 2:
      return 'Narrower';
    case 3:
      return 'Narrowest — the path forks';
    case 4:
      return 'Widening again';
    case 5:
      return 'Wide';
    case 6:
      return 'Widest — the path ends here';
    default:
      return '';
  }
}
