import { useFilters } from '../context/FiltersContext';
import type { MetaResponse } from '../types/ticket';

interface FilterBarProps {
  meta: MetaResponse | null;
  compact?: boolean;
}

function FilterGroup({
  label,
  options,
  selected,
  onToggle,
  dense,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  dense?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-mist-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`ix-chip rounded-lg px-2.5 py-1 font-medium ${
                dense ? 'text-[11px]' : 'text-[12px]'
              } ${
                active
                  ? 'bg-accent/15 text-accent shadow-[0_0_0_1px_rgba(45,212,191,0.25)] ring-1 ring-accent/40'
                  : 'bg-white/[0.03] text-mist-300 ring-1 ring-white/[0.06] hover:bg-accent/10 hover:text-mist-50 hover:ring-accent/25'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FilterBar({ meta, compact }: FilterBarProps) {
  const { filters, setSearch, toggleValue, clearFilters, hasActiveFilters } = useFilters();

  return (
    <div className={compact ? 'space-y-3.5' : 'space-y-5'}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={filters.q}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, location, assignee…"
            className="field"
          />
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            className="btn-ghost shrink-0 text-[12px] text-mist-400"
            onClick={clearFilters}
          >
            Clear all
          </button>
        )}
      </div>

      {meta && (
        <div className={`grid gap-5 ${compact ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
          <FilterGroup
            label="Status"
            options={meta.statuses}
            selected={filters.status}
            onToggle={(v) => toggleValue('status', v)}
            dense={compact}
          />
          <FilterGroup
            label="Category"
            options={meta.categories}
            selected={filters.category}
            onToggle={(v) => toggleValue('category', v)}
            dense={compact}
          />
          <FilterGroup
            label="Priority"
            options={meta.priorities}
            selected={filters.priority}
            onToggle={(v) => toggleValue('priority', v)}
            dense={compact}
          />
          <FilterGroup
            label="Location"
            options={meta.locations}
            selected={filters.location}
            onToggle={(v) => toggleValue('location', v)}
            dense={compact}
          />
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
