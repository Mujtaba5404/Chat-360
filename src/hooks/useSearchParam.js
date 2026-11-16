import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/** A single URL search param as state — keeps drawers and selections deep-linkable. */
export function useSearchParam(key) {
  const [params, setParams] = useSearchParams();

  const setValue = useCallback(
    (next) =>
      setParams(
        (prev) => {
          const updated = new URLSearchParams(prev);
          if (next == null || next === '') updated.delete(key);
          else updated.set(key, next);
          return updated;
        },
        { replace: true },
      ),
    [key, setParams],
  );

  return [params.get(key), setValue];
}
