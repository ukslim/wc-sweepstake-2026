import { groups } from '../../data/groups';
import { schedule } from '../../data/schedule';
import { PersonFilter } from '../../types';
import { calculateStandings } from '../../utils/standings';
import { getTeamsForPerson } from '../../data/entrants';
import { GroupTable } from './GroupTable';

interface GroupStageViewProps {
  filter: PersonFilter;
}

export function GroupStageView({ filter }: GroupStageViewProps) {
  const personTeams = filter.person ? getTeamsForPerson(filter.person).map((e) => e.country) : [];

  const visibleGroups =
    filter.person && filter.mode === 'filter'
      ? groups.filter((g) => g.teams.some((t) => personTeams.includes(t)))
      : groups;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {visibleGroups.map((group) => {
        const groupMatches = schedule.filter(
          (m) =>
            m.round === 'group' &&
            group.teams.includes(m.homeTeam) &&
            group.teams.includes(m.awayTeam)
        );
        const standings = calculateStandings(group.teams, groupMatches);

        return (
          <GroupTable
            groupName={group.name}
            highlightPerson={filter.mode === 'highlight' ? filter.person : null}
            key={group.name}
            standings={standings}
          />
        );
      })}
    </div>
  );
}
