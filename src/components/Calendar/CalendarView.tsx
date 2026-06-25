import { Match, PersonFilter } from '../../types';
import { getPersonForCountry, getTeamsForPerson } from '../../data/entrants';
import { knockoutTokens } from '../../utils/bracket';
import { PersonTag } from '../common/PersonTag';
import { formatDate, isMatchPast, isToday } from '../../utils/dates';
import { HIGHLIGHT_CONTAINER_CLASSES, isMatchHighlighted } from '../../utils/personHighlight';

interface CalendarViewProps {
  filter: PersonFilter;
  matches: Match[];
}

const ROUND_LABELS: Record<string, string> = {
  'final': 'Final',
  'group': 'Group',
  'quarter-final': 'QF',
  'round-of-16': 'R16',
  'round-of-32': 'R32',
  'semi-final': 'SF',
  'third-place': '3rd',
};

function getRoundBadge(match: Match): string {
  if (match.round === 'group' && match.group) {
    return `Grp ${match.group}`;
  }
  return ROUND_LABELS[match.round] ?? match.round;
}

function CalendarMatchRow({
  highlighted,
  highlightPerson,
  match,
}: {
  highlighted: boolean;
  highlightPerson: string | null;
  match: Match;
}) {
  const matchPast = isMatchPast(match.date, match.time);
  const homeIsTbd = match.homeTeam === 'TBD';
  const awayIsTbd = match.awayTeam === 'TBD';
  const [homeToken, awayToken] = knockoutTokens(match.description);
  const homeLabel = homeIsTbd ? homeToken : match.homeTeam;
  const awayLabel = awayIsTbd ? awayToken : match.awayTeam;
  const showScore = match.homeScore != null && !homeIsTbd && !awayIsTbd;
  const homePerson = homeIsTbd ? undefined : getPersonForCountry(match.homeTeam);
  const awayPerson = awayIsTbd ? undefined : getPersonForCountry(match.awayTeam);

  return (
    <div
      className={`grid w-full min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 gap-y-0.5 overflow-hidden rounded-lg bg-gray-800 px-3 py-2.5 lg:grid-cols-[2.25rem_minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,1fr)] lg:rounded-none lg:border-b lg:border-gray-700/50 lg:bg-transparent lg:last:border-b-0 ${
        highlighted ? HIGHLIGHT_CONTAINER_CLASSES : ''
      } ${matchPast ? 'opacity-70' : ''}`}
    >
      <span className="col-start-1 row-start-1 text-xs tabular-nums text-gray-400">{match.time}</span>
      <span
        className={`col-start-2 row-start-1 min-w-0 truncate text-right text-xs ${
          homeIsTbd ? 'text-gray-400' : 'font-medium'
        }`}
      >
        {homeLabel}
      </span>
      <span className="col-start-3 row-span-2 row-start-1 shrink-0 self-center px-1 font-mono text-sm font-semibold text-gray-100">
        {showScore ? `${match.homeScore}-${match.awayScore}` : 'v'}
      </span>
      <span
        className={`col-start-4 row-start-1 min-w-0 truncate text-left text-xs ${
          awayIsTbd ? 'text-gray-400' : 'font-medium'
        }`}
      >
        {awayLabel}
      </span>
      <span className="col-start-1 row-start-2 rounded bg-gray-700 px-1 py-0.5 text-center text-[10px] leading-tight text-gray-300">
        {getRoundBadge(match)}
      </span>
      {homePerson && (
        <span className="col-start-2 row-start-2 flex min-w-0 justify-end overflow-hidden">
          <PersonTag highlighted={highlightPerson === homePerson} name={homePerson} />
        </span>
      )}
      {awayPerson && (
        <span className="col-start-4 row-start-2 min-w-0 overflow-hidden">
          <PersonTag highlighted={highlightPerson === awayPerson} name={awayPerson} />
        </span>
      )}
      <span className="hidden min-w-0 text-right text-xs leading-tight text-gray-500 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:block lg:self-center">
        <span className="block truncate">{match.venue}</span>
        {match.city && <span className="block truncate text-gray-600">{match.city}</span>}
      </span>
    </div>
  );
}

export function CalendarView({ filter, matches }: CalendarViewProps) {
  const personTeams = filter.person ? getTeamsForPerson(filter.person).map((e) => e.country) : [];

  const filtered =
    filter.person && filter.mode === 'filter'
      ? matches.filter(
          (m) => personTeams.includes(m.homeTeam) || personTeams.includes(m.awayTeam)
        )
      : matches;

  const sorted = [...filtered].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
  });

  const grouped = sorted.reduce<Record<string, typeof sorted>>((acc, match) => {
    (acc[match.date] ??= []).push(match);
    return acc;
  }, {});

  const highlightPerson = filter.mode === 'highlight' ? filter.person : null;

  return (
    <div className="space-y-6 lg:max-w-lg">
      {Object.entries(grouped).map(([date, dayMatches]) => {
        const past = isMatchPast(date, '23:59');
        const today = isToday(date);

        return (
          <div key={date}>
            <h3
              className={`mb-3 text-sm font-bold uppercase tracking-wider ${
                today ? 'text-gold' : past ? 'text-gray-500' : 'text-gray-300'
              }`}
            >
              {formatDate(date)} {today && '— Today'}
            </h3>
            <div className="flex flex-col gap-2 lg:gap-0 lg:overflow-hidden lg:rounded-lg lg:border lg:border-gray-700/80 lg:bg-gray-800">
              {dayMatches.map((match) => (
                <CalendarMatchRow
                  highlighted={isMatchHighlighted(match, filter)}
                  highlightPerson={highlightPerson}
                  key={match.id}
                  match={match}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
