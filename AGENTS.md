# AGENTS.md — WC 2026 Sweepstake Tracker

## What This Is

A static SPA tracking the FIFA World Cup 2026 sweepstake for a group of colleagues. 48 teams are assigned to people (some people paid double and have two teams). The app shows group standings, a knockout bracket, and a match calendar — always associating teams with their sweepstake owner.

Deployed on **Vercel** (static SPA + `/api/matches` serverless proxy). May use browser localStorage for user preferences and score cache.

## Tournament Format

- 48 teams in 12 groups (A–L) of 4
- Group stage: top 2 per group + 8 best 3rd-place teams advance (32 teams total)
- Knockout: Round of 32 → Round of 16 → Quarter-finals → Semi-finals → Third-place → Final
- Dates: June 11 – July 19, 2026
- All matches in USA, Canada, and Mexico (late evening / night BST for UK viewers)

## Tech Stack

- **Vite** — build tool and dev server
- **React 18** + **TypeScript**
- **Tailwind CSS** — utility-first styling
- **Vercel** — deployment (static `dist/` + serverless API in `api/`)

## Tabs / Views

### Group Stage

- Points table for each group (Played, Won, Drawn, Lost, GF, GA, GD, Points)
- List of played and upcoming matches per group with scores
- Person selection: highlight that person's rows; toggle to filter to only their groups

### Knockout Stage

- **Bracket/tree chart** showing the full knockout draw from Round of 32 to Final
- Scores shown for completed matches; TBD placeholders for future rounds
- Must support **zoom and pan on mobile** (touch gestures) — this is non-negotiable since the bracket is too wide for a phone viewport
- Person selection: highlight that person's team(s) path through the bracket

### Calendar

- Chronological list of upcoming matches with: date, BST kick-off time, teams, venue/city, group/round
- Person selection: filter to only matches involving that person's team(s)

## Person Visibility Rule

