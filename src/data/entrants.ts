import { Entrant } from '../types';
import entrantsData from '../../data/entrants.json';

/** All 48 entrants mapped from canonical data/entrants.json. */
export const entrants: Entrant[] = entrantsData.map((e) => ({
  country: e.team,
  group: e.group,
  person: e.person,
}));

/** Look up the sweepstake owner for a given country. */
export function getPersonForCountry(country: string): string | undefined {
  return entrants.find(
    (e) => e.country.toLowerCase() === country.toLowerCase()
  )?.person;
}

/** Get all entrants belonging to a given person (may be 1 or 2 teams). */
export function getTeamsForPerson(person: string): Entrant[] {
  return entrants.filter((e) => e.person === person);
}

/** Sorted list of unique person names. */
export function getAllPersons(): string[] {
  return [...new Set(entrants.map((e) => e.person))].sort();
}
