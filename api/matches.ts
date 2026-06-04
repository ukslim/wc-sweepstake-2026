import type { VercelRequest, VercelResponse } from '@vercel/node';

const UPSTREAM_URL =
  'https://api.football-data.org/v4/competitions/WC/matches?season=2026';

/** Seconds from football-data.org rate-limit header, converted to milliseconds. */
function rateLimitDelayMs(headers: Headers): number {
  const reset = headers.get('X-RequestCounter-Reset');
  const seconds = reset ? Number.parseInt(reset, 10) : NaN;
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 5000;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetch upstream with one retry after HTTP 429. */
async function fetchUpstream(apiKey: string, retried: boolean): Promise<Response> {
  const res = await fetch(UPSTREAM_URL, {
    headers: { 'X-Auth-Token': apiKey },
  });

  if (res.status === 429 && !retried) {
    await sleep(rateLimitDelayMs(res.headers));
    return fetchUpstream(apiKey, true);
  }

  return res;
}

/**
 * Vercel serverless proxy for WC 2026 matches.
 * Injects FOOTBALL_DATA_API_KEY server-side; not exposed to the browser.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'FOOTBALL_DATA_API_KEY is not configured' });
    return;
  }

  try {
    const upstream = await fetchUpstream(apiKey, false);
    const body = await upstream.text();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.status(upstream.status).send(body);
  } catch {
    res.status(502).json({ error: 'Upstream request failed' });
  }
}
