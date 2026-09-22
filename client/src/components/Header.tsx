import { useEffect, useRef, useState } from 'react';
import { useLayout, WIDGET_LABELS } from '../context/LayoutContext';
import type { WidgetId } from '../types/ticket';

export function Header() {
  const {
    view,
    setView,
    widgets,
    toggleWidget,
    resetLayout,
    sourceOpen,
    toggleSource,
  } = useLayout();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas-overlay font-sans text-[11px] font-bold tracking-tight text-accent shadow-inset ring-1 ring-accent/30">
            <span className="absolute inset-0 rounded-xl bg-accent/10" />
            <span className="relative">BA</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h1 className="truncate text-[15px] font-semibold tracking-tight text-mist-50">
                Butler Asia
              </h1>
              <span className="hidden rounded-md bg-white/[0.04] px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wider text-mist-400 ring-1 ring-white/[0.06] sm:inline">
                Ops
              </span>
            </div>
            <p className="truncate text-[12px] text-mist-400">Maintenance command center</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div
            className="inline-flex items-center rounded-xl border border-line bg-canvas-overlay/80 p-1"
            role="tablist"
            aria-label="Display"
          >
            {(
              [
                ['overview', 'Overview', OverviewIcon],
                ['board', 'Board', BoardIcon],
              ] as const
            ).map(([id, label, Icon]) => {
              const active = view === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={label}
                  title={label}
                  onClick={() => setView(id)}
                  className={`relative inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                    active
                      ? 'bg-white/[0.08] text-mist-50 shadow-inset'
                      : 'text-mist-400 hover:bg-white/[0.04] hover:text-mist-100'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-x-1.5 -bottom-px h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
                  )}
                  <Icon active={active} />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className={`btn-outline font-mono ${
              sourceOpen ? 'border-accent/40 bg-accent/10 text-accent' : ''
            }`}
            onClick={toggleSource}
            aria-pressed={sourceOpen}
            title="Open JSON data source"
          >
            <BracesIcon />
            <span className="hidden sm:inline">JSON</span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className={`btn-outline ${menuOpen ? 'border-accent/40 text-accent' : ''}`}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <SlidersIcon />
              Customize
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-30 mt-2 w-60 animate-fade-up rounded-xl border border-line bg-canvas-overlay p-2 shadow-lift">
                <p className="px-2 pb-1.5 pt-1 text-2xs font-semibold uppercase tracking-[0.08em] text-mist-500">
                  Layout panels
                </p>
                <ul className="space-y-0.5">
                  {(Object.keys(WIDGET_LABELS) as WidgetId[]).map((id) => {
                    const cfg = widgets.find((w) => w.id === id);
                    return (
                      <li key={id}>
                        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] text-mist-200 transition hover:bg-white/[0.04]">
                          <input
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded border-line-strong bg-canvas text-accent focus:ring-accent/40 focus:ring-offset-0"
                            checked={cfg?.visible ?? false}
                            onChange={() => toggleWidget(id)}
                          />
                          {WIDGET_LABELS[id]}
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-1 border-t border-line pt-1">
                  <button
                    type="button"
                    className="btn-ghost w-full justify-start text-[12px]"
                    onClick={() => {
                      resetLayout();
                      setMenuOpen(false);
                    }}
                  >
                    Reset layout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function OverviewIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={active ? 'text-accent' : undefined}
    >
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function BoardIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={active ? 'text-accent' : undefined}
    >
      <rect x="3" y="4" width="5" height="16" rx="1.25" stroke="currentColor" strokeWidth="1.75" />
      <rect x="10" y="4" width="5" height="11" rx="1.25" stroke="currentColor" strokeWidth="1.75" />
      <rect x="17" y="4" width="5" height="14" rx="1.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function BracesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 4c-2 0-3 1.2-3 3v3c0 1-.8 1.5-1.5 2C5.2 12.5 6 13 6 14v3c0 1.8 1 3 3 3M16 4c2 0 3 1.2 3 3v3c0 1 .8 1.5 1.5 2-.7.5-1.5 1-1.5 2v3c0 1.8-1 3-3 3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M10 8h4M18 16h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
