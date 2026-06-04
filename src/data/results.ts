/**
 * Match results. Add entries here as matches are played.
 * The matchId corresponds to the `id` field in schedule.ts.
 */
export interface MatchResult {
  awayScore: number;
  homeScore: number;
  matchId: string;
}

export const results: MatchResult[] = [
  // Results will be added here as matches are played
  // Example: { matchId: 'A1', homeScore: 2, awayScore: 0 },
];

export function getResult(matchId: string): MatchResult | undefined {
  return results.find((r) => r.matchId === matchId);
}
