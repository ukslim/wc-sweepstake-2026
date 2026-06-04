import { GroupStanding, Match } from '../types';

/** Calculate group standings from matches (scores read from Match objects). */
export function calculateStandings(groupTeams: string[], matches: Match[]): GroupStanding[] {
  const standings = new Map<string, GroupStanding>(
    groupTeams.map((team) => [
      team,
      { drawn: 0, goalsAgainst: 0, goalsFor: 0, lost: 0, played: 0, points: 0, team, won: 0 },
    ])
  );

  for (const match of matches) {
    if (match.homeScore == null || match.awayScore == null) continue;

    const home = standings.get(match.homeTeam);
    const away = standings.get(match.awayTeam);
    if (!home || !away) continue;

    home.played++;
    away.played++;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (match.homeScore < match.awayScore) {
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
