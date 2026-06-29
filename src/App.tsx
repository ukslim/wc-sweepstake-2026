import { useState } from 'react';
import { Tab } from './types';
import { usePersonFilter } from './hooks/usePersonFilter';
import { useMatches } from './hooks/useMatches';
import { formatDateTime } from './utils/dates';
import { Tabs } from './components/common/Tabs';
import { PersonSelector } from './components/common/PersonSelector';
import { GroupStageView } from './components/GroupStage/GroupStageView';
import { KnockoutView } from './components/Knockout/KnockoutView';
import { CalendarView } from './components/Calendar/CalendarView';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('knockout');
  const { clear, filter, selectPerson, setMode } = usePersonFilter();
  const { apiError, lastUpdated, loading, matches, scoresPreserved, scoresStale } =
    useMatches();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-gold">WC 2026</span> Sweepstake
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          FIFA World Cup 2026 — USA, Mexico &amp; Canada
        </p>
        {!loading && (
          <p className="mt-1 text-xs text-gray-500">
            {lastUpdated && scoresStale && (
              <>Showing cached scores from {formatDateTime(lastUpdated)}</>
            )}
            {lastUpdated && !scoresStale && scoresPreserved && (
              <>
                Some scores from cache — API returned incomplete data at{' '}
                {formatDateTime(lastUpdated)}
              </>
            )}
            {lastUpdated && !scoresStale && !scoresPreserved && (
              <>Scores updated {formatDateTime(lastUpdated)}</>
            )}
            {apiError && !lastUpdated && (
              <>Live scores unavailable — showing schedule only</>
            )}
          </p>
        )}
      </header>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        <PersonSelector
          filter={filter}
          onClear={clear}
          onModeChange={setMode}
          onSelect={selectPerson}
        />
      </div>

      <main>
        {loading ? (
          <p className="py-20 text-center text-gray-400">Loading matches…</p>
        ) : (
          <>
            {activeTab === 'groups' && <GroupStageView filter={filter} matches={matches} />}
            {activeTab === 'knockout' && <KnockoutView filter={filter} matches={matches} />}
            {activeTab === 'calendar' && <CalendarView filter={filter} matches={matches} />}
          </>
        )}
      </main>
    </div>
  );
}
