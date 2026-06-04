import { getAllPersons } from '../../data/entrants';
import { PersonFilter } from '../../types';

interface PersonSelectorProps {
  filter: PersonFilter;
  onClear: () => void;
  onModeChange: (mode: PersonFilter['mode']) => void;
  onSelect: (person: string | null) => void;
}

export function PersonSelector({ filter, onClear, onModeChange, onSelect }: PersonSelectorProps) {
  const persons = getAllPersons();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Select person"
        className="rounded bg-gray-800 px-3 py-1.5 text-sm text-white border border-gray-600 focus:border-gold focus:outline-none"
        name="person-selector"
        onChange={(e) => onSelect(e.target.value || null)}
        value={filter.person ?? ''}
      >
        <option value="">Everyone</option>
        {persons.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {filter.person && (
        <div className="flex items-center gap-2">
          <button
            className={`rounded px-2 py-1 text-xs ${
              filter.mode === 'highlight' ? 'bg-gold text-gray-900' : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => onModeChange('highlight')}
          >
            Highlight
          </button>
          <button
            className={`rounded px-2 py-1 text-xs ${
              filter.mode === 'filter' ? 'bg-gold text-gray-900' : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => onModeChange('filter')}
          >
            Filter
          </button>
          <button
            className="rounded px-2 py-1 text-xs bg-gray-700 text-gray-300 hover:text-white"
            onClick={onClear}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
