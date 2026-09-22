import { useEffect, useRef, useState } from 'react';
import { useLayout } from '../context/LayoutContext';
import type { Ticket, TicketPriority, TicketStatus } from '../types/ticket';

const STATUSES: TicketStatus[] = ['Open', 'In Progress', 'Closed'];
const PRIORITIES: TicketPriority[] = ['High', 'Medium', 'Low'];

type SyncState = 'idle' | 'editing' | 'invalid' | 'saving' | 'synced' | 'error';

interface JsonSourcePanelProps {
  rawTickets: Ticket[];
  loading: boolean;
  onSave: (tickets: Ticket[]) => Promise<void>;
}

function validateClient(tickets: unknown): string | null {
  if (!Array.isArray(tickets)) return 'Root value must be a JSON array';
  if (tickets.length === 0) return 'Array cannot be empty';
  for (let i = 0; i < tickets.length; i++) {
    const t = tickets[i] as Partial<Ticket>;
    if (!t || typeof t !== 'object') return `Item ${i} must be an object`;
    if (typeof t.id !== 'number') return `Item ${i}: id must be a number`;
    if (typeof t.title !== 'string' || !t.title.trim()) return `Item ${i}: title required`;
    if (!STATUSES.includes(t.status as TicketStatus)) {
      return `Item ${i}: status must be Open | In Progress | Closed`;
    }
    if (typeof t.category !== 'string' || !t.category.trim()) {
      return `Item ${i}: category required`;
    }
    if (!PRIORITIES.includes(t.priority as TicketPriority)) {
      return `Item ${i}: priority must be High | Medium | Low`;
    }
    if (typeof t.created !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(t.created)) {
      return `Item ${i}: created must be YYYY-MM-DD`;
    }
  }
  return null;
}

export function JsonSourcePanel({ rawTickets, loading, onSave }: JsonSourcePanelProps) {
  const { sourceOpen, setSourceOpen } = useLayout();
  const [text, setText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [sync, setSync] = useState<SyncState>('idle');
  const focusedRef = useRef(false);
  const lastSavedCanonical = useRef('');
  const saveGen = useRef(0);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!sourceOpen) return;
    if (focusedRef.current) return;
    if (!rawTickets.length && loading) return;
    const next = JSON.stringify(rawTickets, null, 2);
    setText(next);
    lastSavedCanonical.current = next;
    setParseError(null);
    setSync(rawTickets.length ? 'synced' : 'idle');
  }, [rawTickets, loading, sourceOpen]);

  useEffect(() => {
    if (!sourceOpen || !text) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setParseError('Invalid JSON — fix syntax to sync');
      setSync('invalid');
      return;
    }

    const validationError = validateClient(parsed);
    if (validationError) {
      setParseError(validationError);
      setSync('invalid');
      return;
    }

    const canonical = JSON.stringify(parsed, null, 2);
    if (canonical === lastSavedCanonical.current) {
      setParseError(null);
      setSync('synced');
      return;
    }

    setParseError(null);
    setSync('editing');

    const gen = ++saveGen.current;
    const handle = window.setTimeout(async () => {
      setSync('saving');
      try {
        await onSaveRef.current(parsed as Ticket[]);
        if (saveGen.current !== gen) return;
        lastSavedCanonical.current = canonical;
        setSync('synced');
      } catch (err) {
        if (saveGen.current !== gen) return;
        setParseError(err instanceof Error ? err.message : 'Save failed');
        setSync('error');
      }
    }, 450);

    return () => window.clearTimeout(handle);
  }, [text, sourceOpen]);

  useEffect(() => {
    if (!sourceOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSourceOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sourceOpen, setSourceOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          sourceOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSourceOpen(false)}
        aria-hidden={!sourceOpen}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[min(520px,100vw)] flex-col border-l border-line bg-canvas-raised shadow-lift transition-transform duration-300 ease-out ${
          sourceOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!sourceOpen}
        aria-label="JSON data source"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mist-500">
              Data source
            </p>
            <h2 className="truncate font-mono text-[13px] font-medium text-mist-100">
              tickets.json
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge state={sync} count={rawTickets.length} />
            <button
              type="button"
              className="btn-ghost h-8 w-8 !p-0"
              onClick={() => setSourceOpen(false)}
              aria-label="Close JSON panel"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-line bg-canvas/80 px-4 py-2">
          <span className="font-mono text-[11px] text-mist-500">server/data/tickets.json</span>
          <span className="text-[11px] text-mist-500">
            {sync === 'saving' ? 'Writing…' : 'Autosave · Esc to close'}
          </span>
        </div>

        <div className="min-h-0 flex-1">
          <textarea
            value={text}
            spellCheck={false}
            disabled={(loading && !text) || !sourceOpen}
            onFocus={() => {
              focusedRef.current = true;
            }}
            onBlur={() => {
              focusedRef.current = false;
            }}
            onChange={(e) => setText(e.target.value)}
            className={`h-full w-full resize-none border-0 bg-canvas px-4 py-3 font-mono text-[12px] leading-relaxed text-mist-200 outline-none placeholder:text-mist-500 disabled:opacity-50 ${
              sync === 'invalid' || sync === 'error'
                ? 'ring-1 ring-inset ring-signal-high/40'
                : ''
            }`}
            placeholder="Loading JSON…"
            aria-label="JSON data source editor"
          />
        </div>

        <div className="border-t border-line px-4 py-3">
          {parseError ? (
            <p className="text-[12px] text-signal-high">{parseError}</p>
          ) : (
            <p className="text-[12px] text-mist-500">
              Edit live — valid JSON syncs to the table and board instantly.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

function StatusBadge({ state, count }: { state: SyncState; count: number }) {
  const map: Record<SyncState, { label: string; className: string }> = {
    idle: { label: 'Idle', className: 'text-mist-400 bg-white/[0.04] ring-white/[0.06]' },
    editing: {
      label: 'Editing…',
      className: 'text-signal-medium bg-signal-medium/10 ring-signal-medium/25',
    },
    invalid: { label: 'Invalid', className: 'text-signal-high bg-signal-high/10 ring-signal-high/30' },
    saving: {
      label: 'Saving…',
      className: 'text-signal-progress bg-signal-progress/10 ring-signal-progress/25',
    },
    synced: {
      label: `${count} · synced`,
      className: 'text-accent bg-accent/10 ring-accent/30',
    },
    error: { label: 'Error', className: 'text-signal-high bg-signal-high/10 ring-signal-high/30' },
  };
  const cfg = map[state];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold ring-1 ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
