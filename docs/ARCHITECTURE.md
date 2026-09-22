# Architecture

## Stack

| Layer | Tech |
|-------|------|
| Monorepo | npm workspaces (`client`, `server`) + `concurrently` |
| Client | Vite 6, React 18, TypeScript, Tailwind |
| DnD | `@dnd-kit` (widgets, list columns, Kanban) |
| Server | Express (ESM), `cors`, file-backed JSON |
| Persistence | `server/data/tickets.json` |

## Data flow

```
FiltersContext ──► useTickets ──► GET /api/tickets?…
                       │
                       ├── tickets[] ──► ListWidget / KanbanBoard
                       └── facets ────► OpsGlance (hotspots, needsAttention)

LayoutContext ──► view (overview|board), widgets[], sourceOpen
                       │
                       ├── WidgetGrid (sortable widgets)
                       └── KanbanBoard (showGlance / showFilters)

JsonSourcePanel ──► GET/PUT /api/tickets (+ raw)
Kanban drag ──────► PATCH /api/tickets/:id
```

Vite proxies `/api` → `http://localhost:4000`.

## Ticket shape

```ts
{
  id: number;
  title: string;
  status: 'Open' | 'In Progress' | 'Closed';
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  created: 'YYYY-MM-DD';
  location?: string;
  assignee?: string;
}
```

## API

### `GET /api/tickets`

Query (comma-separated multi-select): `status`, `category`, `priority`, `location`, `q` (search title/location/assignee).

Response:

```json
{
  "tickets": [ /* filtered */ ],
  "total": 80,
  "facets": {
    "status": { "Open": 27, "In Progress": 36, "Closed": 17 },
    "priority": { "High": 34, "Medium": 27, "Low": 19 },
    "location": { "Office 15/F": 7 },
    "openHigh": 11,
    "hotspots": [{ "location": "AHU room 10/F", "active": 7 }],
    "needsAttention": [ /* up to ~5 Open+High tickets */ ]
  }
}
```

Hotspots: top locations by **active** count (Open + In Progress).  
`needsAttention`: Open + High, location-forward for FM triage.

### Other routes

| Route | Behavior |
|-------|----------|
| `GET /api/meta` | Distinct statuses, categories, priorities, locations |
| `GET /api/tickets/raw` | Full array for editor |
| `PUT /api/tickets` | Replace file; validates array, statuses, priorities, dates |
| `PATCH /api/tickets/:id` | Update `status` only |
| `GET /api/health` | `{ ok: true }` |

## Client structure (key files)

| Path | Role |
|------|------|
| `App.tsx` | View switch; wires tickets → Overview / Board |
| `OpsGlance.tsx` | Shared FM strip (Overview + Board) |
| `FiltersContext.tsx` | Filter state + hotspot helpers |
| `LayoutContext.tsx` | View, widget visibility/order, JSON drawer |
| `useTickets.ts` | Fetch on filter change; move/save helpers |
| `WidgetGrid.tsx` | DnD widget shell |
| `KanbanBoard.tsx` | Columns + status patch |
| `JsonSourcePanel.tsx` | Side drawer editor |

## Local persistence

Key: `butler-asia-dashboard-layout-v3`  
Stores: widget order/visibility, active view, JSON panel open flag.

## Sample data

```bash
node server/data/generate.mjs
```

Writes ~80 tickets; first titles align with the brief’s sample set.

## Known DX notes

- `node --watch` can hit `EADDRINUSE` on port 4000 if a previous API process is still bound — kill the port occupant and restart `npm run dev`.
- Customize **Ticket list** only affects Overview; Summary/Filters apply to both displays.
