import { GroupStanding, Match, PersonFilter } from '../../types';
import { getPersonForCountry } from '../../data/entrants';
import { PersonTag } from '../common/PersonTag';
import {
  HIGHLIGHT_CONTAINER_CLASSES,
  HIGHLIGHT_ROW_CLASSES,
  isMatchHighlighted,
  isTeamHighlighted,
} from '../../utils/personHighlight';
import { formatMatchKickoff } from '../../utils/dates';

interface GroupTableProps {
  filter: PersonFilter;
  groupName: string;
  matches: Match[];
  standings: GroupStanding[];
}

export function GroupTable({ filter, groupName, matches, standings }: GroupTableProps) {
  const played = matches.filter((m) => m.homeScore != null);
  const upcoming = matches.filter((m) => m.homeScore == null);
  const highlightPerson = filter.mode === 'highlight' ? filter.person : null;

  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <h3 className="mb-3 text-lg font-bold text-gold">Group {groupName}</h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400">
            <th className="pb-2 text-left">Team</th>
            <th className="pb-2 text-center w-7">P</th>
            <th className="pb-2 text-center w-7">W</th>
            <th className="pb-2 text-center w-7">D</th>
            <th className="pb-2 text-center w-7">L</th>
            <th className="hidden pb-2 text-center w-7 sm:table-cell">GF</th>
            <th className="hidden pb-2 text-center w-7 sm:table-cell">GA</th>
            <th className="pb-2 text-center w-8">GD</th>
            <th className="pb-2 text-center w-8 font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => {
            const highlighted = isTeamHighlighted(s.team, filter);
            const person = getPersonForCountry(s.team);

            return (
              <tr
                className={`border-b border-gray-700/50 ${i < 2 ? 'bg-pitch/20' : ''} ${
                  highlighted ? HIGHLIGHT_ROW_CLASSES : ''
                }`}
                key={s.team}
              >
                <td className="py-2">
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="font-medium">{s.team}</span>
                    {person && (
                      <PersonTag highlighted={highlightPerson === person} name={person} />
                    )}
                  </div>
                </td>
                <td className="text-center">{s.played}</td>
                <td className="text-center">{s.won}</td>
                <td className="text-center">{s.drawn}</td>
                <td className="text-center">{s.lost}</td>
                <td className="hidden text-center sm:table-cell">{s.goalsFor}</td>
                <td className="hidden text-center sm:table-cell">{s.goalsAgainst}</td>
                <td className="text-center">{s.goalsFor - s.goalsAgainst}</td>
                <td className="text-center font-bold">{s.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {(played.length > 0 || upcoming.length > 0) && (
        <div className="mt-3 space-y-3 border-t border-gray-700 pt-3">
          <div className="grid grid-cols-[4.75rem_minmax(0,1fr)_3ch_minmax(0,1fr)] items-center gap-x-1.5 gap-y-1">
            {played.length > 0 && (
              <>
                <h4 className="col-span-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Results
                </h4>
                {played.map((match) => (
                  <MatchRow filter={filter} key={match.id} match={match} />
                ))}
              </>
            )}
            {upcoming.length > 0 && (
              <>
                <h4
                  className={`col-span-4 text-xs font-semibold uppercase tracking-wider text-gray-500 ${
                    played.length > 0 ? 'mt-2' : ''
                  }`}
                >
                  Upcoming
                </h4>
                {upcoming.map((match) => (
                  <MatchRow filter={filter} key={match.id} match={match} />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchRow({ filter, match }: { filter: PersonFilter; match: Match }) {
  const hasScore = match.homeScore != null;
  const highlighted = isMatchHighlighted(match, filter);

  return (
    <div
      className={`col-span-4 grid grid-cols-subgrid items-center rounded text-xs ${
        highlighted ? HIGHLIGHT_CONTAINER_CLASSES : ''
      }`}
    >
      <span className="whitespace-nowrap tabular-nums text-gray-500">
        {formatMatchKickoff(match.date, match.time)}
      </span>
      <span className="min-w-0 truncate text-right font-medium">{match.homeTeam}</span>
      <span className="text-center font-mono text-gray-300">
        {hasScore ? `${match.homeScore}-${match.awayScore}` : '\u00A0v\u00A0'}
      </span>
      <span className="min-w-0 truncate text-left font-medium">{match.awayTeam}</span>
    </div>
  );
}
