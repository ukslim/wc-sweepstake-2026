/** Format a timestamp for display in en-GB (BST wall-clock when stored as UTC ms). */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    weekday: 'short',
  });
}

/** Format a date string (YYYY-MM-DD) for display. */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  });
}

/** Check if a match date is in the past. */
export function isMatchPast(dateStr: string, timeStr: string): boolean {
  const matchDate = new Date(`${dateStr}T${timeStr}:00+01:00`);
  return matchDate < new Date();
}

/** Check if a match is today. */
export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}
