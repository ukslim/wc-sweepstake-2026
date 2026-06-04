import { getPersonForCountry } from '../../data/entrants';
import { PersonTag } from './PersonTag';

interface TeamNameProps {
  country: string;
  highlightPerson?: string | null;
  showPerson?: boolean;
}

export function TeamName({ country, highlightPerson, showPerson = true }: TeamNameProps) {
  const person = getPersonForCountry(country);

  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-medium">{country}</span>
      {showPerson && person && (
        <PersonTag highlighted={highlightPerson === person} name={person} />
      )}
    </span>
  );
}
