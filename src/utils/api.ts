import { Match } from '../types';

/** Same-origin Vercel serverless proxy (see api/matches.ts). */
const API_MATCHES_URL = '/api/matches';
const CACHE_KEY = 'wc2026-matches';
const CACHE_TTL_MS = 60_000;

interface CachedResponse<T> {
  data: T;
  fetchedAt: number;
}

interface ApiTeam {
  name: string;
  shortName: string;
  tla: string;
}

interface ApiMatch {
  awayTeam: ApiTeam;
  group: string | null;
  homeTeam: ApiTeam;
  id: number;
  matchday: number;
  score: {
    fullTime: { away: number | null; home: number | null };
    winner: string | null;
  };
  stage: string;
  status: string;
  utcDate: string;
  venue?: string;
}

export interface FetchMatchesResult {
  fetchedAt: number;
  fromCache: boolean;
  matches: Match[];
  stale?: boolean;
}

/** Thrown when the API request fails and no cache is available. */
export class ApiFetchError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiFetchError';
  }
}

const STAGE_MAP: Record<string, Match['round']> = {
  FINAL: 'final',
  GROUP_STAGE: 'group',
  LAST_16: 'round-of-16',
  LAST_32: 'round-of-32',
  QUARTER_FINALS: 'quarter-final',
  SEMI_FINALS: 'semi-final',
  THIRD_PLACE: 'third-place',
};

/** Convert a UTC ISO string to BST date and time strings. */
function utcToBst(utcDateStr: string): { date: string; time: string } {
  const utc = new Date(utcDateStr);
  const bst = new Date(utc.getTime() + 3_600_000);
  return {
    date: bst.toISOString().slice(0, 10),
    time: bst.toISOString().slice(11, 16),
  };
}

function toMatch(api: ApiMatch): Match {
  const { date, time } = utcToBst(api.utcDate);
  const hasScore = api.score.fullTime.home != null && api.score.fullTime.away != null;
  return {
    ...(hasScore && {
      awayScore: api.score.fullTime.away!,
      homeScore: api.score.fullTime.home!,
    }),
    awayTeam: api.awayTeam.name,
    date,
    homeTeam: api.homeTeam.name,
    id: String(api.id),
    location: typeof api.venue === 'string' ? api.venue : '',
    round: STAGE_MAP[api.stage] ?? 'group',
    time,
  };
}

function parseMatches(json: unknown): Match[] {
  if (
    typeof json !== 'object' ||
    json === null ||
    !('matches' in json) ||
    !Array.isArray((json as { matches: unknown }).matches)
  ) {
    throw new ApiFetchError('Invalid API response: missing matches array');
  }
  return ((json as { matches: ApiMatch[] }).matches).map(toMatch);
}

function rateLimitDelayMs(res: Response): number {
  const reset = res.headers.get('X-RequestCounter-Reset');
  const seconds = reset ? Number.parseInt(reset, 10) : NaN;
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 5000;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestMatches(retried: boolean): Promise<Match[]> {
  const res = await fetch(API_MATCHES_URL);

  if (res.status === 429 && !retried) {
    await sleep(rateLimitDelayMs(res));
    return requestMatches(true);
  }

  if (!res.ok) {
    throw new ApiFetchError(`API request failed (${res.status})`, res.status);
  }

  const json: unknown = await res.json();
  return parseMatches(json);
}

function readCache(maxAgeMs: number): FetchMatchesResult | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, fetchedAt } = JSON.parse(raw) as CachedResponse<Match[]>;
    if (Date.now() - fetchedAt > maxAgeMs) return null;
    return {
      fetchedAt,
      fromCache: true,
      matches: data,
      ...(maxAgeMs === Infinity && { stale: true }),
    };
  } catch {
    return null;
  }
}

function writeCache(data: Match[]): number {
  const fetchedAt = Date.now();
  try {
    const entry: CachedResponse<Match[]> = { data, fetchedAt };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage unavailable or full
  }
  return fetchedAt;
}

function staleCacheResult(): FetchMatchesResult | null {
  const stale = readCache(Infinity);
  if (!stale) return null;
  return { ...stale, stale: true };
}

/**
 * Fetch all WC 2026 matches. Uses fresh localStorage cache within TTL;
 * on errors falls back to stale cache when available.
 */
export async function fetchMatches(): Promise<FetchMatchesResult> {
  const fresh = readCache(CACHE_TTL_MS);
  if (fresh) return fresh;

  try {
    const matches = await requestMatches(false);
    const fetchedAt = writeCache(matches);
    return { fetchedAt, fromCache: false, matches };
  } catch (err) {
    const stale = staleCacheResult();
    if (stale) return stale;
    if (err instanceof ApiFetchError) throw err;
    throw new ApiFetchError(
      err instanceof Error ? err.message : 'Network request failed'
    );
  }
}
