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
export function TerrainTextView({ stage, domain, gap, confidence }: Props) {
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
            <th scope="col">Terrain</th>
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
                <td>{terrainNote(s.position)}</td>
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
        The path climbs from stage 1 to a narrow summit at stage 3, where it
        forks: forward and down into stage 4, or back down to stage 2. Beyond
        the summit it widens through stages 5 and 6. Both exits from the summit
        are downhill, which is why people cycle.
      </p>
    </div>
  );
}

function terrainNote(position: number): string {
  switch (position) {
    case 1:
      return 'Lower slope, near side';
    case 2:
      return 'Climbing';
    case 3:
      return 'Narrow summit — path forks';
    case 4:
      return 'Descending, far side';
    case 5:
      return 'Widening valley';
    case 6:
      return 'Broad, level ground';
    default:
      return '';
  }
}
