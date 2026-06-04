import { useCallback, useRef, useState } from 'react';
import { Match, PersonFilter } from '../../types';
import { getPersonForCountry, getTeamsForPerson } from '../../data/entrants';

interface KnockoutViewProps {
  filter: PersonFilter;
  matches: Match[];
}

/* ── Bracket structure ─────────────────────────────────────────────────
   Hard-coded match IDs per round for each half of the bracket.
   Top half feeds into SF 101, bottom half into SF 102.
   Pairs are listed in bracket order (adjacent pairs feed same R16, etc). */
const TOP = {
  qf: [97, 98],
  r16: [89, 90, 93, 94],
  r32: [74, 77, 73, 75, 83, 84, 81, 82],
  sf: [101],
};
const BOT = {
  qf: [99, 100],
  r16: [91, 92, 95, 96],
  r32: [76, 78, 79, 80, 86, 88, 85, 87],
  sf: [102],
};

/* ── Layout constants ─────────────────────────────────────────────── */
const CARD_H = 52;
const SLOT = 60;
const COL_W = 156;
const GAP = 20;
const LABEL_H = 18;
const BRACKET_GAP = 50;

function positions(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i * SLOT);
}

function mids(pos: number[]): number[] {
  const r: number[] = [];
  for (let i = 0; i < pos.length; i += 2) r.push((pos[i]! + pos[i + 1]!) / 2);
  return r;
}

type PosMap = Map<number, number>;

function buildPosMap(half: typeof TOP): PosMap {
  const map: PosMap = new Map();
  const r32 = positions(8);
  const r16 = mids(r32);
  const qf = mids(r16);
  const sf = mids(qf);
  half.r32.forEach((id, i) => map.set(id, r32[i]!));
  half.r16.forEach((id, i) => map.set(id, r16[i]!));
  half.qf.forEach((id, i) => map.set(id, qf[i]!));
  half.sf.forEach((id, i) => map.set(id, sf[i]!));
  return map;
}

const ROUNDS = ['r32', 'r16', 'qf', 'sf'] as const;
const ROUND_LABELS: Record<string, string> = {
  qf: 'QF',
  r16: 'R16',
  r32: 'R32',
  sf: 'SF',
};

const HALF_H = 8 * SLOT;
const HALF_TOTAL = LABEL_H + HALF_H;
const SF_Y_IN_HALF = 210;

const BRACKET_COLS_W = ROUNDS.length * (COL_W + GAP);
const FINAL_COL_X = BRACKET_COLS_W;
const SF_COL_RIGHT = (ROUNDS.length - 1) * (COL_W + GAP) + COL_W;

const TOP_SF_CENTER = LABEL_H + SF_Y_IN_HALF + CARD_H / 2;
const BOT_SF_CENTER = HALF_TOTAL + BRACKET_GAP + LABEL_H + SF_Y_IN_HALF + CARD_H / 2;
const FINAL_CENTER = (TOP_SF_CENTER + BOT_SF_CENTER) / 2;
const FINAL_TOP = FINAL_CENTER - CARD_H / 2;
const THIRD_TOP = FINAL_TOP + CARD_H + 24;

const TOTAL_W = FINAL_COL_X + COL_W;
const TOTAL_H = 2 * HALF_TOTAL + BRACKET_GAP;

