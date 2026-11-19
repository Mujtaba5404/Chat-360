import { useMemo, useState } from "react";
import PAGE_SIZES from "../constants/PAGE_SIZES";

const collator = new Intl.Collator("en", {
  sensitivity: "base",
  numeric: true,
});

// Empty values always sort last, regardless of direction.
const compare = (a, b, direction) => {
  if (a == null || b == null) return a == null ? (b == null ? 0 : 1) : -1;
  const result =
    typeof a === "number" && typeof b === "number"
      ? a - b
      : collator.compare(String(a), String(b));
  return result * direction;
};

/**
 * Client-side search, equality filters, sorting and pagination for table data.
 * `searchFields` should be a stable (module-level) array.
 */
const useTableQuery = (
  items,
  {
    searchFields = [],
    initialFilters = {},
    initialSort = null,
    pageSize: initialPageSize = PAGE_SIZES[0],
  } = {},
) => {
  const [query, setQueryState] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        Object.entries(filters).every(
          ([key, value]) => value == null || item[key] === value,
        ) &&
        (!q ||
          searchFields.some((field) =>
            String(item[field] ?? "")
              .toLowerCase()
              .includes(q),
          )),
    );
  }, [items, query, filters, searchFields]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const direction = sort.direction === "desc" ? -1 : 1;
    return [...filtered].sort((a, b) =>
      compare(a[sort.key], b[sort.key], direction),
    );
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return {
    query,
    setQuery: (value) => {
      setQueryState(value);
      setPage(1);
    },
    filters,
    setFilter: (key, value) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    sort,
    setSort,
    toggleSort: (key) =>
      setSort((prev) => ({
        key,
        direction:
          prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
      })),
    page: currentPage,
    setPage,
    pageCount,
    pageSize,
    setPageSize: (value) => {
      setPageSizeState(value);
      setPage(1);
    },
    pageItems,
    total: sorted.length,
    isFiltered:
      Boolean(query.trim()) ||
      Object.values(filters).some((value) => value != null),
    reset: () => {
      setQueryState("");
      setFilters(initialFilters);
      setPage(1);
    },
  };
};

export default useTableQuery;
