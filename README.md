# Butler Asia — Maintenance Ticket Dashboard

Hong Kong commercial-building maintenance ops dashboard. **React** (Vite + TypeScript) + **Node** (Express) + JSON file store.

## Personas

| Role | Display | Job |
|------|---------|-----|
| **Facility Manager** (primary) | Overview | “Where is load, and how bad?” |
| **Supervisor / tech** (secondary) | Board | Drag status under the **same** filters |

Locations (`15/F`, `G/F`, `B1`, plant rooms) are a **navigation lens**, not buried metadata.

## Features

- **OpsGlance** — compact status stats, **hotspot chips** (active Open + In Progress by zone), **Needs attention** (Open · High)
- **Shared filters** — status, category, priority, location, search (Overview ↔ Board)
- **Overview** — draggable Summary / Filters / List widgets; paginated list; column reorder + ID sort
- **Board** — Kanban Open → In Progress → Closed (`PATCH`); same glance/filters via Customize
- **JSON drawer** — header button; live edit of `tickets.json`
- **Customize** — show/hide panels (persisted in `localStorage`); Display switcher is **icon-only**

## Quick start

```bash
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| UI | http://localhost:5173 |
| API | http://localhost:4000 |

```bash
npm run build          # client production build
npm run dev:server     # API only
npm run dev:client     # Vite only
node server/data/generate.mjs   # regenerate ~80 sample tickets
```

## Project layout

```
├── client/                 # Vite + React + TS + Tailwind + @dnd-kit
│   └── src/
│       ├── components/     # Header, OpsGlance, FilterBar, JsonSourcePanel
│       │   ├── board/      # KanbanBoard, TicketCard
│       │   └── widgets/    # WidgetGrid, Summary, List
│       ├── context/        # FiltersContext, LayoutContext
│       ├── hooks/          # useTickets
│       └── api/            # tickets API client
├── server/
│   ├── src/index.js        # Express API
│   └── data/tickets.json   # source of truth
├── docs/                   # Design + architecture
├── .cursor/rules/          # Agent rules
├── .cursor/skills/         # Agent skill
└── package.json            # npm workspaces
```

## API (summary)

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/tickets` | Filters: `status`, `category`, `priority`, `location`, `q`. Facets include `hotspots`, `needsAttention` |
| `GET` | `/api/tickets/raw` | Full array for JSON editor |
| `PUT` | `/api/tickets` | Replace dataset (validated) |
| `PATCH` | `/api/tickets/:id` | `{ "status": "…" }` |
| `GET` | `/api/meta` | Distinct statuses, categories, priorities, locations |
| `GET` | `/api/health` | Health check |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for request/response details.

## Design approach

1. **Glance before table** — hotspots + urgent strip answer *where / how bad* without scrolling.
2. **One filter state** — FM triage carries into Board for supervisors.
3. **Horizontal density** — OpsGlance is a three-zone strip, not stacked cards.
4. **JSON as side channel** — drawer satisfies the data-source requirement without owning the canvas.

Full narrative: [docs/DESIGN.md](docs/DESIGN.md).

## Demo walkthrough

1. Overview → hotspots show load by zone; Needs attention shows Open · High.
2. Click a hotspot → list/board narrow to that location.
3. Switch Display → Board → same filters; drag a card to change status.
4. Open JSON → edit a title → list/board update after save.

## Agent guidance

- Rules: [`.cursor/rules/`](.cursor/rules/)
- Skill: [`.cursor/skills/butler-ops-dashboard/`](.cursor/skills/butler-ops-dashboard/)

## License

Technical assessment sample for Butler Asia.
