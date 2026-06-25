import { Match, PersonFilter } from '../../types';
import { getPersonForCountry, getTeamsForPerson } from '../../data/entrants';
import { knockoutTokens } from '../../utils/bracket';

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
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div
        className="relative inline-block min-w-full rounded-lg border border-gray-700 bg-gray-900 p-4"
        style={{ height: TOTAL_H, width: TOTAL_W }}
      >
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
  const homeIsTbd = match.homeTeam === 'TBD';
  const awayIsTbd = match.awayTeam === 'TBD';
  const [homeToken, awayToken] = knockoutTokens(match.description);
  const showScores = hasScore && !homeIsTbd && !awayIsTbd;
  const highlightHome =
    filter.mode === 'highlight' && !homeIsTbd && personTeams.includes(match.homeTeam);
  const highlightAway =
    filter.mode === 'highlight' && !awayIsTbd && personTeams.includes(match.awayTeam);
  const highlighted = highlightHome || highlightAway;

  return (
    <div
      className={`rounded border text-xs ${
        highlighted ? 'border-gold/60 bg-gray-800' : 'border-gray-700 bg-gray-800'
      }`}
      style={{ height: CARD_H }}
    >
      <div className="flex flex-col justify-center px-2" style={{ height: CARD_H }}>
        <TeamRow
          highlight={highlightHome}
          placeholder={homeIsTbd}
          score={showScores ? match.homeScore : undefined}
          team={homeIsTbd ? homeToken : match.homeTeam}
          won={showScores && match.homeScore! > match.awayScore!}
        />
        <TeamRow
          highlight={highlightAway}
          placeholder={awayIsTbd}
          score={showScores ? match.awayScore : undefined}
          team={awayIsTbd ? awayToken : match.awayTeam}
          won={showScores && match.awayScore! > match.homeScore!}
        />
      </div>
    </div>
  );
}

function TeamRow({
  highlight,
  placeholder,
  score,
  team,
  won,
}: {
  highlight: boolean;
  placeholder: boolean;
  score: number | undefined;
  team: string;
  won: boolean;
}) {
  const person = placeholder ? undefined : getPersonForCountry(team);
  return (
    <div
      className={`flex items-center gap-1 ${highlight ? 'rounded bg-gold/5 px-0.5 text-gold' : ''} ${won ? 'font-bold' : ''} ${placeholder ? 'text-[10px] text-gray-500' : ''}`}
    >
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
