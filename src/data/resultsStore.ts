import { useSyncExternalStore } from 'react';
import { MatchResult, committedResults } from './results';

let injectedResults: MatchResult[] = [];
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): MatchResult[] {
  return injectedResults;
}

/** Merge new results into the injected set, triggering React re-renders. */
export function injectResults(results: MatchResult[]): void {
  const map = new Map(injectedResults.map((r) => [r.matchId, r]));
  for (const r of results) {
    map.set(r.matchId, r);
  }
  injectedResults = [...map.values()];
  emitChange();
}

/** Clear all injected results, reverting to committed data only. */
export function clearResults(): void {
  injectedResults = [];
  emitChange();
}

/**
 * Returns the merged set of committed + injected results.
 * Injected results override committed ones for the same matchId.
 */
export function useResults(): MatchResult[] {
  const injected = useSyncExternalStore(subscribe, getSnapshot);

  if (injected.length === 0) return committedResults;

  const map = new Map(committedResults.map((r) => [r.matchId, r]));
  for (const r of injected) {
    map.set(r.matchId, r);
  }
  return [...map.values()];
}
