const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const shortDateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
const weekdayFormat = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

export const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : '—');
export const formatTime = (value) => timeFormat.format(new Date(value));
export const formatDateTime = (value) => `${formatDate(value)}, ${formatTime(value)}`;

/** "now", "5m ago", "3h ago", "Yesterday", "Mar 4" */
export function formatRelative(value, now = Date.now()) {
  if (!value) return 'Never';
  const diff = now - new Date(value).getTime();
  if (diff < MINUTE) return 'Just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 2 * DAY) return 'Yesterday';
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;
  return shortDateFormat.format(new Date(value));
}

/** Compact timestamp for lists: "10:42 AM" today, "Mon" this week, "Mar 4" older */
export function formatListTime(value, now = Date.now()) {
  const date = new Date(value);
  const diff = now - date.getTime();
  if (new Date(now).toDateString() === date.toDateString()) return formatTime(date);
  if (diff < 7 * DAY) return weekdayFormat.format(date);
  return shortDateFormat.format(date);
}

/** Seconds → "45s", "4m 12s", "1h 05m" */
export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

export const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value);

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const pluralize = (count, word, plural = `${word}s`) => `${count} ${count === 1 ? word : plural}`;

/** Replaces {{variable}} placeholders using the provided values; unknown variables are kept. */
export const fillTemplate = (text, values) =>
  text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => values[key] ?? match);
