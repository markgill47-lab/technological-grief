import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { POSITION, STAGES } from '../domain/stages';
import { DOMAINS, FIELD_POSITION } from '../domain/taxonomies';
import { gapLabel, gapSign } from '../domain/gap';
import type { Confidence, Domain, Mode, Stage } from '../domain/types';
import {
  CX,
  RETREAT_D,
  R_MARKER,
  SECTORS,
  VIEW_H,
  VIEW_W,
  angleAtPosition,
  bandPath,
  dialDescription,
  gapArcD,
  pointAt,
  sectorFor,
  uncertaintyD,
} from './geometry';
import { DialTextView } from './TextView';
import { useCompact } from './useCompact';

export interface DialProps {
  /** Where the reader is, from a result. Drives the marker and the glow. */
  stage: Stage | null;
  /**
   * The band being read, which is not always where you are: with a result on
   * the dial you can still click through the other five stages. Defaults to
   * `stage`, so a dial with no result behaves as before.
   */
  selected?: Stage | null;
  confidence: Confidence | null;
  transitionToward: Stage | null;
  gap: number | null;
  domain: Domain | null;
  mode: Mode;
  onStageSelect?: (s: Stage) => void;
  /** True while the reveal sequence is running. */
  revealing?: boolean;
}

/** |gap| below this and the two markers would overlap illegibly. */
const GAP_RENDER_THRESHOLD = 0.25;

/** The field annotation and the retreat note sit in the opening. */
const NOTE_Y = 476;
const FIELD_Y = 500;

