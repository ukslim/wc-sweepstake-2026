# AGENTS.md — WC 2026 Sweepstake Tracker

## What This Is

A static SPA tracking the FIFA World Cup 2026 sweepstake for a group of colleagues. 48 teams are assigned to people (some people paid double and have two teams). The app shows group standings, a knockout bracket, and a match calendar — always associating teams with their sweepstake owner.

Deployed on GitHub Pages. No backend. May use browser localStorage for user preferences.

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
- **GitHub Pages** — deployment target (static `dist/`)

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

Canonical names used consistently across all data files:
- "Turkey" (not Türkiye), "Ivory Coast" (not Côte d'Ivoire), "Iran" (not IR Iran)
- "Cabo Verde" (not Cape Verde), "Korea Republic", "Bosnia and Herzegovina"
- "USA" (not United States)

## Project Structure

```
wc-2026/
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
npm run dev              # Dev server (localhost:5173)
npm run build            # Production build → dist/
npm run preview          # Preview production build locally
npm run deploy           # Deploy to GitHub Pages
```

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

GitHub Actions workflow on push to `main` builds and deploys to GitHub Pages. The `base` in `vite.config.ts` must match the repo path (e.g., `/wc-2026/`).

## API (Optional, TBD)

If a free football results API is integrated (e.g. football-data.org), wrap in `src/utils/api.ts` with graceful fallback to local data. The app must work fully offline from any external API. If no suitable free API is found, results are updated manually via the data files.
