# Design notes — Butler Asia ops dashboard

## Positioning

- **Primary user:** Facility Manager opening Overview to answer “Where, and how bad?” in seconds.
- **Secondary user:** Supervisor on Board moving work; inherits shared filters.
- **Creative axis:** Hong Kong building vernacular as a **filter and badge language**, not a floor-plan gimmick.

## What we optimized for

| Goal | Choice |
|------|--------|
| Fast triage | OpsGlance: stats · hotspot chips · urgent rows in one horizontal strip |
| Shared context | One `FiltersContext`; Overview and Board consume the same query |
| Density | Prefer horizontal layout and capped lists over tall stacked cards |
| Discoverability | Hotspot / urgent clicks set filters; hover accents on chips, rows, cards |
| Brief compliance | JSON drawer + filters + draggable widgets without drowning the ops story |

## Explicitly out of scope

- Interactive floor plan / map
- Auth, SLA timers, new CRUD forms
- Separate datasets per view

## Display modes

Both modes share tickets, facets, and filters. Difference is presentation and primary action:

| | Overview | Board |
|--|----------|-------|
| Layout | Widget stack (Summary / Filters / List) | Kanban columns |
| Primary action | Scan + filter + sort list | Drag card → `PATCH` status |
| Customize | Toggle widgets; drag reorder | Summary → glance; Filters → filter panel; List only affects Overview |

Header **Display** control is icon-only (Overview grid vs Board columns).

## Interaction model

- **Hotspot chip** → `setLocationOnly(location)`
- **Needs attention / Pull first** → `focusUrgentAt(location)` (Open + High + that zone)
- **Board card drag** → optimistic local status, then `PATCH /api/tickets/:id`
- **JSON panel** → `GET/PUT /api/tickets` raw array; validation on server

## Visual language

- Dark canvas, teal accent (`--accent`), status/priority signal colors
- `LocationBadge` — mono floor/zone chip
- Interactive utilities: `.ix-chip`, `.ix-row`, `.ix-stat` (hover / focus-visible)
- Motion: short fades, drag overlays via `@dnd-kit`; respect `prefers-reduced-motion`

## Demo story (walkthrough ammo)

1. Overview glance → *where* (hotspots) and *what’s urgent* (Needs attention).
2. Click hotspot → both views filter to that zone.
3. Board → drag status for supervisor workflow.
4. JSON drawer → honest data source for the technical requirement.
