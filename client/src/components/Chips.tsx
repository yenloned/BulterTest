import type { TicketPriority, TicketStatus } from '../types/ticket';

const statusStyles: Record<TicketStatus, string> = {
  Open: 'bg-signal-open/10 text-signal-open ring-1 ring-signal-open/25',
  'In Progress': 'bg-signal-progress/10 text-signal-progress ring-1 ring-signal-progress/25',
  Closed: 'bg-signal-closed/10 text-signal-closed ring-1 ring-signal-closed/25',
};

const priorityStyles: Record<TicketPriority, string> = {
  High: 'bg-signal-high/10 text-signal-high ring-1 ring-signal-high/30',
  Medium: 'bg-signal-medium/10 text-signal-medium ring-1 ring-signal-medium/25',
  Low: 'bg-white/[0.04] text-mist-300 ring-1 ring-white/[0.08]',
};

const statusDot: Record<TicketStatus, string> = {
  Open: 'bg-signal-open',
  'In Progress': 'bg-signal-progress',
  Closed: 'bg-signal-closed',
};

export function StatusChip({ status }: { status: TicketStatus }) {
  return (
    <span className={`chip ${statusStyles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />
      {status}
    </span>
  );
}

export function PriorityChip({ priority }: { priority: TicketPriority }) {
  return <span className={`chip ${priorityStyles[priority]}`}>{priority}</span>;
}
