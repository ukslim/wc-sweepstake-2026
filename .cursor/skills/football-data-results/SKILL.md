---
name: football-data-results
description: >-
  Fetch FIFA World Cup 2026 match results from the football-data.org API
  directly in the web app (client-side). Use when the user asks to update
  scores, fetch results, sync match data, integrate the API, check latest
  results, or mentions football-data.org.
---

# Fetching Results from football-data.org (Client-Side)

The web app fetches results directly from the football-data.org API at runtime. The API key is exposed in the client bundle — this is accepted.

## API Details

- **Base URL**: `https://api.football-data.org/v4`
- **Auth header**: `X-Auth-Token` — value defined in `src/utils/api.ts` (client-exposed; do not duplicate in docs)
- **Competition code**: `WC` (FIFA World Cup)
- **CORS**: The API supports CORS for browser requests

## Rate Limiting

Free tier: 10 requests/minute. Check response headers:

| Header | Meaning |
|--------|---------|
| `X-Requests-Available-Minute` | Remaining requests this minute |
| `X-RequestCounter-Reset` | Seconds until counter resets |

If a request returns HTTP 429, wait for reset. The app should cache responses (in memory or localStorage) and avoid re-fetching within a reasonable interval (e.g. 60 seconds).

## Endpoints to Use

### Matches (scores and schedule)

```
GET /v4/competitions/WC/matches?season=2026
GET /v4/competitions/WC/matches?season=2026&status=FINISHED
GET /v4/competitions/WC/matches?season=2026&dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
```

### Standings (group tables)

```
GET /v4/competitions/WC/standings?season=2026
```

## API Response Shape (match object)

```json
{
  "id": 123456,
  "utcDate": "2026-06-11T19:00:00Z",
  "status": "FINISHED",
  "matchday": 1,
  "stage": "GROUP_STAGE",
  "group": "GROUP_A",
  "homeTeam": { "name": "Mexico", "shortName": "Mexico", "tla": "MEX" },
  "awayTeam": { "name": "South Africa", "shortName": "South Africa", "tla": "RSA" },
  "score": {
    "winner": "HOME_TEAM",
    "fullTime": { "home": 2, "away": 0 },
    "halfTime": { "home": 1, "away": 0 }
  }
}
```

Key fields:
- `status`: `SCHEDULED` | `TIMED` | `IN_PLAY` | `PAUSED` | `FINISHED` | `POSTPONED` | `CANCELLED`
- `stage`: `GROUP_STAGE` | `LAST_32` | `LAST_16` | `QUARTER_FINALS` | `SEMI_FINALS` | `THIRD_PLACE` | `FINAL`
- `score.fullTime.home` / `score.fullTime.away`: final scores (null if not yet played)

## Stage Mapping

| API `stage` | Project `round` |
|-------------|-----------------|
| GROUP_STAGE | group |
| LAST_32 | round-of-32 |
| LAST_16 | round-of-16 |
| QUARTER_FINALS | quarter-final |
| SEMI_FINALS | semi-final |
| THIRD_PLACE | third-place |
| FINAL | final |

## Team Names

The project uses football-data.org canonical team names throughout all data files. No name mapping is needed — API response names match local data directly.

Reference names that differ from common usage:
- "Bosnia-Herzegovina" (not "Bosnia and Herzegovina")
- "Cape Verde Islands" (not "Cabo Verde")
- "South Korea" (not "Korea Republic")
- "United States" (not "USA")
- "Ivory Coast" (not "Côte d'Ivoire")
- "Iran" (not "IR Iran")

## Implementation Guidance

### API Client Module

Create/maintain a module at `src/utils/api.ts` (or similar) that:

1. Wraps fetch calls with the auth header
2. Caches responses in memory with a TTL (e.g. 60s)
3. Handles 429 rate limiting with exponential backoff
4. Falls back gracefully to local static data if the API is unavailable

### Merging API Data with Local Schedule

Match API results to the local schedule (`data/schedule.json`) by comparing team names and UTC kick-off times. The local schedule `match` field (1–104) is the canonical match ID.

### Data Flow

1. App loads with static data from `data/` files (entrants, groups, schedule)
2. On mount (or on user action), fetch live results from football-data.org
3. Merge API scores into the match list — API is authoritative for scores
4. If the API is unreachable, the app still works with whatever data it has

### Error Handling

- Network errors: show stale data, optionally display "Last updated: ..." indicator
- 429 responses: back off, show cached data
- Competition not yet available: fall back silently to static data
