import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ViewMode, WidgetConfig, WidgetId } from '../types/ticket';

const STORAGE_KEY = 'butler-asia-dashboard-layout-v3';

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'summary', visible: true },
  { id: 'filters', visible: true },
  { id: 'list', visible: true },
];

interface LayoutContextValue {
  widgets: WidgetConfig[];
  view: ViewMode;
  setView: (view: ViewMode) => void;
  reorderWidgets: (activeId: WidgetId, overId: WidgetId) => void;
  toggleWidget: (id: WidgetId) => void;
  resetLayout: () => void;
  visibleWidgets: WidgetConfig[];
  sourceOpen: boolean;
  setSourceOpen: (open: boolean) => void;
  toggleSource: () => void;
}

interface PersistedLayout {
  widgets: WidgetConfig[];
  view: ViewMode;
  sourceOpen?: boolean;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

function loadLayout(): PersistedLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { widgets: DEFAULT_WIDGETS, view: 'overview', sourceOpen: false };
    const parsed = JSON.parse(raw) as PersistedLayout;
    const ids = new Set(DEFAULT_WIDGETS.map((w) => w.id));
    const widgets = (parsed.widgets ?? [])
      .filter((w) => ids.has(w.id))
      .map((w) => ({ id: w.id, visible: w.visible }));
    for (const def of DEFAULT_WIDGETS) {
      if (!widgets.some((w) => w.id === def.id)) widgets.push(def);
    }
    return {
      widgets,
      view: parsed.view === 'board' ? 'board' : 'overview',
      sourceOpen: Boolean(parsed.sourceOpen),
    };
  } catch {
    return { widgets: DEFAULT_WIDGETS, view: 'overview', sourceOpen: false };
  }
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const initial = loadLayout();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(initial.widgets);
  const [view, setView] = useState<ViewMode>(initial.view);
  const [sourceOpen, setSourceOpen] = useState(Boolean(initial.sourceOpen));

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ widgets, view, sourceOpen })
    );
  }, [widgets, view, sourceOpen]);

  const reorderWidgets = useCallback((activeId: WidgetId, overId: WidgetId) => {
    setWidgets((prev) => {
      const oldIndex = prev.findIndex((w) => w.id === activeId);
      const newIndex = prev.findIndex((w) => w.id === overId);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev;
      const next = [...prev];
      const [item] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, item);
      return next;
    });
  }, []);

  const toggleWidget = useCallback((id: WidgetId) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  }, []);

  const resetLayout = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    setView('overview');
  }, []);

  const toggleSource = useCallback(() => {
    setSourceOpen((o) => !o);
  }, []);

  const visibleWidgets = useMemo(
    () => widgets.filter((w) => w.visible),
    [widgets]
  );

  const value = useMemo(
    () => ({
      widgets,
      view,
      setView,
      reorderWidgets,
      toggleWidget,
      resetLayout,
      visibleWidgets,
      sourceOpen,
      setSourceOpen,
      toggleSource,
    }),
    [
      widgets,
      view,
      reorderWidgets,
      toggleWidget,
      resetLayout,
      visibleWidgets,
      sourceOpen,
      toggleSource,
    ]
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider');
  return ctx;
}

export const WIDGET_LABELS: Record<WidgetId, string> = {
  summary: 'Summary / command glance',
  filters: 'Filters',
  list: 'Ticket list (Overview)',
};
