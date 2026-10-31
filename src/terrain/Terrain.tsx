import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { POSITION, STAGES } from '../domain/stages';
import { DOMAINS, FIELD_POSITION } from '../domain/taxonomies';
import { gapLabel, gapSign } from '../domain/gap';
import type { Confidence, Domain, Mode, Stage } from '../domain/types';
import {
  GAP_SPAN_Y,
  GROUND_D,
  REGRESSION_D,
  RIDGE_D,
  STATIONS,
  TRAIL_BAND_D,
  UNCERTAINTY_HALF_WIDTH,
  VIEW_H,
  VIEW_W,
  pointAtPosition,
  terrainDescription,
  widthAtPosition,
} from './geometry';
import { TerrainTextView } from './TextView';
import { useCompact } from './useCompact';

export interface TerrainProps {
  stage: Stage | null;
  confidence: Confidence | null;
  transitionToward: Stage | null;
  gap: number | null;
  domain: Domain | null;
  mode: Mode;
  onStageSelect?: (s: Stage) => void;
  /** True while the diagnosis reveal sequence is running. */
  revealing?: boolean;
  /** True while a model call is in flight. Drives the trail sweep. */
  thinking?: boolean;
}

/** |gap| below this and the two markers would overlap illegibly. */
const GAP_RENDER_THRESHOLD = 0.25;

