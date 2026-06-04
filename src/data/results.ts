export interface MatchResult {
  awayScore: number;
  homeScore: number;
  matchId: number;
}

/** Committed results — edit this array and redeploy to record real scores. */
export const committedResults: MatchResult[] = [];

/** Look up a committed result by match ID. */
export function getCommittedResult(matchId: number): MatchResult | undefined {
  return committedResults.find((r) => r.matchId === matchId);
}
