import { entrants } from './entrants';

export interface Group {
  name: string;
  teams: string[];
}

const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;

export const groups: Group[] = groupNames.map((name) => ({
  name,
  teams: entrants
    .filter((e) => e.group === name)
    .map((e) => e.country)
    .sort(),
}));

export function getGroup(name: string): Group | undefined {
  return groups.find((g) => g.name === name);
}