export function Dial({
  stage,
  selected,
  confidence,
  transitionToward,
  gap,
  domain,
  mode,
  onStageSelect,
  revealing = false,
}: DialProps) {
  const uid = useId();
  const compact = useCompact();
  const interactive = mode === 'explore' && !!onStageSelect;
  const [focusIndex, setFocusIndex] = useState(0);
  const [textView, setTextView] = useState(false);
  const groupRef = useRef<SVGGElement>(null);

  /** The band being read. The marker stays wherever the result put it. */
  const reading = selected === undefined ? stage : selected;
  const userPos = stage ? POSITION[stage] : null;
  const fieldPos = domain ? FIELD_POSITION[domain] : null;
  const showGap =
    gap !== null && Math.abs(gap) >= GAP_RENDER_THRESHOLD && fieldPos !== null;
  /** A reading, as opposed to a stage the user merely clicked to read about. */
  const diagnosed = confidence !== null;
  /** "You are at" is only true when the band being read is your own. */
  const readingYou = diagnosed && reading === stage;

  const userPoint = useMemo(
    () => (userPos === null ? null : pointAt(R_MARKER, angleAtPosition(userPos))),
    [userPos],
  );
  const fieldPoint = useMemo(
    () => (fieldPos === null ? null : pointAt(R_MARKER, angleAtPosition(fieldPos))),
    [fieldPos],
  );

  const describedBy = `${uid}-desc`;
  const titleId = `${uid}-title`;

  const description = dialDescription(
    reading,
    gap === null || !domain
      ? null
      : `Your field, ${DOMAINS[domain].name}, is positioned such that ${gapLabel(gap)}.`,
    readingYou,
  );

  const danger = sectorFor('discomfort');
  const dangerLabel = pointAt(238, danger.center);

  // Roving tabindex: one tab stop for the whole graphic, arrows move within.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!interactive) return;
      let next = focusIndex;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = Math.min(SECTORS.length - 1, focusIndex + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          next = Math.max(0, focusIndex - 1);
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = SECTORS.length - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onStageSelect?.(SECTORS[focusIndex].stage);
          return;
        default:
          return;
      }
      e.preventDefault();
      setFocusIndex(next);
      const el = groupRef.current?.querySelectorAll<SVGGElement>('[data-station]')[next];
      el?.focus();
    },
    [focusIndex, interactive, onStageSelect],
  );

  return (
    <figure className="dial" data-mode={mode}>
      <h2 id={titleId} className="visually-hidden">
        The change cycle as an open dial
      </h2>
      <p id={describedBy} className="visually-hidden">
        {description}
      </p>

      {textView ? (
        <DialTextView stage={reading} domain={domain} gap={gap} confidence={confidence} />
      ) : (
        <svg
          className="dial__svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-labelledby={`${titleId} ${describedBy}`}
        >
          <defs>
            <marker
              id={`${uid}-retreat-arrow`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--stage-doubt)" opacity="0.8" />
            </marker>
            <marker
              id={`${uid}-gap-arrow`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                fill={gap !== null && gap < 0 ? 'var(--link)' : 'var(--border-strong)'}
              />
            </marker>
          </defs>

          {/* The Danger Zone is already the narrowest band; the glow only says
              "and you are in it". No warning icon: v1 specified an orbiting
              one, which is alarming in a tool whose whole position is that
              this stage is normal and common. */}
          {(diagnosed ? stage === 'discomfort' : reading === 'discomfort') && (
            <path
              className="dial__danger"
              d={bandPath(danger.a1 - 4, danger.a2 + 4, 126, 208)}
              fill="var(--stage-discomfort)"
              opacity={0.32}
              data-testid="danger-wedge"
            />
          )}

          {/* Uncertainty as angular extent. Asymmetric when a transition is
              named - that is how "in Doubt, with some signs of Discomfort"
              gets drawn. */}
          {stage && confidence && userPos !== null && (
            <path
              className="dial__uncertainty"
              d={uncertaintyD(
                userPos,
                confidence,
                transitionToward ? POSITION[transitionToward] : null,
              )}
              fill="var(--link)"
              opacity={0.22}
              data-testid="uncertainty-band"
              data-confidence={confidence}
            />
          )}

          <g ref={groupRef} onKeyDown={onKeyDown}>
            {SECTORS.map((sec, i) => {
              const isCurrent = sec.stage === reading;
              const state = isCurrent
                ? 'current'
                : reading && Math.abs(POSITION[sec.stage] - POSITION[reading]) === 1
                  ? 'adjacent'
                  : 'other';
              const fill = `var(--stage-${sec.stage})`;
              const ink = `var(--stage-${sec.stage}-ink)`;

              return (
                <g
                  key={sec.stage}
                  data-station={sec.stage}
                  data-stage={sec.stage}
                  data-state={state}
                  className="dial__station"
                  tabIndex={interactive ? (i === focusIndex ? 0 : -1) : undefined}
                  role={interactive ? 'button' : undefined}
                  aria-label={
                    interactive
                      ? `${STAGES[sec.stage].name}, stage ${sec.position} of 6`
                      : undefined
                  }
                  aria-current={isCurrent ? 'step' : undefined}
                  onClick={interactive ? () => onStageSelect?.(sec.stage) : undefined}
                  onFocus={() => setFocusIndex(i)}
                  style={{ cursor: interactive ? 'pointer' : 'default' }}
                >
                  {/* Hit path is padded past the ring, so even the 20-degree
                      Danger Zone band clears 44px in both directions. */}
                  <path d={sec.hit} fill="transparent" />
                  <path className="dial__band" d={sec.d} fill={fill} />
                  <text
                    x={sec.num.x}
                    y={sec.num.y + (compact ? 11 : 7)}
                    textAnchor="middle"
                    className={compact ? 'dial__num dial__num--compact' : 'dial__num'}
                    fill={ink}
                  >
                    {sec.position}
                  </text>
                  {!compact && (
                    <text
                      x={sec.label.x}
                      y={sec.label.y + 6}
                      textAnchor={sec.labelAnchor}
                      className="dial__label"
                      fill={isCurrent ? 'var(--ink)' : 'var(--ink-body)'}
                      fontWeight={isCurrent ? 700 : 600}
                    >
                      {STAGES[sec.stage].name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {!compact && (
            <text
              x={dangerLabel.x}
              y={dangerLabel.y}
              textAnchor="end"
              className="dial__annotation"
              fill="var(--warning-text)"
            >
              danger zone
            </text>
          )}

          {/* Discomfort back to Doubt, drawn inside the ring and anticlockwise
              so it reads as a route off the path rather than part of it. */}
          <path
            className="dial__retreat"
            d={RETREAT_D}
            fill="none"
            stroke="var(--stage-doubt)"
            strokeWidth={2.5}
            strokeDasharray="7 6"
            markerEnd={`url(#${uid}-retreat-arrow)`}
            data-testid="retreat-path"
          />

          {showGap && userPos !== null && fieldPos !== null && (
            <path
              className="dial__gap"
              d={gapArcD(userPos, fieldPos)}
              fill="none"
              stroke={gap! < 0 ? 'var(--link)' : 'var(--border-strong)'}
              strokeWidth={4}
              markerEnd={`url(#${uid}-gap-arrow)`}
              data-testid="gap-arc"
              data-sign={gapSign(gap!)}
            />
          )}

          {fieldPoint && showGap && (
            <g className="dial__field" data-testid="field-marker">
              <path
                d={diamond(fieldPoint.x, fieldPoint.y, 8)}
                fill="var(--surface)"
                stroke="var(--border-strong)"
                strokeWidth={2.5}
              />
            </g>
          )}

          {/* Only once there is a reading behind it. The terrain drew "You" at
              whatever stage was selected, which said "you are here" about a
              stage someone had merely clicked to read about. The selected band
              carries its own keyline, and the hole names it. */}
          {userPoint && diagnosed && (
            <g
              className={`dial__you${revealing ? ' dial__you--reveal' : ''}`}
              data-testid="you-marker"
            >
              <circle
                cx={userPoint.x}
                cy={userPoint.y}
                r={9}
                fill={stage ? STAGES[stage].color : 'var(--link)'}
                stroke="var(--link)"
                strokeWidth={2.5}
              />
              <circle
                cx={userPoint.x}
                cy={userPoint.y}
                r={4.5}
                fill="none"
                stroke="rgba(0,0,0,0.35)"
                strokeWidth={1}
              />
            </g>
          )}

          {/* The hole is the readout. It is the one place on a dial where text
              can sit horizontally at a legible size, which is what the v1
              wheel spent on three rotated attributes per wedge. */}
          {reading ? (
            <>
              {/* At phone size the name is 46 units tall and there is no room
                  above it for a kicker. The result screen below says it. */}
              {readingYou && !compact && (
                <text
                  x={CX}
                  y={224}
                  textAnchor="middle"
                  className="dial__kicker"
                  fill="var(--ink-body)"
                >
                  YOU ARE AT
                </text>
              )}
              <text
                x={CX}
                y={readingYou && !compact ? 264 : 254}
                textAnchor="middle"
                className={compact ? 'dial__name dial__name--compact' : 'dial__name'}
                fill="var(--ink)"
              >
                {STAGES[reading].name}
              </text>
              <text
                x={CX}
                y={readingYou && !compact ? 292 : 284}
                textAnchor="middle"
                className={compact ? 'dial__meta dial__meta--compact' : 'dial__meta'}
                fill="var(--ink-body)"
              >
                stage {STAGES[reading].position} of 6
              </text>
              {STAGES[reading].isDangerZone && !compact && (
                <text
                  x={CX}
                  y={316}
                  textAnchor="middle"
                  className="dial__meta"
                  fill="var(--warning-text)"
                >
                  the Danger Zone
                </text>
              )}
            </>
          ) : (
            <>
              <text
                x={CX}
                y={252}
                textAnchor="middle"
                className={compact ? 'dial__name dial__name--compact' : 'dial__name'}
                fill="var(--ink)"
              >
                Six stages
              </text>
              <text
                x={CX}
                y={282}
                textAnchor="middle"
                className={compact ? 'dial__meta dial__meta--compact' : 'dial__meta'}
                fill="var(--ink-body)"
              >
                {interactive ? 'pick one to read it' : 'the change cycle'}
              </text>
            </>
          )}

          {/* Notes go in the opening, where there is no band. */}
          {!compact && (
            <text
              x={CX}
              y={NOTE_Y}
              textAnchor="middle"
              className="dial__annotation"
              fill="var(--ink-body)"
            >
              dashed arc: the retreat to Doubt
            </text>
          )}
          {showGap && domain && !compact && (
            <text
              x={CX}
              y={FIELD_Y}
              textAnchor="middle"
              className="dial__annotation"
              fill="var(--ink-body)"
            >
              {DOMAINS[domain].name} — {gapLabel(gap!)}
            </text>
          )}
        </svg>
      )}

      <figcaption>
        <button
          type="button"
          className="link-button"
          aria-expanded={textView}
          onClick={() => setTextView((v) => !v)}
        >
          {textView ? 'Show dial' : 'Text view'}
        </button>
      </figcaption>
    </figure>
  );
}

function diamond(cx: number, cy: number, r: number): string {
  return `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`;
}
