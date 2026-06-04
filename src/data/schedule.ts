import { Match } from '../types';

/**
 * Match schedule for the group stage.
 * Dates and times are BST (UTC+1). Venues are the host cities.
 * This will be populated with the full schedule once FIFA publishes it.
 * For now, placeholder structure with Group A Day 1 as an example.
 */
export const schedule: Match[] = [
  // Group A - Matchday 1
  {
    awayTeam: 'Jordan',
    date: '2026-06-11',
    homeTeam: 'Portugal',
    id: 'A1',
    location: 'MetLife Stadium, New Jersey',
    round: 'group',
    time: '21:00',
  },
  {
    awayTeam: 'Scotland',
    date: '2026-06-12',
    homeTeam: 'Norway',
    id: 'A2',
    location: 'BC Place, Vancouver',
    round: 'group',
    time: '00:00',
  },
];