export function Terrain({
  stage,
  confidence,
  transitionToward,
  gap,
  domain,
  mode,
  onStageSelect,
  revealing = false,
  thinking = false,
}: TerrainProps) {
  const uid = useId();
  const compact = useCompact();
  const interactive = mode === 'explore' && !!onStageSelect;
  const [focusIndex, setFocusIndex] = useState(0);
  const [textView, setTextView] = useState(false);
  const groupRef = useRef<SVGGElement>(null);

  const userPos = stage ? POSITION[stage] : null;
  const fieldPos = domain ? FIELD_POSITION[domain] : null;
  const showGap =
    gap !== null && Math.abs(gap) >= GAP_RENDER_THRESHOLD && fieldPos !== null;

  const userPoint = useMemo(
    () => (userPos === null ? null : pointAtPosition(userPos)),
    [userPos],
  );
  const fieldPoint = useMemo(
    () => (fieldPos === null ? null : pointAtPosition(fieldPos)),
    [fieldPos],
  );

  const describedBy = `${uid}-desc`;
  const titleId = `${uid}-title`;

  const description = terrainDescription(
    stage,
    gap === null || !domain
      ? null
      : `Your field, ${DOMAINS[domain].name}, is positioned such that ${gapLabel(gap)}.`,
  );

  // Roving tabindex: one tab stop for the whole graphic, arrows move within.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!interactive) return;
      let next = focusIndex;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = Math.min(STATIONS.length - 1, focusIndex + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          next = Math.max(0, focusIndex - 1);
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = STATIONS.length - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onStageSelect?.(STATIONS[focusIndex].stage);
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
    <figure className="terrain" data-mode={mode}>
      <h2 id={titleId} className="visually-hidden">
        The change cycle as a mountain pass
      </h2>
      <p id={describedBy} className="visually-hidden">
        {description}
      </p>

      {textView ? (
        <TerrainTextView stage={stage} domain={domain} gap={gap} confidence={confidence} />
      ) : (
        <svg
          className="terrain__svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-labelledby={`${titleId} ${describedBy}`}
        >
          <defs>
            <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sky-top)" />
              <stop offset="100%" stopColor="var(--sky-bottom)" />
            </linearGradient>
            <linearGradient id={`${uid}-ground`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ground-top)" />
              <stop offset="100%" stopColor="var(--ground-bottom)" />
            </linearGradient>
            <radialGradient id={`${uid}-uncert`}>
              <stop
                offset="0%"
                stopColor={stage ? STAGES[stage].color : 'transparent'}
                stopOpacity="0.28"
              />
              <stop
                offset="100%"
                stopColor={stage ? STAGES[stage].color : 'transparent'}
                stopOpacity="0"
              />
            </radialGradient>
            <radialGradient id={`${uid}-saddle`}>
              <stop offset="0%" stopColor="var(--discomfort)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--discomfort)" stopOpacity="0" />
            </radialGradient>
            {stage && userPoint && (
              <clipPath id={`${uid}-seg`}>
                <rect x={userPoint.x - 70} y={0} width={140} height={VIEW_H} rx={40} />
              </clipPath>
            )}
            <marker
              id={`${uid}-arrow`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--regress)" opacity="0.7" />
            </marker>
          </defs>

          <rect width={VIEW_W} height={VIEW_H} fill={`url(#${uid}-sky)`} />

          {/* The saddle glow marks the Danger Zone as topography. No warning
              icon: v1 specified an orbiting one, which is alarming in a tool
              whose whole position is that this stage is normal and common. */}
          {stage === 'discomfort' && (
            <ellipse
              className="terrain__saddle"
              cx={370}
              cy={58}
              rx={115}
              ry={52}
              fill={`url(#${uid}-saddle)`}
              data-testid="saddle-glow"
            />
          )}

          <path d={GROUND_D} fill={`url(#${uid}-ground)`} />

          <path d={TRAIL_BAND_D} fill="var(--trail)" />

          <path
            d={REGRESSION_D}
            fill="none"
            stroke="var(--regress)"
            strokeWidth={2.5}
            strokeDasharray="6 7"
            opacity={0.7}
            markerEnd={`url(#${uid}-arrow)`}
            data-testid="regression-path"
          />
          <text
            x={276}
            y={70}
            textAnchor="middle"
            className="terrain__annotation"
            fill="var(--regress)"
          >
            retreat
          </text>

          <path
            d={RIDGE_D}
            fill="none"
            stroke="var(--trail-edge)"
            strokeWidth={1.5}
            opacity={0.8}
          />

          {/* Tint the segment the user is standing on, feathered so it does
              not read as a hard boundary where none exists. */}
          {stage && userPos !== null && (
            <path
              d={TRAIL_BAND_D}
              fill={STAGES[stage].color}
              opacity={0.35}
              clipPath={`url(#${uid}-seg)`}
            />
          )}
          {showGap && userPoint && fieldPoint && (
            <g
              className="terrain__gap"
              data-testid="gap-span"
              data-sign={gapSign(gap!)}
            >
              <line
                x1={userPoint.x}
                y1={GAP_SPAN_Y}
                x2={fieldPoint.x}
                y2={GAP_SPAN_Y}
                stroke={gap! < 0 ? 'var(--accent)' : 'var(--field)'}
                strokeWidth={1.5}
              />
              {[userPoint.x, fieldPoint.x].map((x, i) => (
                <line
                  key={i}
                  x1={x}
                  y1={GAP_SPAN_Y - 4}
                  x2={x}
                  y2={GAP_SPAN_Y + 4}
                  stroke={gap! < 0 ? 'var(--accent)' : 'var(--field)'}
                  strokeWidth={1.5}
                />
              ))}
              <text
                x={(userPoint.x + fieldPoint.x) / 2}
                y={GAP_SPAN_Y + 18}
                textAnchor="middle"
                className="terrain__annotation"
                fill={gap! < 0 ? 'var(--accent)' : 'var(--field)'}
              >
                {gapLabel(gap!)}
              </text>
            </g>
          )}

          {/* Uncertainty as horizontal extent, not a hard point. Asymmetric
              when a transition is named - that is how "transitioning from
              Doubt to Discomfort" is drawn. */}
          {stage && confidence && userPoint && userPos !== null && (
            <ellipse
              className="terrain__uncertainty"
              cx={
                transitionToward
                  ? pointAtPosition(
                      userPos +
                        (POSITION[transitionToward] > userPos ? 1 : -1) *
                          UNCERTAINTY_HALF_WIDTH[confidence] *
                          0.25,
                    ).x
                  : userPoint.x
              }
              cy={userPoint.y}
              rx={
                uncertaintyRx(userPos, confidence) *
                (transitionToward ? 1.25 : 1)
              }
              ry={16}
              fill={`url(#${uid}-uncert)`}
              data-testid="uncertainty-band"
              data-confidence={confidence}
            />
          )}

          <g ref={groupRef} onKeyDown={onKeyDown}>
            {STATIONS.map((st, i) => {
              const isCurrent = st.stage === stage;
              const state = isCurrent
                ? 'current'
                : stage && Math.abs(POSITION[st.stage] - POSITION[stage]) === 1
                  ? 'adjacent'
                  : 'other';
              const labelDy = st.anchor === 'above' ? -26 : 30;

              return (
                <g
                  key={st.stage}
                  data-station={st.stage}
                  data-stage={st.stage}
                  data-state={state}
                  className="terrain__station"
                  tabIndex={interactive ? (i === focusIndex ? 0 : -1) : undefined}
                  role={interactive ? 'button' : undefined}
                  aria-label={
                    interactive
                      ? `${STAGES[st.stage].name}, stage ${st.position} of 6`
                      : undefined
                  }
                  aria-current={isCurrent ? 'step' : undefined}
                  onClick={interactive ? () => onStageSelect?.(st.stage) : undefined}
                  onFocus={() => setFocusIndex(i)}
                  style={{ cursor: interactive ? 'pointer' : 'default' }}
                >
                  {/* Hit area is >=44px regardless of the 5-9px visual radius. */}
                  <rect
                    x={st.x - 30}
                    y={st.y - (st.anchor === 'above' ? 34 : 14)}
                    width={60}
                    height={48}
                    fill="transparent"
                  />
                  <circle
                    cx={st.x}
                    cy={st.y}
                    r={5}
                    fill={STAGES[st.stage].color}
                    stroke="var(--bg)"
                    strokeWidth={1.5}
                    className="terrain__dot"
                  />
                  <text
                    x={st.x}
                    y={st.y + labelDy}
                    textAnchor="middle"
                    className={compact ? 'terrain__label--compact' : 'terrain__label'}
                    fill={isCurrent ? 'var(--text)' : 'var(--text-dim)'}
                    fontWeight={isCurrent ? 700 : 600}
                  >
                    {compact && !isCurrent ? st.position : STAGES[st.stage].name}
                  </text>
                </g>
              );
            })}
          </g>

          {fieldPoint && showGap && (
            <g
              className="terrain__field"
              opacity={0.7}
              data-testid="field-marker"
            >
              <path
                d={diamond(fieldPoint.x, fieldPoint.y, 7)}
                fill="none"
                stroke="var(--field)"
                strokeWidth={2}
              />
              <text
                x={fieldPoint.x}
                y={fieldPoint.y - 16}
                textAnchor="middle"
                className="terrain__annotation"
                fill="var(--field)"
              >
                {domain ? DOMAINS[domain].name : ''}
              </text>
            </g>
          )}

          {userPoint && (
            <g
              className={`terrain__you${revealing ? ' terrain__you--reveal' : ''}`}
              data-testid="you-marker"
            >
              <circle
                cx={userPoint.x}
                cy={userPoint.y}
                r={9}
                fill={stage ? STAGES[stage].color : 'var(--accent)'}
                stroke="var(--accent)"
                strokeWidth={2.5}
              />
              <circle
                cx={userPoint.x}
                cy={userPoint.y}
                r={5}
                fill="none"
                stroke="rgba(0,0,0,0.35)"
                strokeWidth={1}
              />
              {/* Always below the marker. At the summit the station label
                  already occupies the space above it. */}
              <text
                x={userPoint.x}
                y={userPoint.y + 26}
                textAnchor="middle"
                className={compact ? 'terrain__you-label--compact' : 'terrain__you-label'}
                fill="var(--text)"
              >
                You
              </text>
            </g>
          )}

          {/* The thinking indicator lives on the trail rather than in a
              separate spinner, because the trail is what is about to
              change. Under reduced motion the CSS swaps the sweep for a
              static label. */}
          {thinking && (
            <g data-testid="trail-sweep" className="terrain__sweep">
              <path d={TRAIL_BAND_D} fill="var(--accent)" opacity={0.18} />
              <text
                x={VIEW_W / 2}
                y={28}
                textAnchor="middle"
                className="terrain__annotation terrain__sweep-label"
                fill="var(--text-faint)"
              >
                Thinking…
              </text>
            </g>
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
          {textView ? 'Show diagram' : 'Text view'}
        </button>
      </figcaption>
    </figure>
  );
}

function uncertaintyRx(userPos: number, confidence: Confidence): number {
  const half = UNCERTAINTY_HALF_WIDTH[confidence];
  const a = pointAtPosition(Math.max(1, userPos - half));
  const b = pointAtPosition(Math.min(6, userPos + half));
  return Math.max(14, Math.abs(b.x - a.x) / 2 + widthAtPosition(userPos));
}

function diamond(cx: number, cy: number, r: number): string {
  return `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`;
}
