import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEffect, useMemo, useState } from 'react';
import { useLayout } from '../../context/LayoutContext';
import type { MetaResponse, Ticket, TicketFacets, TicketStatus } from '../../types/ticket';
import { FilterBar } from '../FilterBar';
import { BoardUrgentHint, OpsGlance } from '../OpsGlance';
import { TicketCard, TicketCardOverlay } from './TicketCard';

const COLUMNS: TicketStatus[] = ['Open', 'In Progress', 'Closed'];

interface KanbanBoardProps {
  tickets: Ticket[];
  meta: MetaResponse | null;
  facets: TicketFacets | null;
  loading: boolean;
  error: string | null;
  onMove: (id: number, status: TicketStatus) => Promise<void>;
  onRetry: () => void;
}

export function KanbanBoard({
  tickets,
  meta,
  facets,
  loading,
  error,
  onMove,
  onRetry,
}: KanbanBoardProps) {
  const { widgets } = useLayout();
  const showGlance = widgets.find((w) => w.id === 'summary')?.visible ?? true;
  const showFilters = widgets.find((w) => w.id === 'filters')?.visible ?? true;

  const [activeId, setActiveId] = useState<number | null>(null);
  const [localTickets, setLocalTickets] = useState<Ticket[] | null>(null);
  const display = localTickets ?? tickets;

  useEffect(() => {
    if (activeId == null) setLocalTickets(null);
  }, [tickets, activeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const byStatus = useMemo(() => {
    const map: Record<TicketStatus, Ticket[]> = {
      Open: [],
      'In Progress': [],
      Closed: [],
    };
    for (const t of display) {
      map[t.status]?.push(t);
    }
    return map;
  }, [display]);

  const highInColumn = useMemo(() => {
    const map: Record<TicketStatus, number> = {
      Open: 0,
      'In Progress': 0,
      Closed: 0,
    };
    for (const t of display) {
      if (t.priority === 'High') map[t.status] += 1;
    }
    return map;
  }, [display]);

  const activeTicket = activeId != null ? display.find((t) => t.id === activeId) : null;

  function onDragStart(event: DragStartEvent) {
    setActiveId(Number(event.active.id));
    setLocalTickets(tickets);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeTicketId = Number(active.id);
    const overId = over.id;

    setLocalTickets((prev) => {
      const list = prev ?? tickets;
      const current = list.find((t) => t.id === activeTicketId);
      if (!current) return list;

      let nextStatus: TicketStatus | null = null;
      if (COLUMNS.includes(overId as TicketStatus)) {
        nextStatus = overId as TicketStatus;
      } else {
        const overTicket = list.find((t) => t.id === Number(overId));
        if (overTicket) nextStatus = overTicket.status;
      }

      if (!nextStatus || current.status === nextStatus) return list;
      return list.map((t) => (t.id === activeTicketId ? { ...t, status: nextStatus! } : t));
    });
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      setLocalTickets(null);
      return;
    }

    const id = Number(active.id);
    const working = localTickets ?? tickets;
    const ticket = working.find((t) => t.id === id);
    const original = tickets.find((t) => t.id === id);
    if (!ticket || !original) {
      setLocalTickets(null);
      return;
    }

    if (ticket.status === original.status) {
      setLocalTickets(null);
      return;
    }

    try {
      await onMove(id, ticket.status);
    } catch {
      /* refresh on failure */
    } finally {
      setLocalTickets(null);
    }
  }

  return (
    <div className="animate-fade-in space-y-3">
      {showGlance && (
        <div className="panel p-3 sm:p-3.5">
          <OpsGlance facets={facets} loading={loading} compact />
        </div>
      )}

      {showFilters && (
        <div className="panel p-3 sm:p-3.5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <BoardUrgentHint tickets={tickets} />
            <p className="text-[11px] text-mist-500">
              Drag cards by <span className="text-accent">⋮⋮</span> to change status
            </p>
          </div>
          <FilterBar meta={meta} compact />
        </div>
      )}

      {!showFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
          <BoardUrgentHint tickets={tickets} />
          <p className="text-[11px] text-mist-500">
            Drag cards by <span className="text-accent">⋮⋮</span> to change status
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-signal-high/25 bg-signal-high/10 px-3.5 py-2.5 text-[13px] text-signal-high">
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="stagger grid gap-3 lg:grid-cols-3">
          {COLUMNS.map((status) => (
            <Column
              key={status}
              status={status}
              tickets={byStatus[status]}
              highCount={highInColumn[status]}
              loading={loading}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
          {activeTicket ? <TicketCardOverlay ticket={activeTicket} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({
  status,
  tickets,
  highCount,
  loading,
}: {
  status: TicketStatus;
  tickets: Ticket[];
  highCount: number;
  loading: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const accent =
    status === 'Open'
      ? 'text-signal-open'
      : status === 'In Progress'
        ? 'text-signal-progress'
        : 'text-signal-closed';

  const bar =
    status === 'Open'
      ? 'bg-signal-open'
      : status === 'In Progress'
        ? 'bg-signal-progress'
        : 'bg-signal-closed';

  return (
    <div
      ref={setNodeRef}
      className={`panel animate-fade-up flex min-h-[380px] flex-col overflow-hidden transition-all duration-200 ${
        isOver
          ? 'scale-[1.01] shadow-lift ring-1 ring-accent/45 bg-accent/[0.03]'
          : 'hover:border-line-soft'
      }`}
    >
      <div className="relative border-b border-line px-3.5 py-3">
        <div className={`absolute inset-x-0 top-0 h-px ${bar} opacity-60`} />
        <div className="flex items-center justify-between gap-2">
          <h3 className={`text-[13px] font-semibold tracking-tight ${accent}`}>{status}</h3>
          <div className="flex items-center gap-1.5">
            {highCount > 0 && status !== 'Closed' ? (
              <span className="rounded-md bg-signal-high/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-signal-high ring-1 ring-signal-high/25">
                {highCount} High
              </span>
            ) : null}
            <span className="rounded-md bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums text-mist-300 ring-1 ring-white/[0.06]">
              {tickets.length}
            </span>
          </div>
        </div>
      </div>
      <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex max-h-[min(62vh,640px)] flex-1 flex-col gap-2 overflow-y-auto p-2.5">
          {loading && tickets.length === 0 && (
            <div className="space-y-2.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-[88px]" />
              ))}
            </div>
          )}
          {!loading && tickets.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-line-soft px-3 py-10">
              <p className="text-[12px] text-mist-500">Drop tickets here</p>
            </div>
          )}
          {tickets.map((t) => (
            <TicketCard key={t.id} ticket={t} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
