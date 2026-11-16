import { useSyncExternalStore } from 'react';

/**
 * Minimal external store. State lives outside React, so it survives route changes,
 * and components subscribe to just the slice they select.
 * Replace the action implementations with API calls when a backend is available.
 */
export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  const getState = () => state;
  const setState = (updater) => {
    state = typeof updater === 'function' ? updater(state) : updater;
    listeners.forEach((listener) => listener());
  };
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const useStore = (selector = getState) => useSyncExternalStore(subscribe, () => selector(state));

  return { getState, setState, subscribe, useStore };
}

let idCounter = 0;
export const createId = (prefix) => `${prefix}_${Date.now().toString(36)}${(idCounter++).toString(36)}`;

/** Store for a list of records keyed by `id`, with the standard CRUD actions. */
export function createCollection(initialItems, prefix) {
  const store = createStore(initialItems);

  return {
    ...store,
    useItems: () => store.useStore(),
    useItem: (id) => store.useStore((items) => items.find((item) => item.id === id)),
    getItem: (id) => store.getState().find((item) => item.id === id),
    add(item) {
      const record = { ...item, id: createId(prefix), createdAt: new Date().toISOString() };
      store.setState((items) => [record, ...items]);
      return record;
    },
    update(id, patch) {
      store.setState((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    },
    remove(id) {
      store.setState((items) => items.filter((item) => item.id !== id));
    },
  };
}