Whenever a country team is displayed, also show the sweepstake person who owns that team — **unless** the person↔team association is already evident in the immediate context (e.g. in a "Sarah Y's matches" filtered view, don't redundantly label every row with "Sarah Y").

## User Selection

- Global selector (dropdown or similar) to pick a person — affects all tabs
- Default: "Everyone" (no filter/highlight)
- Persisted in localStorage so it survives page refresh
- Some people own two teams — selection highlights/filters both

## Data

All data is **statically imported** from `src/data/` (TypeScript modules). Updating results requires editing, rebuilding, and deploying.

Source JSON files live in `data/` at the project root (canonical reference data):

- `data/entrants.json` — team → person + group
- `data/groups.json` — group compositions
- `data/schedule.json` — all 104 matches (UTC kickoff times, venues, stages)
- `data/venues.json` — 16 venues with IANA timezone identifiers

App-consumable modules in `src/data/` re-export or transform these.

### Updating Results

A `results` data structure (initially empty) records completed match scores. Each entry: `{ matchId, homeScore, awayScore }`. To update: edit the results file, rebuild, push to deploy.

### Team Names

Team names use the canonical names from the football-data.org API. Key names that differ from common usage:

- "Bosnia-Herzegovina" (not "Bosnia and Herzegovina")
- "Cape Verde Islands" (not "Cabo Verde")
- "South Korea" (not "Korea Republic")
- "United States" (not "USA")
- "Ivory Coast" (not "Côte d'Ivoire")
- "Iran" (not "IR Iran")
- "Turkey" (not "Türkiye")

## Project Structure

```
wc-2026/
├── api/                  # Vercel serverless (football-data proxy)
│   └── matches.ts
├── data/                 # Canonical JSON source data
│   ├── entrants.json
│   ├── groups.json
│   ├── schedule.json
│   └── venues.json
├── src/
│   ├── components/
│   │   ├── GroupStage/   # Group tables, match lists
│   │   ├── Knockout/     # Bracket chart (zoomable/pannable)
│   │   ├── Calendar/     # Upcoming matches timeline
│   │   └── common/       # Shared UI (TeamBadge, PersonTag, Tabs, PersonSelector)
│   ├── data/             # TS modules importing/re-exporting JSON + results
│   ├── hooks/            # useSelectedPerson, useLocalStorage
│   ├── types/            # TypeScript types (Team, Match, Group, Entrant, Result)
│   ├── utils/            # Points calc, date formatting, BST conversion, filtering
│   ├── App.tsx
│   └── main.tsx
├── public/               # Static assets (flags, favicon)
├── index.html
├── AGENTS.md             # This file
├── teams-entrants.txt    # Original source entrant data (reference only)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server (proxies /api/matches; needs .env.local)
npm run build            # Production build → dist/
npm run preview          # Preview production build locally
```

Deploy via Vercel (connect repo, set Root Directory to `wc-2026`, add `FOOTBALL_DATA_API_KEY`).

## Styling

- Tailwind utility classes throughout. No custom CSS unless unavoidable.
- Mobile-first responsive design — people will check on phones during the workday.
- Use team flag emojis or small flag images where available.
- Knockout bracket: implement with a pannable/zoomable container (CSS transform + touch event handling, or a lightweight library).

## Times

- Stored internally as UTC ISO strings (e.g. `2026-06-11T19:00:00Z`)
- Displayed in BST (UTC+1) throughout the UI — this is a UK-based group
- Format: e.g. "Wed 11 Jun, 8:00 PM"

## Deployment

Deployed on **Vercel** (Vite SPA + serverless API). Set the Vercel project **Root Directory** to `wc-2026` if deploying from the monorepo.

- **Build**: `npm run build` → `dist/`
- **Env**: `FOOTBALL_DATA_API_KEY` in Vercel project settings (Production + Preview). Copy `.env.example` to `.env.local` for local dev.
- **API proxy**: [`api/matches.ts`](api/matches.ts) — browser calls `/api/matches`; the function injects the auth token server-side.
- **Local dev**: Vite proxies `/api/matches` to football-data.org using `FOOTBALL_DATA_API_KEY` from `.env.local`.

## Testing

This app has no unit tests. Testing is done **manually by an agent** using Chrome DevTools (via the `chrome-devtools` MCP server) to inspect the running app, verify layout, check data rendering, and interact with UI elements.

### Fake Data for Pre-Tournament Testing

Before real results are available, the app must expose a global function on `window` to inject fake match results via the browser console. This allows an agent (or a human) to simulate tournament progress without editing source files or rebuilding.

```js
// Example browser console usage:
window.__injectResults([
  { matchId: 1, homeScore: 2, awayScore: 1 },
  { matchId: 2, homeScore: 0, awayScore: 0 },
]);

// Clear all injected results:
window.__clearResults();
```

- `window.__injectResults(results)` — merges the provided results into the app's reactive state, triggering re-renders of group tables, knockout bracket, and calendar.
- `window.__clearResults()` — resets to the real (committed) results data.
- These functions must be available in both dev and production builds.

## API — football-data.org

Match scores are fetched via a **same-origin proxy** so the API key never reaches the browser.

- **Proxy**: `api/matches.ts` (Vercel serverless) — uses `FOOTBALL_DATA_API_KEY`
- **Client**: `src/utils/api.ts` — `fetch('/api/matches')` with 60s fresh cache, stale-cache fallback on errors/429, and one retry after rate-limit reset
- **Hook**: `src/hooks/useMatches.ts` — returns `{ apiError, lastUpdated, loading, matches, scoresStale }`
- **Caching**: localStorage key `wc2026-matches`. Fresh TTL 60 seconds; expired entries used when the API is unreachable
- **Status UI**: `App.tsx` header shows last update time, stale-cache notice, or “schedule only” when the API fails with no cache
- **Data flow**: `App.tsx` calls `useMatches()` and passes `matches: Match[]` to all three views. Merge order: injected console results > API scores > static schedule. Scores live on `Match` objects (`homeScore`, `awayScore`)
