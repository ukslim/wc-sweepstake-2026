import { Entrant } from '../types';

export const entrants: Entrant[] = [
  { country: 'Algeria', group: 'J', person: 'Mark D' },
  { country: 'Argentina', group: 'J', person: 'Ben D' },
  { country: 'Australia', group: 'D', person: 'Ben H' },
  { country: 'Austria', group: 'J', person: 'Kel' },
  { country: 'Belgium', group: 'G', person: 'Raz' },
  { country: 'Bosnia-Herzegovina', group: 'B', person: 'Gowtham' },
  { country: 'Brazil', group: 'C', person: 'Simon' },
  { country: 'Cabo Verde', group: 'H', person: 'Phil' },
  { country: 'Canada', group: 'B', person: 'Ian' },
  { country: 'Colombia', group: 'G', person: 'Emma' },
  { country: 'Congo DR', group: 'L', person: 'Elysia' },
  { country: 'Croatia', group: 'E', person: 'John H' },
  { country: 'Curaçao', group: 'L', person: 'Simon' },
  { country: 'Czechia', group: 'C', person: 'Luke' },
  { country: 'Ecuador', group: 'G', person: 'Donna' },
  { country: 'Egypt', group: 'I', person: 'Emma' },
  { country: 'England', group: 'F', person: 'Jamie F' },
  { country: 'France', group: 'L', person: 'Ben H' },
  { country: 'Germany', group: 'D', person: 'Chris L' },
  { country: 'Ghana', group: 'K', person: 'Nathan' },
  { country: 'Haiti', group: 'B', person: 'Lewis' },
  { country: 'IR Iran', group: 'H', person: 'Chris W' },
  { country: 'Iraq', group: 'C', person: 'Gowtham' },
  { country: 'Ivory Coast', group: 'I', person: 'Jonny S' },
  { country: 'Japan', group: 'I', person: 'Elysia' },
  { country: 'Jordan', group: 'A', person: 'Fiona' },
  { country: 'Korea Republic', group: 'H', person: 'Andy V' },
  { country: 'Mexico', group: 'K', person: 'Patrick' },
  { country: 'Morocco', group: 'J', person: 'Phil' },
  { country: 'Netherlands', group: 'F', person: 'Lewis' },
  { country: 'New Zealand', group: 'K', person: 'Andy D' },
  { country: 'Norway', group: 'A', person: 'Fergus' },
  { country: 'Panama', group: 'B', person: 'Diane' },
  { country: 'Paraguay', group: 'E', person: 'Luke' },
  { country: 'Portugal', group: 'A', person: 'Kel' },
  { country: 'Qatar', group: 'L', person: 'Laurie' },
  { country: 'Saudi Arabia', group: 'E', person: 'Kelly F' },
  { country: 'Scotland', group: 'A', person: 'Chris W' },
  { country: 'Senegal', group: 'E', person: 'Cyrus' },
  { country: 'South Africa', group: 'C', person: 'Jonathan' },
  { country: 'Spain', group: 'F', person: 'Sarah Y' },
  { country: 'Sweden', group: 'G', person: 'Mark D' },
  { country: 'Switzerland', group: 'I', person: 'James R' },
  { country: 'Tunisia', group: 'F', person: 'Laurie' },
  { country: 'Turkey', group: 'D', person: 'Jonathan' },
  { country: 'Uruguay', group: 'H', person: 'Andy D' },
  { country: 'USA', group: 'D', person: 'Parm' },
  { country: 'Uzbekistan', group: 'K', person: 'Patrick' },
];

export function getPersonForCountry(country: string): string | undefined {
  return entrants.find(
    (e) => e.country.toLowerCase() === country.toLowerCase()
  )?.person;
}

export function getTeamsForPerson(person: string): Entrant[] {
  return entrants.filter((e) => e.person === person);
}

export function getAllPersons(): string[] {
  return [...new Set(entrants.map((e) => e.person))].sort();
}
