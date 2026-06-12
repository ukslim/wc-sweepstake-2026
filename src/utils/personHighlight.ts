import { getPersonForCountry, getTeamsForPerson } from '../data/entrants';
import { Match, PersonFilter } from '../types';

export function isHighlightActive(filter: PersonFilter): boolean {
  return filter.mode === 'highlight' && filter.person != null;
}

export function isTeamHighlighted(team: string, filter: PersonFilter): boolean {
  if (!isHighlightActive(filter)) return false;
  return getPersonForCountry(team) === filter.person;
}

export function isMatchHighlighted(match: Match, filter: PersonFilter): boolean {
  if (!isHighlightActive(filter) || match.homeTeam === 'TBD') return false;
  const personTeams = getTeamsForPerson(filter.person!).map((e) => e.country);
  return personTeams.includes(match.homeTeam) || personTeams.includes(match.awayTeam);
}

export const HIGHLIGHT_CONTAINER_CLASSES = 'ring-1 ring-inset ring-gold/50';
export const HIGHLIGHT_ROW_CLASSES = 'ring-1 ring-inset ring-gold/40 bg-gold/5';
