import { GroupStanding, Match } from '../types';
import { groups } from '../data/groups';
import { calculateStandings } from './standings';

const TBD = 'TBD';

/** Split a knockout description ("Home vs Away") into its two slot tokens. */
export function knockoutTokens(description?: string): [string, string] {
  if (!description) return [TBD, TBD];
  const [home, away] = description.split(' vs ');
  return [home?.trim() || TBD, away?.trim() || TBD];
}

interface GroupResult {
  winner: string;
  runnerUp: string;
  third: GroupStanding;
}

interface ThirdPlaceSlot {
  matchId: number;
  eligibleGroups: Set<string>;
}

/** A group is resolvable once all six of its group matches have scores. */
function groupResults(matches: Match[]): Map<string, GroupResult> {
  const results = new Map<string, GroupResult>();

  for (const group of groups) {
    const groupMatches = matches.filter((m) => m.round === 'group' && m.group === group.name);
    const scored = groupMatches.filter((m) => m.homeScore != null && m.awayScore != null);
    if (scored.length < 6) continue;

    const standings = calculateStandings(group.teams, scored);
    if (standings.length < 3) continue;

    results.set(group.name, {
      runnerUp: standings[1]!.team,
      third: standings[2]!,
      winner: standings[0]!.team,
    });
  }

  return results;
}

/** Rank third-placed teams (points, GD, GF, then group letter) and return the best eight. */
function bestEightThirds(
  groupResultMap: Map<string, GroupResult>
): { group: string; team: string }[] {
  if (groupResultMap.size < groups.length) return [];

  const thirds = [...groupResultMap.entries()].map(([group, result]) => ({
    group,
    standing: result.third,
  }));

  thirds.sort((a, b) => {
    const sa = a.standing;
    const sb = b.standing;
    if (sb.points !== sa.points) return sb.points - sa.points;
    const gdA = sa.goalsFor - sa.goalsAgainst;
    const gdB = sb.goalsFor - sb.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    if (sb.goalsFor !== sa.goalsFor) return sb.goalsFor - sa.goalsFor;
    return a.group.localeCompare(b.group);
  });

  return thirds.slice(0, 8).map((t) => ({ group: t.group, team: t.standing.team }));
}

/** Parse the eight "3rd Place (X/Y/...)" R32 slots and their eligible groups. */
function thirdPlaceSlots(matches: Match[]): ThirdPlaceSlot[] {
  const slots: ThirdPlaceSlot[] = [];
  for (const m of matches) {
    if (m.round !== 'round-of-32' || !m.description) continue;
    const groupsMatch = m.description.match(/3rd Place \(([A-L/]+)\)/);
    if (!groupsMatch) continue;
    slots.push({
      eligibleGroups: new Set(groupsMatch[1]!.split('/')),
      matchId: Number(m.id),
    });
  }
  return slots;
}

/**
 * Assign the eight best third-placed teams to the eight R32 third-place slots,
 * honoring each slot's eligible-group constraint (Kuhn's bipartite matching).
 * Returns a map of R32 matchId -> team, or empty if no perfect matching exists.
 */
function allocateThirds(
  slots: ThirdPlaceSlot[],
  thirds: { group: string; team: string }[]
): Map<number, string> {
  const allocation = new Map<number, string>();
  if (slots.length !== 8 || thirds.length !== 8) return allocation;

  // Slot index -> assigned third index.
  const slotOfThird = new Array<number>(thirds.length).fill(-1);

  const tryAssign = (slotIdx: number, seen: boolean[]): boolean => {
    const slot = slots[slotIdx]!;
    for (let t = 0; t < thirds.length; t++) {
      if (seen[t] || !slot.eligibleGroups.has(thirds[t]!.group)) continue;
      seen[t] = true;
      if (slotOfThird[t] === -1 || tryAssign(slotOfThird[t]!, seen)) {
        slotOfThird[t] = slotIdx;
        return true;
      }
    }
    return false;
  };

  for (let s = 0; s < slots.length; s++) {
    if (!tryAssign(s, new Array<boolean>(thirds.length).fill(false))) {
      return new Map();
    }
  }

  for (let t = 0; t < thirds.length; t++) {
    const slotIdx = slotOfThird[t]!;
    if (slotIdx >= 0) allocation.set(slots[slotIdx]!.matchId, thirds[t]!.team);
  }
  return allocation;
}

