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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { useLayout, WIDGET_LABELS } from '../../context/LayoutContext';
import type { MetaResponse, Ticket, TicketFacets, WidgetId } from '../../types/ticket';
import { FilterBar } from '../FilterBar';
import { ListWidget } from './ListWidget';
import { SummaryWidget } from './SummaryWidget';

const dropAnimation: DropAnimation = {
  duration: 220,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.2' } },
  }),
};

interface WidgetGridProps {
  meta: MetaResponse | null;
  tickets: Ticket[];
  facets: TicketFacets | null;
  totalUnfilteredHint: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function WidgetGrid({
  meta,
  tickets,
  facets,
  totalUnfilteredHint,
  loading,
  error,
  onRetry,
}: WidgetGridProps) {
  const { visibleWidgets, reorderWidgets, widgets } = useLayout();
  const [activeId, setActiveId] = useState<WidgetId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const ids = visibleWidgets.map((w) => w.id);
  const activeWidget = activeId ? visibleWidgets.find((w) => w.id === activeId) : null;

  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as WidgetId);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    reorderWidgets(active.id as WidgetId, over.id as WidgetId);
  }

  function onDragCancel() {
    setActiveId(null);
  }

  if (visibleWidgets.length === 0) {
    return (
      <div className="panel px-6 py-16 text-center">
        <p className="text-[15px] font-semibold text-mist-100">All widgets hidden</p>
        <p className="mt-1.5 text-[13px] text-mist-400">
          Open <span className="text-accent">Customize</span> to restore widgets.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[snapCenterToCursor]}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {visibleWidgets.map((w) => (
            <SortableWidget key={w.id} id={w.id} dense={w.id === 'summary' || w.id === 'filters'}>
              {w.id === 'summary' && (
                <SummaryWidget
                  facets={facets}
                  total={totalUnfilteredHint}
                  filteredTotal={tickets.length}
                  loading={loading}
                />
              )}
              {w.id === 'filters' && <FilterBar meta={meta} compact />}
              {w.id === 'list' && (
                <ListWidget
                  tickets={tickets}
                  loading={loading}
                  error={error}
                  onRetry={onRetry}
                />
              )}
            </SortableWidget>
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={dropAnimation} adjustScale={false}>
        {activeWidget ? (
          <div className="w-[min(720px,90vw)] cursor-grabbing">
            <WidgetShell id={activeWidget.id} floating>
              <p className="py-8 text-center text-[13px] text-mist-300">
                Moving{' '}
                <span className="font-semibold text-mist-50">
                  {WIDGET_LABELS[activeWidget.id]}
                </span>
              </p>
            </WidgetShell>
          </div>
        ) : null}
      </DragOverlay>

      <p className="mt-4 text-center text-[11px] tracking-wide text-mist-500">
        {widgets.filter((w) => w.visible).length}/{widgets.length} widgets visible · Customize in
        the header
      </p>
    </DndContext>
  );
}

function SortableWidget({
  id,
  children,
  dense,
}: {
  id: WidgetId;
  children: ReactNode;
  dense?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 0 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <WidgetShell id={id} dense={dense} handleProps={{ ...attributes, ...listeners }}>
        {children}
      </WidgetShell>
    </div>
  );
}

function WidgetShell({
  id,
  children,
  handleProps,
  floating,
  dense,
}: {
  id: WidgetId;
  children: ReactNode;
  handleProps?: Record<string, unknown>;
  floating?: boolean;
  dense?: boolean;
}) {
  const hideChromeLabel = id === 'summary';

  return (
    <section
      className={`panel relative overflow-hidden ${
        floating ? 'shadow-lift ring-2 ring-accent/50' : ''
      }`}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          className="group flex w-8 shrink-0 cursor-grab items-center justify-center border-r border-line bg-white/[0.02] text-mist-500 transition hover:bg-accent/10 hover:text-accent active:cursor-grabbing sm:w-9"
          aria-label={`Drag to reorder ${WIDGET_LABELS[id]}`}
          title="Drag to reorder"
          {...handleProps}
        >
          <GripIcon large />
        </button>

        <div className={`min-w-0 flex-1 ${dense ? 'p-3 sm:p-3.5' : 'p-4 sm:p-5'}`}>
          {!hideChromeLabel && (
            <div className={dense ? 'mb-2.5' : 'mb-3.5'}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mist-500">
                {WIDGET_LABELS[id]}
              </p>
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

function GripIcon({ large }: { large?: boolean }) {
  const size = large ? 16 : 12;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="6" r="1.75" />
      <circle cx="15" cy="6" r="1.75" />
      <circle cx="9" cy="12" r="1.75" />
      <circle cx="15" cy="12" r="1.75" />
      <circle cx="9" cy="18" r="1.75" />
      <circle cx="15" cy="18" r="1.75" />
    </svg>
  );
}