/* ── Main component ───────────────────────────────────────────────── */
export function KnockoutView({ filter, matches }: KnockoutViewProps) {
  const matchMap = new Map(matches.map((m) => [Number(m.id), m]));
  const personTeams = filter.person ? getTeamsForPerson(filter.person).map((e) => e.country) : [];

  return (
    <div className="space-y-4">
      <p className="text-center text-xs text-gray-500">Drag to pan, scroll to zoom</p>
      <PanZoomContainer>
        <div className="relative" style={{ height: TOTAL_H, width: TOTAL_W }}>
          {/* Top half */}
          <div className="absolute left-0 top-0">
            <BracketHalf
              filter={filter}
              half={TOP}
              matchMap={matchMap}
              personTeams={personTeams}
            />
          </div>

          {/* Bottom half */}
          <div className="absolute left-0" style={{ top: HALF_TOTAL + BRACKET_GAP }}>
            <BracketHalf
              filter={filter}
              half={BOT}
              matchMap={matchMap}
              personTeams={personTeams}
            />
          </div>

          {/* Final */}
          <div className="absolute" style={{ left: FINAL_COL_X, top: FINAL_TOP - LABEL_H, width: COL_W }}>
            <div className="mb-1 text-center text-[10px] font-bold uppercase tracking-widest text-gold">
              Final
            </div>
            <MatchCard
              filter={filter}
              match={matchMap.get(104)}
              personTeams={personTeams}
            />
          </div>

          {/* Third Place (unconnected, below the Final) */}
          <div className="absolute" style={{ left: FINAL_COL_X, top: THIRD_TOP, width: COL_W }}>
            <div className="mb-1 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
              3rd Place
            </div>
            <MatchCard
              filter={filter}
              match={matchMap.get(103)}
              personTeams={personTeams}
            />
          </div>

          {/* SF → Final connectors */}
          <svg className="pointer-events-none absolute inset-0" style={{ overflow: 'visible' }}>
            <FinalConnectors />
          </svg>
        </div>
      </PanZoomContainer>
    </div>
  );
}

/** SVG lines connecting both SF matches to the Final. */
function FinalConnectors() {
  const midX = SF_COL_RIGHT + GAP / 2;
  const lines = [
    { x1: SF_COL_RIGHT, x2: midX, y1: TOP_SF_CENTER, y2: TOP_SF_CENTER },
    { x1: SF_COL_RIGHT, x2: midX, y1: BOT_SF_CENTER, y2: BOT_SF_CENTER },
    { x1: midX, x2: midX, y1: TOP_SF_CENTER, y2: BOT_SF_CENTER },
    { x1: midX, x2: FINAL_COL_X, y1: FINAL_CENTER, y2: FINAL_CENTER },
  ];
  return (
    <>
      {lines.map((l, i) => (
        <line
          key={i}
          stroke="#4b5563"
          strokeWidth={1}
          x1={l.x1}
          x2={l.x2}
          y1={l.y1}
          y2={l.y2}
        />
      ))}
    </>
  );
}

