---
name: football-data-results
description: >-
  Fetch FIFA World Cup 2026 match results from the football-data.org API and
  update the local results data file. Use when the user asks to update scores,
  fetch results, sync match data, check latest results, or mentions
  football-data.org.
---

# Fetch Results from football-data.org

## API Authentication

- **Base URL**: `https://api.football-data.org/v4`
- **Auth header**: `X-Auth-Token: 9c9b98a30ae744d29f97ce54416dc6cc`
- **Competition code**: `WC` (FIFA World Cup)

## Rate Limiting

The free tier is rate-limited. Check these response headers and back off accordingly:

| Header | Meaning |
|--------|---------|
| `X-Requests-Available-Minute` | Remaining requests this minute |
| `X-RequestCounter-Reset` | Seconds until the counter resets |

If a request returns HTTP 429, wait for the reset period before retrying.

## Fetching Match Results

### All matches for the competition

```bash
curl -s 'https://api.football-data.org/v4/competitions/WC/matches?season=2026' \
  -H 'X-Auth-Token: 9c9b98a30ae744d29f97ce54416dc6cc'
```

### Filter by status (only finished matches)

```bash
curl -s 'https://api.football-data.org/v4/competitions/WC/matches?season=2026&status=FINISHED' \
  -H 'X-Auth-Token: 9c9b98a30ae744d29f97ce54416dc6cc'
```

### Filter by date range

```bash
curl -s 'https://api.football-data.org/v4/competitions/WC/matches?season=2026&dateFrom=2026-06-11&dateTo=2026-06-15' \
  -H 'X-Auth-Token: 9c9b98a30ae744d29f97ce54416dc6cc'
```

### Standings

```bash
curl -s 'https://api.football-data.org/v4/competitions/WC/standings?season=2026' \
  -H 'X-Auth-Token: 9c9b98a30ae744d29f97ce54416dc6cc'
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
- `status`: `SCHEDULED`, `TIMED`, `IN_PLAY`, `PAUSED`, `FINISHED`, `POSTPONED`, `CANCELLED`
- `stage`: `GROUP_STAGE`, `LAST_32`, `LAST_16`, `QUARTER_FINALS`, `SEMI_FINALS`, `THIRD_PLACE`, `FINAL`
- `score.fullTime.home` / `score.fullTime.away`: final scores (null if not yet played)

## Mapping API Data to Project Format

The project stores results in `src/data/results.ts` as:

```typescript
export interface MatchResult {
  awayScore: number;
  homeScore: number;
  matchId: string;
}
```

The `matchId` comes from `data/schedule.json` where matches have a numeric `match` field (1–104). Match the API response to the local schedule by comparing **team names** and **date** (or kickoff time).

### Team Name Mapping

The API may return names that differ from the project's canonical names. Apply these corrections:

| API returns | Project uses |
|-------------|--------------|
| Türkiye | Turkey |
| Côte d'Ivoire | Ivory Coast |
| IR Iran | Iran |
| Cape Verde | Cabo Verde |
| United States | USA |

Other names (Korea Republic, Bosnia and Herzegovina, etc.) should match as-is.

## Workflow

1. **Fetch finished matches** from the API (use `status=FINISHED` filter)
2. **Match each API result** to a local schedule entry by comparing home/away team names and date
3. **Extract scores** from `score.fullTime.home` and `score.fullTime.away`
4. **Build the `matchId`** using the schedule's `match` field (e.g. match 1 → matchId `"1"`) — check `data/schedule.json` for the numeric match identifiers. The `src/data/schedule.ts` uses letter-based IDs like `"A1"` — use whichever format `results.ts` is currently referencing.
5. **Update `src/data/results.ts`** — append new `MatchResult` entries to the `results` array, keeping entries sorted by `matchId`
6. **Do NOT overwrite existing results** unless scores have changed (e.g. corrected after review)

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

## Error Handling

- If the API returns an error or the competition is not yet available, report clearly and fall back to manual entry
- If a match cannot be mapped to the local schedule (name mismatch), flag it for manual review rather than silently skipping
- Always show the user what was updated (match, teams, score)
