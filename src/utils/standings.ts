import { GroupStanding, Match } from '../types';
import { getResult } from '../data/results';

/** Calculate group standings from the schedule and results. */
export function calculateStandings(groupTeams: string[], matches: Match[]): GroupStanding[] {
  const standings = new Map<string, GroupStanding>(
    groupTeams.map((team) => [
      team,
      { drawn: 0, goalsAgainst: 0, goalsFor: 0, lost: 0, played: 0, points: 0, team, won: 0 },
    ])
  );

  for (const match of matches) {
    const result = getResult(match.id);
    if (!result) continue;

    const home = standings.get(match.homeTeam);
    const away = standings.get(match.awayTeam);
    if (!home || !away) continue;

    home.played++;
    away.played++;
    home.goalsFor += result.homeScore;
    home.goalsAgainst += result.awayScore;
    away.goalsFor += result.awayScore;
    away.goalsAgainst += result.homeScore;

    if (result.homeScore > result.awayScore) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (result.homeScore < result.awayScore) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
    }
  }

  return [...standings.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.localeCompare(b.team);
  });
}
