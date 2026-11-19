// Mock timestamps are relative to page load so sample data always looks current.
const loadedAt = Date.now();

export const minutesAgo = (minutes) =>
  new Date(loadedAt - minutes * 60_000).toISOString();
export const hoursAgo = (hours) => minutesAgo(hours * 60);
export const daysAgo = (days) => minutesAgo(days * 1440);
