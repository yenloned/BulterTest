# Butler ops dashboard — reference

## Commands

```bash
npm install
npm run dev
npm run build
node server/data/generate.mjs
```

Ports: UI `5173`, API `4000` (Vite proxy `/api`).

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Liveness |
| GET | `/api/meta` | Filter option lists |
| GET | `/api/tickets` | Filtered tickets + facets |
| GET | `/api/tickets/raw` | Editor payload |
| PUT | `/api/tickets` | Replace JSON file |
| PATCH | `/api/tickets/:id` | Status only |

Facet fields used by UI: `status`, `priority`, `location`, `openHigh`, `hotspots`, `needsAttention`.

## Important client modules

| Module | Responsibility |
|--------|----------------|
| `FiltersContext` | Query state; `setLocationOnly`, `focusUrgentAt` |
| `LayoutContext` | View, widgets, JSON drawer |
| `useTickets` | Data fetching + mutations |
| `OpsGlance` | FM command strip |
| `WidgetGrid` | Overview DnD widgets |
| `KanbanBoard` | Board DnD + Customize visibility |
| `JsonSourcePanel` | Live JSON |

## Ticket validation (PUT)

Server requires non-empty array (≤500), numeric `id`, non-empty `title`/`category`, allowed status/priority, `created` as `YYYY-MM-DD`. Location/assignee optional.
