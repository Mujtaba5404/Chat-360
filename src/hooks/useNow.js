import { useSyncExternalStore } from 'react';

// One shared interval per tick rate, regardless of how many components subscribe.
const tickers = new Map();

function getTicker(interval) {
  if (!tickers.has(interval)) {
    const ticker = { now: Date.now(), listeners: new Set(), timer: null };
    ticker.subscribe = (listener) => {
      ticker.listeners.add(listener);
      if (!ticker.timer) {
        ticker.now = Date.now();
        ticker.timer = setInterval(() => {
          ticker.now = Date.now();
          ticker.listeners.forEach((fn) => fn());
        }, interval);
      }
      return () => {
        ticker.listeners.delete(listener);
        if (!ticker.listeners.size) {
          clearInterval(ticker.timer);
          ticker.timer = null;
        }
      };
    };
    ticker.getSnapshot = () => ticker.now;
    tickers.set(interval, ticker);
  }
  return tickers.get(interval);
}

/** Current timestamp that re-renders the caller every `interval` ms. */
export function useNow(interval = 60_000) {
  const ticker = getTicker(interval);
  return useSyncExternalStore(ticker.subscribe, ticker.getSnapshot);
}
