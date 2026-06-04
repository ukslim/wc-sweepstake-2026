export interface Entrant {
  country: string;
  group: string;
  person: string;
}

export interface Match {
  awayScore?: number;
  awayTeam: string;
  date: string;
  homeScore?: number;
  homeTeam: string;
  id: string;
  location: string;
  round: 'group' | 'round-of-32' | 'round-of-16' | 'quarter-final' | 'semi-final' | 'third-place' | 'final';
  time: string;
}

export interface GroupStanding {
  drawn: number;
  goalsAgainst: number;
  goalsFor: number;
  lost: number;
  played: number;
  points: number;
  team: string;
  won: number;
}

export type Tab = 'groups' | 'knockout' | 'calendar';

export type PersonFilter = {
  mode: 'all' | 'highlight' | 'filter';
  person: string | null;
};
