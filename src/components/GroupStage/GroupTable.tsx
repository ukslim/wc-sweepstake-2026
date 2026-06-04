import { GroupStanding, Match } from '../../types';
import { TeamName } from '../common/TeamName';
import { formatDate } from '../../utils/dates';

interface GroupTableProps {
  groupName: string;
  highlightPerson?: string | null;
  matches: Match[];
  standings: GroupStanding[];
}

export function GroupTable({ groupName, highlightPerson, matches, standings }: GroupTableProps) {
  const played = matches.filter((m) => m.homeScore != null);
  const upcoming = matches.filter((m) => m.homeScore == null);

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
          {standings.map((s, i) => (
            <tr
              className={`border-b border-gray-700/50 ${i < 2 ? 'bg-pitch/20' : ''}`}
              key={s.team}
            >
              <td className="py-2">
                <TeamName country={s.team} highlightPerson={highlightPerson} />
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
          ))}
        </tbody>
      </table>

      {played.length > 0 && (
        <div className="mt-3 border-t border-gray-700 pt-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Results
          </h4>
          <div className="space-y-1">
            {played.map((m) => (
              <MatchRow highlightPerson={highlightPerson} key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mt-3 border-t border-gray-700 pt-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Upcoming
          </h4>
          <div className="space-y-1">
            {upcoming.map((m) => (
              <MatchRow highlightPerson={highlightPerson} key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchRow({ highlightPerson, match }: { highlightPerson?: string | null; match: Match }) {
  const hasScore = match.homeScore != null;
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="w-16 shrink-0 text-gray-500">
        {formatDate(match.date).replace(/,.*/, '')} {match.time}
      </span>
      <span className="flex flex-1 items-center justify-center gap-1 text-center">
        <TeamName country={match.homeTeam} highlightPerson={highlightPerson} showPerson={false} />
        <span className="mx-1 font-mono text-gray-300">
          {hasScore ? `${match.homeScore} - ${match.awayScore}` : 'v'}
        </span>
        <TeamName country={match.awayTeam} highlightPerson={highlightPerson} showPerson={false} />
      </span>
    </div>
  );
}
