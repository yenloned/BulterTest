---
name: butler-ops-dashboard
description: >-
  Maintains the Butler Asia HK building maintenance ticket dashboard (React+Express+JSON).
  Use when changing Overview/Board UI, OpsGlance, filters, Kanban, tickets API, facets,
  LocationBadge, JSON panel, README/docs, or FM/supervisor UX for this repo.
---

# Butler ops dashboard

## Product invariants

1. **FM first** — Overview answers “where + how bad?” before deep lists.
2. **Shared filters** — Overview and Board use one `FiltersContext`; never fork filter state per view.
3. **Location is first-class** — chips, badges, API `location` query, hotspot facets.
4. **JSON is a side channel** — drawer edits `tickets.json`; don’t put the editor in the main canvas.
5. **No floor plan / auth / SLA** — polish glance + board workflows instead.

## Before changing UI

1. Read [docs/DESIGN.md](../../../docs/DESIGN.md) and [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md).
2. Prefer horizontal density (OpsGlance pattern) over stacking tall cards.
3. Keep hover/focus feedback (`.ix-chip`, `.ix-row`, card lift) on new clickable surfaces.

## Common tasks

### Add a filter dimension

1. Extend `GET /api/tickets` parse + filter in `server/src/index.js`.
2. Expose facet/meta if needed.
3. Add key to `TicketQuery` + `FiltersContext` + `FilterBar`.

### Change OpsGlance

- Shared component: `client/src/components/OpsGlance.tsx`.
- Overview wraps via `SummaryWidget`; Board uses `compact`.
- Hotspot → `setLocationOnly`; urgent → `focusUrgentAt`.

### Board status updates

- Optimistic local state in `KanbanBoard`, persist with `moveTicket` → `PATCH /api/tickets/:id`.

### Layout / Customize

- Visibility in `LayoutContext` (`summary` | `filters` | `list`).
- Board honors `summary` (glance) and `filters`; `list` is Overview-only.
- Display toggle in `Header` is **icon-only**.

### Regenerate data

```bash
node server/data/generate.mjs
```

## Do not

- Split Overview/Board into separate ticket caches.
- Auto-apply aggressive default filters on first load (glance should tell the story unfiltered).
- Mention interview/assessment framing in user-facing UI copy.

## Extra reference

- API and file map: [reference.md](reference.md)
