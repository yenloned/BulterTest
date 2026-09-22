import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Ticket } from '../../types/ticket';
import { PriorityChip, StatusChip } from '../Chips';
import { LocationBadge } from '../LocationBadge';

type ColumnId =
  | 'id'
  | 'title'
  | 'status'
  | 'category'
  | 'priority'
  | 'location'
  | 'assignee'
  | 'created';

type SortKey = 'id' | 'created' | 'priority' | 'title' | 'status';

const COLUMN_STORAGE_KEY = 'butler-asia-ticket-columns-v2';

const DEFAULT_COLUMNS: ColumnId[] = [
  'id',
  'title',
  'status',
  'category',
  'priority',
  'location',
  'assignee',
  'created',
];

const COLUMN_META: Record<
  ColumnId,
  { label: string; sortable?: SortKey; minWidth: string }
> = {
  id: { label: 'ID', sortable: 'id', minWidth: '72px' },
  title: { label: 'Title', sortable: 'title', minWidth: '220px' },
  status: { label: 'Status', sortable: 'status', minWidth: '120px' },
  category: { label: 'Category', minWidth: '110px' },
  priority: { label: 'Priority', sortable: 'priority', minWidth: '110px' },
  location: { label: 'Location', minWidth: '130px' },
  assignee: { label: 'Assignee', minWidth: '110px' },
  created: { label: 'Created', sortable: 'created', minWidth: '110px' },
};

const priorityRank: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

const dropAnimation: DropAnimation = {
  duration: 200,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.4' } },
  }),
};

function loadColumns(): ColumnId[] {
  try {
    const raw = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (!raw) return DEFAULT_COLUMNS;
    const parsed = JSON.parse(raw) as ColumnId[];
    const valid = parsed.filter((id) => DEFAULT_COLUMNS.includes(id));
    for (const id of DEFAULT_COLUMNS) {
      if (!valid.includes(id)) valid.push(id);
    }
    return valid;
  } catch {
    return DEFAULT_COLUMNS;
  }
}

