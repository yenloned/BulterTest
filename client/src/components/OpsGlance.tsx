import { useFilters } from '../context/FiltersContext';
import type { Ticket, TicketFacets } from '../types/ticket';
import { LocationBadge } from './LocationBadge';

interface OpsGlanceProps {
  facets: TicketFacets | null;
  filteredTotal?: number;
  total?: number;
  loading?: boolean;
  /** Tighter chrome for Board strip */
  compact?: boolean;
}

/** Dense FM strip: stats · hotspots · urgent — horizontal first, minimal scroll. */
export function OpsGlance({
  facets,
  filteredTotal,
  total,
  loading,
  compact,
}: OpsGlanceProps) {
  const { setLocationOnly, focusUrgentAt, filters } = useFilters();
  const open = facets?.status?.Open ?? 0;
  const progress = facets?.status?.['In Progress'] ?? 0;
  const closed = facets?.status?.Closed ?? 0;
  const openHigh = facets?.openHigh ?? 0;
  const hotspots = facets?.hotspots ?? [];
  const needsAttention = (facets?.needsAttention ?? []).slice(0, compact ? 4 : 5);
  const activeLocation = filters.location[0];

  if (loading && !facets) {
    return <div className="skeleton h-[108px] w-full rounded-xl" />;
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-3.5'}>
      {!compact && (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-mist-50">
              Building command glance
            </h2>
            <p className="mt-0.5 text-[12px] text-mist-400">
              Where is the load, and what needs you first
              {filteredTotal != null && total != null && filteredTotal !== total ? (
                <span className="text-mist-300">
                  {' '}
                  · <span className="font-medium text-accent">{filteredTotal}</span> matching
                </span>
              ) : null}
            </p>
          </div>
        </div>
      )}

      <div
        className={`grid gap-3 ${
          compact
            ? 'xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.1fr)]'
            : 'lg:grid-cols-[minmax(200px,0.85fr)_minmax(0,1.15fr)_minmax(0,1.2fr)]'
        }`}
      >
        <div
          className={`grid grid-cols-2 gap-1.5 ${
            compact ? 'sm:grid-cols-4 xl:grid-cols-2' : 'sm:grid-cols-4 lg:grid-cols-2'
          }`}
        >
          <MicroStat label="Open" value={open} tone="open" />
          <MicroStat label="In prog." value={progress} tone="progress" />
          <MicroStat label="Closed" value={closed} tone="closed" />
          <MicroStat label="Open·High" value={openHigh} tone="high" pulse={openHigh > 0} />
        </div>

        <div className="min-w-0 rounded-xl border border-line bg-canvas/35 px-3 py-2.5 transition-colors duration-200 hover:border-line-soft hover:bg-canvas/50">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mist-500">
              Hotspots
            </p>
            <span className="text-[10px] text-mist-500">Active zones · click to filter</span>
          </div>
          {hotspots.length === 0 ? (
            <p className="py-2 text-[12px] text-mist-500">No active load</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {hotspots.map((h) => {
                const on = activeLocation === h.location;
                return (
                  <button
                    key={h.location}
                    type="button"
                    onClick={() => setLocationOnly(h.location)}
                    title={`Filter to ${h.location}`}
                    className={`ix-chip group inline-flex max-w-full items-center gap-1.5 rounded-lg px-2 py-1 ${
                      on
                        ? 'bg-accent/15 shadow-[0_0_0_1px_rgba(45,212,191,0.35)] ring-1 ring-accent/40'
                        : 'bg-white/[0.03] ring-1 ring-white/[0.07] hover:bg-accent/10 hover:ring-accent/30'
                    }`}
                  >
                    <LocationBadge location={h.location} interactive />
                    <span
                      className={`rounded-md px-1 font-mono text-[11px] font-semibold tabular-nums transition-colors ${
                        on
                          ? 'bg-accent/20 text-accent'
                          : 'text-mist-200 group-hover:bg-accent/15 group-hover:text-accent'
                      }`}
                    >
                      {h.active}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-xl border border-line bg-canvas/35 px-3 py-2.5 transition-colors duration-200 hover:border-line-soft hover:bg-canvas/50">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mist-500">
              Needs attention
            </p>
            <span className="text-[10px] font-medium text-signal-high">Open · High</span>
          </div>
          {needsAttention.length === 0 ? (
            <p className="py-2 text-[12px] text-mist-500">Nothing urgent</p>
          ) : (
            <ul className="space-y-0.5">
              {needsAttention.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => focusUrgentAt(t.location || '')}
                    className="ix-row ix-row-urgent group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left"
                  >
                    {t.location ? (
                      <LocationBadge location={t.location} emphasize />
                    ) : (
                      <span className="shrink-0 text-[10px] text-mist-500">—</span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-[12px] text-mist-100 transition-colors group-hover:text-mist-50">
                      {t.title}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-mist-500 opacity-70 transition-opacity group-hover:opacity-100">
                      #{t.id}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function MicroStat({
  label,
  value,
  tone,
  pulse,
}: {
  label: string;
  value: number;
  tone: 'open' | 'progress' | 'closed' | 'high';
  pulse?: boolean;
}) {
  const tones = {
    open: 'border-signal-open/20 bg-signal-open/[0.06] text-signal-open hover:border-signal-open/45 hover:bg-signal-open/[0.12]',
    progress:
      'border-signal-progress/20 bg-signal-progress/[0.06] text-signal-progress hover:border-signal-progress/45 hover:bg-signal-progress/[0.12]',
    closed:
      'border-signal-closed/20 bg-signal-closed/[0.06] text-signal-closed hover:border-signal-closed/45 hover:bg-signal-closed/[0.12]',
    high: 'border-signal-high/30 bg-signal-high/[0.1] text-signal-high hover:border-signal-high/55 hover:bg-signal-high/[0.16]',
  }[tone];

  return (
    <div className={`ix-stat rounded-lg border px-2.5 py-2 ${tones}`}>
      <div className="flex items-center justify-between gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] opacity-80">{label}</p>
        {pulse ? <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-signal-high" /> : null}
      </div>
      <p className="mt-0.5 font-sans text-[22px] font-semibold leading-none tabular-nums text-mist-50">
        {value}
      </p>
    </div>
  );
}

/** Board-only: show which urgent tickets sit in Open column for this filter set */
export function BoardUrgentHint({ tickets }: { tickets: Ticket[] }) {
  const { focusUrgentAt } = useFilters();
  const urgent = tickets
    .filter((t) => t.status === 'Open' && t.priority === 'High')
    .slice(0, 3);

  if (urgent.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-signal-high">
        Pull first
      </span>
      {urgent.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => t.location && focusUrgentAt(t.location)}
          className="ix-chip inline-flex max-w-[220px] items-center gap-1.5 rounded-lg border border-signal-high/25 bg-signal-high/[0.07] px-2 py-1 text-left hover:border-signal-high/50 hover:bg-signal-high/[0.14]"
        >
          {t.location ? <LocationBadge location={t.location} emphasize /> : null}
          <span className="truncate text-[11px] text-mist-100">{t.title}</span>
        </button>
      ))}
    </div>
  );
}
