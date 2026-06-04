import { PersonFilter } from '../types';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_FILTER: PersonFilter = { mode: 'all', person: null };

export function usePersonFilter() {
  const [filter, setFilter] = useLocalStorage<PersonFilter>('wc2026-person-filter', DEFAULT_FILTER);

  const selectPerson = (person: string | null) => {
    setFilter({ ...filter, person });
  };

  const setMode = (mode: PersonFilter['mode']) => {
    setFilter({ ...filter, mode });
  };

  const clear = () => {
    setFilter(DEFAULT_FILTER);
  };

  return { clear, filter, selectPerson, setMode };
}
