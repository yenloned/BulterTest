import { Header } from './components/Header';
import { JsonSourcePanel } from './components/JsonSourcePanel';
import { KanbanBoard } from './components/board/KanbanBoard';
import { WidgetGrid } from './components/widgets/WidgetGrid';
import { useLayout } from './context/LayoutContext';
import { useTickets } from './hooks/useTickets';

export default function App() {
  const { view } = useLayout();
  const { tickets, rawTickets, facets, total, meta, loading, error, refresh, moveTicket, saveRawTickets } =
    useTickets();

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6">
        <div key={view}>
          {view === 'overview' ? (
            <WidgetGrid
              meta={meta}
              tickets={tickets}
              facets={facets}
              totalUnfilteredHint={
                Object.values(facets?.status ?? {}).reduce((a, b) => a + b, 0) || total
              }
              loading={loading}
              error={error}
              onRetry={refresh}
            />
          ) : (
            <KanbanBoard
              tickets={tickets}
              meta={meta}
              facets={facets}
              loading={loading}
              error={error}
              onMove={moveTicket}
              onRetry={refresh}
            />
          )}
        </div>
      </main>
      <footer className="border-t border-line/60 py-5 text-center text-[11px] tracking-wide text-mist-500">
        Butler Asia · Maintenance ops
      </footer>
      <JsonSourcePanel
        rawTickets={rawTickets}
        loading={loading}
        onSave={saveRawTickets}
      />
    </div>
  );
}
