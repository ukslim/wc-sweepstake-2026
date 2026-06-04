import { PersonFilter } from '../../types';
import { schedule } from '../../data/schedule';
import { getResult } from '../../data/results';
import { getTeamsForPerson } from '../../data/entrants';
import { TeamName } from '../common/TeamName';
import { formatDate, isMatchPast, isToday } from '../../utils/dates';

interface CalendarViewProps {
  filter: PersonFilter;
}

export function CalendarView({ filter }: CalendarViewProps) {
  const personTeams = filter.person ? getTeamsForPerson(filter.person).map((e) => e.country) : [];

  const matches = filter.person && filter.mode === 'filter'
    ? schedule.filter(
        (m) => personTeams.includes(m.homeTeam) || personTeams.includes(m.awayTeam)
      )
    : schedule;

  const sorted = [...matches].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
  });

  const grouped = sorted.reduce<Record<string, typeof sorted>>((acc, match) => {
    (acc[match.date] ??= []).push(match);
    return acc;
  }, {});

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
                const result = getResult(match.id);
                const matchPast = isMatchPast(match.date, match.time);

                return (
                  <div
                    className={`flex items-center gap-4 rounded-lg bg-gray-800 px-4 py-3 ${
                      matchPast ? 'opacity-70' : ''
                    }`}
                    key={match.id}
                  >
                    <span className="w-14 text-sm text-gray-400">{match.time}</span>
                    <div className="flex flex-1 items-center gap-2">
                      <TeamName
                        country={match.homeTeam}
                        highlightPerson={filter.mode === 'highlight' ? filter.person : null}
                      />
                      <span className="mx-2 font-mono">
                        {result ? `${result.homeScore} - ${result.awayScore}` : 'v'}
                      </span>
                      <TeamName
                        country={match.awayTeam}
                        highlightPerson={filter.mode === 'highlight' ? filter.person : null}
                      />
                    </div>
                    <span className="hidden text-xs text-gray-500 sm:block">{match.location}</span>
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
