import groupsData from '../../data/groups.json';

export interface Group {
  name: string;
  teams: string[];
}

/** All 12 groups (A-L) from canonical data/groups.json. */
export const groups: Group[] = Object.entries(groupsData).map(([name, teams]) => ({
  name,
  teams: [...teams].sort(),
}));

/** Look up a single group by letter. */
export function getGroup(name: string): Group | undefined {
  return groups.find((g) => g.name === name);
}
