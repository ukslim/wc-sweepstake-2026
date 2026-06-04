import { useEffect, useMemo, useState } from 'react';
import { Match } from '../types';
import { schedule } from '../data/schedule';
import { useResults } from '../data/resultsStore';
import { ApiFetchError, fetchMatches } from '../utils/api';

export interface UseMatchesResult {
  apiError: string | null;
  lastUpdated: Date | null;
  loading: boolean;
  matches: Match[];
  scoresStale: boolean;
}

/**
 * Merges the static schedule with committed/injected results,
 * and optionally overlays live data from the football-data.org API.
 */
export function useMatches(): UseMatchesResult {
  const results = useResults();
  const [apiMatches, setApiMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [scoresStale, setScoresStale] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchMatches()
      .then((result) => {
        if (cancelled) return;
        setApiMatches(result.matches);
        setLastUpdated(new Date(result.fetchedAt));
        setScoresStale(result.stale === true);
        setApiError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setApiMatches([]);
        setLastUpdated(null);
        setScoresStale(false);
        setApiError(
          err instanceof ApiFetchError
            ? err.message
            : 'Live scores unavailable'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const matches = useMemo(() => {
    const resultMap = new Map(results.map((r) => [String(r.matchId), r]));

    const apiScoreMap = new Map<string, { awayScore: number; homeScore: number }>();
    for (const m of apiMatches) {
      if (m.homeScore != null && m.awayScore != null) {
        apiScoreMap.set(`${m.homeTeam}|${m.date}`, {
          awayScore: m.awayScore,
          homeScore: m.homeScore,
        });
      }
    }

    return schedule.map((match) => {
      const injected = resultMap.get(match.id);
      if (injected) {
        return { ...match, awayScore: injected.awayScore, homeScore: injected.homeScore };
      }

      if (match.homeTeam !== 'TBD') {
        const apiScore = apiScoreMap.get(`${match.homeTeam}|${match.date}`);
        if (apiScore) {
          return { ...match, ...apiScore };
        }
      }

      return match;
    });
  }, [apiMatches, results]);

  return { apiError, lastUpdated, loading, matches, scoresStale };
}
