import { Match, PersonFilter } from '../../types';
import { getTeamsForPerson } from '../../data/entrants';
import { TeamName } from '../common/TeamName';
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
    <div className="space-y-6">
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
            <div className="space-y-2">
              {dayMatches.map((match) => {
                const hasScore = match.homeScore != null;
                const matchPast = isMatchPast(match.date, match.time);
                const isTbd = match.homeTeam === 'TBD';
                const highlighted = isMatchHighlighted(match, filter);

                return (
                  <div
                    className={`flex items-start gap-3 rounded-lg bg-gray-800 px-4 py-3 ${
                      highlighted ? HIGHLIGHT_CONTAINER_CLASSES : ''
                    } ${matchPast ? 'opacity-70' : ''}`}
                    key={match.id}
                  >
                    <div className="flex w-12 shrink-0 flex-col gap-1">
                      <span className="text-sm text-gray-400">{match.time}</span>
                      <span className="rounded bg-gray-700 px-1.5 py-0.5 text-center text-xs text-gray-300">
                        {getRoundBadge(match)}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-0.5">
                      {isTbd ? (
                        <span className="text-sm text-gray-400">
                          {match.description ?? 'TBD v TBD'}
                        </span>
                      ) : (
                        <>
                          <TeamName
                            country={match.homeTeam}
                            highlightPerson={highlightPerson}
                          />
                          <span className="mx-1 shrink-0 font-mono text-sm">
                            {hasScore ? `${match.homeScore} - ${match.awayScore}` : 'v'}
                          </span>
                          <TeamName
                            country={match.awayTeam}
                            highlightPerson={highlightPerson}
                          />
                        </>
                      )}
                    </div>
                    <span className="hidden shrink-0 text-xs text-gray-500 lg:block">
                      {match.location}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