/* ── Bracket half ──────────────────────────────────────────────────── */
function BracketHalf({
  filter,
  half,
  matchMap,
  personTeams,
}: {
  filter: PersonFilter;
  half: typeof TOP;
  matchMap: Map<number, Match>;
  personTeams: string[];
}) {
  const posMap = buildPosMap(half);

  return (
    <div className="relative flex gap-0" style={{ height: HALF_TOTAL }}>
      {ROUNDS.map((round, colIdx) => {
        const ids = half[round];
        return (
          <div key={round} className="relative shrink-0" style={{ width: COL_W + GAP }}>
            <div className="mb-1 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {ROUND_LABELS[round]}
            </div>
            <div className="relative" style={{ height: HALF_H }}>
              {ids.map((id) => {
                const y = posMap.get(id) ?? 0;
                return (
                  <div
                    className="absolute left-0"
                    key={id}
                    style={{ top: y, width: COL_W }}
                  >
                    <MatchCard
                      filter={filter}
                      match={matchMap.get(id)}
                      personTeams={personTeams}
                    />
                  </div>
                );
              })}

              {colIdx < ROUNDS.length - 1 && (
                <ConnectorLines
                  cardH={CARD_H}
                  colW={COL_W}
                  gap={GAP}
                  ids={ids}
                  posMap={posMap}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Connector lines (SVG) ─────────────────────────────────────────── */
function ConnectorLines({
  cardH,
  colW,
  gap,
  ids,
  posMap,
}: {
  cardH: number;
  colW: number;
  gap: number;
  ids: number[];
  posMap: PosMap;
}) {
  const lines: { x1: number; x2: number; y1: number; y2: number }[] = [];
  for (let i = 0; i < ids.length; i += 2) {
    const topY = (posMap.get(ids[i]!) ?? 0) + cardH / 2;
    const botY = (posMap.get(ids[i + 1]!) ?? 0) + cardH / 2;
    const midY = (topY + botY) / 2;
    const x1 = colW;
    const x2 = colW + gap;

    lines.push({ x1, x2: x1 + gap / 2, y1: topY, y2: topY });
    lines.push({ x1, x2: x1 + gap / 2, y1: botY, y2: botY });
    lines.push({ x1: x1 + gap / 2, x2: x1 + gap / 2, y1: topY, y2: botY });
    lines.push({ x1: x1 + gap / 2, x2, y1: midY, y2: midY });
  }

  return (
    <svg className="pointer-events-none absolute inset-0" style={{ overflow: 'visible' }}>
      {lines.map((l, i) => (
        <line
          key={i}
          stroke="#4b5563"
          strokeWidth={1}
          x1={l.x1}
          x2={l.x2}
          y1={l.y1}
          y2={l.y2}
        />
      ))}
    </svg>
  );
}

/* ── Match card ────────────────────────────────────────────────────── */
function MatchCard({
  filter,
  match,
  personTeams,
}: {
  filter: PersonFilter;
  match: Match | undefined;
  personTeams: string[];
}) {
  if (!match) return null;

  const hasScore = match.homeScore != null;
  const isTbd = match.homeTeam === 'TBD';
  const highlightHome =
    filter.mode === 'highlight' && !isTbd && personTeams.includes(match.homeTeam);
  const highlightAway =
    filter.mode === 'highlight' && !isTbd && personTeams.includes(match.awayTeam);
  const highlighted = highlightHome || highlightAway;

  return (
    <div
      className={`rounded border text-xs ${
        highlighted ? 'border-gold/60 bg-gray-800' : 'border-gray-700 bg-gray-800'
      }`}
      style={{ height: CARD_H }}
    >
      <div className="flex flex-col justify-center px-2" style={{ height: CARD_H }}>
        {isTbd ? (
          <div className="truncate text-[10px] text-gray-500">
            {match.description ?? 'TBD v TBD'}
          </div>
        ) : (
          <>
            <TeamRow
              highlight={highlightHome}
              score={hasScore ? match.homeScore : undefined}
              team={match.homeTeam}
              won={hasScore && match.homeScore! > match.awayScore!}
            />
            <TeamRow
              highlight={highlightAway}
              score={hasScore ? match.awayScore : undefined}
              team={match.awayTeam}
              won={hasScore && match.awayScore! > match.homeScore!}
            />
          </>
        )}
      </div>
    </div>
  );
}

function TeamRow({
  highlight,
  score,
  team,
  won,
}: {
  highlight: boolean;
  score: number | undefined;
  team: string;
  won: boolean;
}) {
  const person = getPersonForCountry(team);
  return (
    <div className={`flex items-center gap-1 ${highlight ? 'text-gold' : ''} ${won ? 'font-bold' : ''}`}>
      <span className="flex-1 truncate">{team}</span>
      {person && (
        <span className={`text-[9px] ${highlight ? 'text-gold/80' : 'text-gray-500'}`}>
          {person}
        </span>
      )}
      {score != null && <span className="ml-auto tabular-nums">{score}</span>}
    </div>
  );
}

/* ── Pan / Zoom container ──────────────────────────────────────────── */
function PanZoomContainer({ children }: { children: React.ReactNode }) {
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [scale, setScale] = useState(1);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const pinchDist = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'touch' && e.isPrimary === false) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setTx((t) => t + dx);
    setTy((t) => t + dy);
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.min(3, Math.max(0.3, s * delta)));
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0]!.clientX - e.touches[1]!.clientX;
      const dy = e.touches[0]!.clientY - e.touches[1]!.clientY;
      pinchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDist.current != null) {
      const dx = e.touches[0]!.clientX - e.touches[1]!.clientX;
      const dy = e.touches[0]!.clientY - e.touches[1]!.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / pinchDist.current;
      pinchDist.current = dist;
      setScale((s) => Math.min(3, Math.max(0.3, s * ratio)));
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    pinchDist.current = null;
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-gray-700 bg-gray-900"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      onTouchStart={onTouchStart}
      onWheel={onWheel}
      ref={containerRef}
      style={{ cursor: 'grab', height: 600, touchAction: 'none' }}
    >
      <div
        className="inline-block origin-top-left p-4"
        style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
