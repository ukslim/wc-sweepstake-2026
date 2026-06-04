import { Match } from '../types';
import rawSchedule from '../../data/schedule.json';

/** Convert a UTC ISO string to BST (UTC+1) date and time strings. */
function utcToBst(utcStr: string): { date: string; time: string } {
  const utc = new Date(utcStr);
  const bst = new Date(utc.getTime() + 3_600_000);
  return {
    date: bst.toISOString().slice(0, 10),
    time: bst.toISOString().slice(11, 16),
  };
}

/** All 104 matches converted from canonical data/schedule.json with BST times. */
export const schedule: Match[] = rawSchedule.map((raw) => {
  const { date, time } = utcToBst(raw.kickoff_utc);
  return {
    awayTeam: raw.away ?? 'TBD',
    date,
    ...(raw.description ? { description: raw.description } : {}),
    ...(raw.group ? { group: raw.group } : {}),
    homeTeam: raw.home ?? 'TBD',
    id: String(raw.match),
    location: `${raw.venue}, ${raw.city}`,
    round: raw.stage as Match['round'],
    time,
  };
});