interface ListWidgetProps {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function ListWidget({ tickets, loading, error, onRetry }: ListWidgetProps) {
  const [sortKey, setSortKey] = useState<SortKey>('created');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [columns, setColumns] = useState<ColumnId[]>(loadColumns);
  const [activeCol, setActiveCol] = useState<ColumnId | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    setPage(1);
  }, [tickets, sortKey, sortDir, pageSize]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const sorted = useMemo(() => {
    const list = [...tickets];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'id') {
        cmp = a.id - b.id;
      } else if (sortKey === 'priority') {
        cmp = priorityRank[a.priority] - priorityRank[b.priority];
      } else if (sortKey === 'created') {
        cmp = a.created.localeCompare(b.created);
      } else if (sortKey === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else {
        cmp = a.status.localeCompare(b.status);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [tickets, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const pageEnd = Math.min(safePage * pageSize, sorted.length);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'created' || key === 'id' ? 'desc' : 'asc');
    }
  }

  function onDragStart(event: DragStartEvent) {
    setActiveCol(event.active.id as ColumnId);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCol(null);
    if (!over || active.id === over.id) return;
    setColumns((prev) => {
      const oldIndex = prev.indexOf(active.id as ColumnId);
      const newIndex = prev.indexOf(over.id as ColumnId);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-mist-50">Tickets</h2>
          <p className="mt-0.5 text-[12px] text-mist-400">
            {loading ? (
              'Loading…'
            ) : (
              <>
                <span className="font-medium tabular-nums text-mist-200">{tickets.length}</span>
                {` ticket${tickets.length === 1 ? '' : 's'}`}
                <span className="text-mist-500"> · drag column grips to reorder</span>
              </>
            )}
          </p>
        </div>
        {!loading && tickets.length > 0 && (
          <label className="flex items-center gap-2 text-[12px] text-mist-400">
            Rows
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-lg border border-line-soft bg-canvas px-2 py-1.5 text-[12px] text-mist-200 outline-none focus:border-accent/50"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {error && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-signal-high/25 bg-signal-high/10 px-3.5 py-2.5 text-[13px] text-signal-high">
          <span>{error}</span>
          <button
            type="button"
            className="btn-outline !border-signal-high/30 !text-signal-high"
            onClick={onRetry}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div className="rounded-xl border border-dashed border-line-soft bg-canvas/40 px-4 py-14 text-center">
          <p className="text-[14px] font-medium text-mist-200">No tickets match</p>
          <p className="mt-1 text-[12px] text-mist-500">Clear a filter or broaden your search.</p>
        </div>
      )}

      {(loading || tickets.length > 0) && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[snapCenterToCursor]}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveCol(null)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line bg-canvas/60">
                    <SortableContext items={columns} strategy={horizontalListSortingStrategy}>
                      {columns.map((colId) => (
                        <SortableColumnHeader
                          key={colId}
                          id={colId}
                          active={COLUMN_META[colId].sortable === sortKey}
                          dir={sortDir}
                          onSort={
                            COLUMN_META[colId].sortable
                              ? () => toggleSort(COLUMN_META[colId].sortable!)
                              : undefined
                          }
                        />
                      ))}
                    </SortableContext>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/80">
                  {loading && tickets.length === 0
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={columns.length} className="px-3.5 py-3.5">
                            <div className="skeleton h-3.5 w-full max-w-md" />
                          </td>
                        </tr>
                      ))
                    : pageRows.map((t) => (
                        <tr
                          key={t.id}
                          className="group relative transition-colors duration-150 hover:bg-accent/[0.07]"
                        >
                          {columns.map((colId, colIdx) => (
                            <td
                              key={colId}
                              className={`px-3.5 py-3 transition-colors ${
                                colIdx === 0
                                  ? 'relative before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-transparent before:transition-all group-hover:before:bg-accent'
                                  : ''
                              }`}
                              style={{ minWidth: COLUMN_META[colId].minWidth }}
                            >
                              <Cell ticket={t} column={colId} />
                            </td>
                          ))}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && sorted.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12px] text-mist-500">
                Showing{' '}
                <span className="tabular-nums text-mist-300">
                  {pageStart}–{pageEnd}
                </span>{' '}
                of <span className="tabular-nums text-mist-300">{sorted.length}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="btn-outline !px-2.5 !py-1.5 text-[12px] disabled:opacity-40"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <span className="px-2 font-mono text-[12px] tabular-nums text-mist-400">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  className="btn-outline !px-2.5 !py-1.5 text-[12px] disabled:opacity-40"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <DragOverlay dropAnimation={dropAnimation} adjustScale={false}>
            {activeCol ? (
              <div className="cursor-grabbing rounded-lg border border-accent/40 bg-canvas-overlay px-3 py-2 shadow-lift">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-accent">
                  <ColGrip />
                  {COLUMN_META[activeCol].label}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function SortableColumnHeader({
  id,
  active,
  dir,
  onSort,
}: {
  id: ColumnId;
  active: boolean;
  dir: 'asc' | 'desc';
  onSort?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    minWidth: COLUMN_META[id].minWidth,
    opacity: isDragging ? 0.25 : 1,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="px-2 py-2.5"
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex h-7 w-6 shrink-0 cursor-grab items-center justify-center rounded-md text-mist-500 transition hover:bg-accent/10 hover:text-accent active:cursor-grabbing"
          aria-label={`Drag ${COLUMN_META[id].label} column`}
          title="Drag to reorder column"
          {...attributes}
          {...listeners}
        >
          <ColGrip />
        </button>
        {onSort ? (
          <button
            type="button"
            onClick={onSort}
            className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] transition ${
              active ? 'text-accent' : 'text-mist-500 hover:text-mist-300'
            }`}
          >
            {COLUMN_META[id].label}
            <span className="font-mono text-[10px] opacity-70">
              {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
            </span>
          </button>
        ) : (
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-mist-500">
            {COLUMN_META[id].label}
          </span>
        )}
      </div>
    </th>
  );
}

function Cell({ ticket, column }: { ticket: Ticket; column: ColumnId }) {
  switch (column) {
    case 'id':
      return (
        <span className="font-mono text-[12px] tabular-nums text-mist-400">#{ticket.id}</span>
      );
    case 'title':
      return (
        <div className="relative max-w-[300px] font-medium text-mist-100 group-hover:text-mist-50">
          {ticket.title}
        </div>
      );
    case 'status':
      return <StatusChip status={ticket.status} />;
    case 'category':
      return <span className="text-mist-300">{ticket.category}</span>;
    case 'priority':
      return <PriorityChip priority={ticket.priority} />;
    case 'location':
      return ticket.location ? (
        <LocationBadge location={ticket.location} />
      ) : (
        <span className="text-mist-500">—</span>
      );
    case 'assignee':
      return <span className="text-mist-400">{ticket.assignee || '—'}</span>;
    case 'created':
      return (
        <span className="font-mono text-[12px] tabular-nums text-mist-500">{ticket.created}</span>
      );
  }
}

function ColGrip() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="6" r="1.75" />
      <circle cx="15" cy="6" r="1.75" />
      <circle cx="9" cy="12" r="1.75" />
      <circle cx="15" cy="12" r="1.75" />
      <circle cx="9" cy="18" r="1.75" />
      <circle cx="15" cy="18" r="1.75" />
    </svg>
  );
}