/** Knockout fixtures from the API, keyed by round|date|time, with real team names. */
function apiKnockoutOverrides(apiMatches: Match[]): Map<string, { away: string; home: string }> {
  const map = new Map<string, { away: string; home: string }>();
  for (const m of apiMatches) {
    if (m.round === 'group') continue;
    if (!m.homeTeam || !m.awayTeam || m.homeTeam === TBD || m.awayTeam === TBD) continue;
    map.set(`${m.round}|${m.date}|${m.time}`, { away: m.awayTeam, home: m.homeTeam });
  }
  return map;
}

/**
 * Fill knockout-match participants from completed group standings, propagating
 * winners/losers through later rounds. API knockout fixtures, when available,
 * take precedence over standings-derived teams.
 */
export function resolveBracket(matches: Match[], apiMatches: Match[] = []): Match[] {
  const groupResultMap = groupResults(matches);
  const thirdAllocation = allocateThirds(
    thirdPlaceSlots(matches),
    bestEightThirds(groupResultMap)
  );
  const apiOverrides = apiKnockoutOverrides(apiMatches);

  const resolved = new Map<number, Match>(matches.map((m) => [Number(m.id), { ...m }]));

  const winnerOf = (id: number): string | null => {
    const m = resolved.get(id);
    if (!m || m.homeTeam === TBD || m.awayTeam === TBD) return null;
    if (m.homeScore == null || m.awayScore == null || m.homeScore === m.awayScore) return null;
    return m.homeScore > m.awayScore ? m.homeTeam : m.awayTeam;
  };

  const loserOf = (id: number): string | null => {
    const m = resolved.get(id);
    if (!m || m.homeTeam === TBD || m.awayTeam === TBD) return null;
    if (m.homeScore == null || m.awayScore == null || m.homeScore === m.awayScore) return null;
    return m.homeScore > m.awayScore ? m.awayTeam : m.homeTeam;
  };

  const resolveToken = (token: string, matchId: number): string | null => {
    const trimmed = token.trim();

    const winnerGroup = trimmed.match(/^Winner Group ([A-L])$/);
    if (winnerGroup) return groupResultMap.get(winnerGroup[1]!)?.winner ?? null;

    const runnerUp = trimmed.match(/^Runner-up Group ([A-L])$/);
    if (runnerUp) return groupResultMap.get(runnerUp[1]!)?.runnerUp ?? null;

    if (/^3rd Place \(/.test(trimmed)) return thirdAllocation.get(matchId) ?? null;

    const winnerMatch = trimmed.match(/^Winner Match (\d+)$/);
    if (winnerMatch) return winnerOf(Number(winnerMatch[1]));

    const loserMatch = trimmed.match(/^Loser Match (\d+)$/);
    if (loserMatch) return loserOf(Number(loserMatch[1]));

    return null;
  };

  // Iterate to a fixpoint so R32 -> R16 -> QF -> SF -> Final/3rd propagate.
  for (let pass = 0; pass < 7; pass++) {
    let changed = false;

    for (const match of resolved.values()) {
      if (match.round === 'group' || !match.description) continue;

      const id = Number(match.id);
      const override = apiOverrides.get(`${match.round}|${match.date}|${match.time}`);

      const [homeToken, awayToken] = match.description.split(' vs ');
      const home = override?.home ?? (homeToken ? resolveToken(homeToken, id) : null);
      const away = override?.away ?? (awayToken ? resolveToken(awayToken, id) : null);

      if (home && match.homeTeam !== home) {
        match.homeTeam = home;
        changed = true;
      }
      if (away && match.awayTeam !== away) {
        match.awayTeam = away;
        changed = true;
      }
    }

    if (!changed) break;
  }

  return matches.map((m) => resolved.get(Number(m.id)) ?? m);
}
