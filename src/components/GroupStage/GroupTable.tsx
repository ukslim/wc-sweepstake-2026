import { GroupStanding } from '../../types';
import { TeamName } from '../common/TeamName';

interface GroupTableProps {
  groupName: string;
  highlightPerson?: string | null;
  standings: GroupStanding[];
}

export function GroupTable({ groupName, highlightPerson, standings }: GroupTableProps) {
  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <h3 className="mb-3 text-lg font-bold text-gold">Group {groupName}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400">
            <th className="pb-2 text-left">Team</th>
            <th className="pb-2 text-center w-8">P</th>
            <th className="pb-2 text-center w-8">W</th>
            <th className="pb-2 text-center w-8">D</th>
            <th className="pb-2 text-center w-8">L</th>
            <th className="pb-2 text-center w-10">GD</th>
            <th className="pb-2 text-center w-10 font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr
              className={`border-b border-gray-700/50 ${
                i < 2 ? 'bg-pitch/20' : ''
              }`}
              key={s.team}
            >
              <td className="py-2">
                <TeamName country={s.team} highlightPerson={highlightPerson} />
              </td>
              <td className="text-center">{s.played}</td>
              <td className="text-center">{s.won}</td>
              <td className="text-center">{s.drawn}</td>
              <td className="text-center">{s.lost}</td>
              <td className="text-center">{s.goalsFor - s.goalsAgainst}</td>
              <td className="text-center font-bold">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
