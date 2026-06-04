import { PersonFilter } from '../../types';
import { schedule } from '../../data/schedule';
import { getResult } from '../../data/results';
import { TeamName } from '../common/TeamName';
import { formatDate } from '../../utils/dates';

interface KnockoutViewProps {
  filter: PersonFilter;
}

const knockoutRounds = ['round-of-32', 'round-of-16', 'quarter-final', 'semi-final', 'third-place', 'final'] as const;

const roundLabels: Record<string, string> = {
  'final': 'Final',
  'quarter-final': 'Quarter-Finals',
  'round-of-16': 'Round of 16',
  'round-of-32': 'Round of 32',
  'semi-final': 'Semi-Finals',
  'third-place': '3rd Place',
};

export function KnockoutView({ filter }: KnockoutViewProps) {
  const knockoutMatches = schedule.filter((m) => m.round !== 'group');

  if (knockoutMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-xl">Knockout stage not yet started</p>
        <p className="mt-2 text-sm">Matches will appear here once the group stage completes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {knockoutRounds.map((round) => {
        const matches = knockoutMatches.filter((m) => m.round === round);
        if (matches.length === 0) return null;

        return (
          <div key={round}>
            <h3 className="mb-4 text-lg font-bold text-gold">{roundLabels[round]}</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {matches.map((match) => {
                const result = getResult(match.id);
                return (
                  <div className="rounded-lg bg-gray-800 p-3" key={match.id}>
                    <div className="mb-2 text-xs text-gray-400">
                      {formatDate(match.date)} · {match.time} BST
                    </div>
                    <div className="flex items-center justify-between">
                      <TeamName
                        country={match.homeTeam}
                        highlightPerson={filter.mode === 'highlight' ? filter.person : null}
                      />
                      <span className="mx-2 font-mono text-lg">
                        {result ? `${result.homeScore} - ${result.awayScore}` : 'vs'}
                      </span>
                      <TeamName
                        country={match.awayTeam}
                        highlightPerson={filter.mode === 'highlight' ? filter.person : null}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
