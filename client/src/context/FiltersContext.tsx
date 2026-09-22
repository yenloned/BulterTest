import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { TicketQuery } from '../api/tickets';

type FilterListKey = 'status' | 'category' | 'priority' | 'location';

interface FiltersContextValue {
  filters: TicketQuery;
  setSearch: (q: string) => void;
  toggleValue: (key: FilterListKey, value: string) => void;
  setLocationOnly: (location: string) => void;
  focusUrgentAt: (location: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const defaultFilters: TicketQuery = {
  status: [],
  category: [],
  priority: [],
  location: [],
  q: '',
};

const FiltersContext = createContext<FiltersContextValue | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<TicketQuery>(defaultFilters);

  const setSearch = useCallback((q: string) => {
    setFilters((prev) => ({ ...prev, q }));
  }, []);

  const toggleValue = useCallback((key: FilterListKey, value: string) => {
    setFilters((prev) => {
      const list = prev[key];
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];
      return { ...prev, [key]: next };
    });
  }, []);

  /** Click a building hotspot → focus that zone. */
  const setLocationOnly = useCallback((location: string) => {
    setFilters({
      ...defaultFilters,
      location: [location],
    });
  }, []);

  /** Click Needs attention row → High + that location. */
  const focusUrgentAt = useCallback((location: string) => {
    setFilters({
      ...defaultFilters,
      priority: ['High'],
      status: ['Open'],
      location: location ? [location] : [],
    });
  }, []);

  const clearFilters = useCallback(() => setFilters(defaultFilters), []);

  const hasActiveFilters = useMemo(
    () =>
      filters.status.length > 0 ||
      filters.category.length > 0 ||
      filters.priority.length > 0 ||
      filters.location.length > 0 ||
      filters.q.trim().length > 0,
    [filters]
  );

  const value = useMemo(
    () => ({
      filters,
      setSearch,
      toggleValue,
      setLocationOnly,
      focusUrgentAt,
      clearFilters,
      hasActiveFilters,
    }),
    [
      filters,
      setSearch,
      toggleValue,
      setLocationOnly,
      focusUrgentAt,
      clearFilters,
      hasActiveFilters,
    ]
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters must be used within FiltersProvider');
  return ctx;
}
