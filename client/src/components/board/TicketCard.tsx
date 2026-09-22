import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Ticket } from '../../types/ticket';
import { PriorityChip } from '../Chips';
import { LocationBadge } from '../LocationBadge';

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    data: { type: 'ticket', ticket },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-30' : ''}
      {...attributes}
      {...listeners}
    >
      <CardBody ticket={ticket} className="cursor-grab active:cursor-grabbing" showHandle />
    </div>
  );
}

export function TicketCardOverlay({ ticket }: { ticket: Ticket }) {
  return (
    <CardBody
      ticket={ticket}
      className="rotate-1 cursor-grabbing shadow-lift ring-1 ring-accent/40"
      showHandle
    />
  );
}

function CardBody({
  ticket,
  className = '',
  showHandle,
}: {
  ticket: Ticket;
  className?: string;
  showHandle?: boolean;
}) {
  const priorityAccent =
    ticket.priority === 'High'
      ? 'before:bg-signal-high group-hover/card:shadow-[inset_3px_0_0_0_rgba(251,113,133,0.9)]'
      : ticket.priority === 'Medium'
        ? 'before:bg-signal-medium group-hover/card:shadow-[inset_3px_0_0_0_rgba(251,191,36,0.85)]'
        : 'before:bg-mist-500 group-hover/card:shadow-[inset_3px_0_0_0_rgba(113,113,122,0.8)]';

  return (
    <article
      className={`group/card relative overflow-hidden rounded-xl border border-line bg-canvas-overlay/90 shadow-inset transition-all duration-200 before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:transition-all before:duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-canvas-overlay hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:before:w-1 ${priorityAccent} ${className}`}
    >
      <div className="flex items-stretch">
        {showHandle && (
          <div className="flex w-8 shrink-0 flex-col items-center justify-center border-r border-line/80 bg-white/[0.03] text-mist-500 transition-colors duration-150 group-hover/card:bg-accent/10 group-hover/card:text-accent">
            <GripIcon />
          </div>
        )}
        <div className="min-w-0 flex-1 p-3.5 pl-3">
          {ticket.location && (
            <div className="mb-2">
              <LocationBadge location={ticket.location} interactive />
            </div>
          )}
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-[13px] font-semibold leading-snug tracking-tight text-mist-100 transition-colors group-hover/card:text-mist-50">
              {ticket.title}
            </p>
            <PriorityChip priority={ticket.priority} />
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-mist-400">
            <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 font-medium text-mist-300 ring-1 ring-white/[0.06] transition-colors group-hover/card:bg-white/[0.07] group-hover/card:text-mist-200">
              {ticket.category}
            </span>
            <span className="font-mono tabular-nums text-mist-500">#{ticket.id}</span>
          </div>
          <p className="mt-2.5 font-mono text-[11px] tabular-nums text-mist-500">{ticket.created}</p>
        </div>
      </div>
    </article>
  );
}

function GripIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="6" r="1.75" />
      <circle cx="15" cy="6" r="1.75" />
      <circle cx="9" cy="12" r="1.75" />
      <circle cx="15" cy="12" r="1.75" />
      <circle cx="9" cy="18" r="1.75" />
      <circle cx="15" cy="18" r="1.75" />
    </svg>
  );
}
