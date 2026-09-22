import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../data/tickets.json');
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const ALLOWED_STATUSES = ['Open', 'In Progress', 'Closed'];
const ALLOWED_PRIORITIES = ['High', 'Medium', 'Low'];

function readTickets() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeTickets(tickets) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(tickets, null, 2), 'utf-8');
}

function validateTickets(payload) {
  if (!Array.isArray(payload)) {
    return 'Body must be a JSON array of tickets';
  }
  if (payload.length === 0) {
    return 'Ticket list cannot be empty';
  }
  if (payload.length > 500) {
    return 'Too many tickets (max 500)';
  }

  for (let i = 0; i < payload.length; i++) {
    const t = payload[i];
    if (!t || typeof t !== 'object') {
      return `Item ${i} must be an object`;
    }
    if (typeof t.id !== 'number' || !Number.isFinite(t.id)) {
      return `Item ${i}: id must be a number`;
    }
    if (typeof t.title !== 'string' || !t.title.trim()) {
      return `Item ${i}: title is required`;
    }
    if (!ALLOWED_STATUSES.includes(t.status)) {
      return `Item ${i}: status must be one of ${ALLOWED_STATUSES.join(', ')}`;
    }
    if (typeof t.category !== 'string' || !t.category.trim()) {
      return `Item ${i}: category is required`;
    }
    if (!ALLOWED_PRIORITIES.includes(t.priority)) {
      return `Item ${i}: priority must be one of ${ALLOWED_PRIORITIES.join(', ')}`;
    }
    if (typeof t.created !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(t.created)) {
      return `Item ${i}: created must be YYYY-MM-DD`;
    }
  }

  return null;
}

function parseList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/meta', (_req, res) => {
  const tickets = readTickets();
  const uniq = (key) =>
    [...new Set(tickets.map((t) => t[key]).filter(Boolean))].sort();
  res.json({
    statuses: uniq('status'),
    categories: uniq('category'),
    priorities: ['High', 'Medium', 'Low'].filter((p) =>
      tickets.some((t) => t.priority === p)
    ),
    locations: uniq('location'),
  });
});

app.get('/api/tickets', (req, res) => {
  const tickets = readTickets();
  const statuses = parseList(req.query.status);
  const categories = parseList(req.query.category);
  const priorities = parseList(req.query.priority);
  const locations = parseList(req.query.location);
  const q = String(req.query.q || '')
    .trim()
    .toLowerCase();

  const filtered = tickets.filter((t) => {
    if (statuses.length && !statuses.includes(t.status)) return false;
    if (categories.length && !categories.includes(t.category)) return false;
    if (priorities.length && !priorities.includes(t.priority)) return false;
    if (locations.length && !locations.includes(t.location)) return false;
    if (q) {
      const hay = `${t.title} ${t.location || ''} ${t.assignee || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const countBy = (key, values) =>
    Object.fromEntries(values.map((v) => [v, tickets.filter((t) => t[key] === v).length]));

  const allStatuses = [...new Set(tickets.map((t) => t.status))];
  const allPriorities = ['High', 'Medium', 'Low'];
  const allLocations = [...new Set(tickets.map((t) => t.location).filter(Boolean))].sort();

  const activeLoadByLocation = {};
  for (const loc of allLocations) {
    activeLoadByLocation[loc] = tickets.filter(
      (t) => t.location === loc && (t.status === 'Open' || t.status === 'In Progress')
    ).length;
  }

  const needsAttention = tickets
    .filter((t) => t.status === 'Open' && t.priority === 'High')
    .sort((a, b) => a.created.localeCompare(b.created))
    .slice(0, 5);

  const hotspots = Object.entries(activeLoadByLocation)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([location, active]) => ({ location, active }));

  res.json({
    tickets: filtered,
    total: filtered.length,
    facets: {
      status: countBy('status', allStatuses),
      priority: countBy('priority', allPriorities),
      location: activeLoadByLocation,
      openHigh: tickets.filter((t) => t.status === 'Open' && t.priority === 'High').length,
      hotspots,
      needsAttention,
    },
  });
});

app.get('/api/tickets/raw', (_req, res) => {
  res.json(readTickets());
});

app.put('/api/tickets', (req, res) => {
  const error = validateTickets(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const normalized = req.body.map((t) => ({
    id: t.id,
    title: String(t.title).trim(),
    status: t.status,
    category: String(t.category).trim(),
    priority: t.priority,
    created: t.created,
    ...(t.location != null ? { location: String(t.location) } : {}),
    ...(t.assignee != null ? { assignee: String(t.assignee) } : {}),
  }));

  writeTickets(normalized);
  res.json({ ok: true, count: normalized.length, tickets: normalized });
});

app.patch('/api/tickets/:id', (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const tickets = readTickets();
  const index = tickets.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  tickets[index] = { ...tickets[index], status };
  writeTickets(tickets);
  res.json(tickets[index]);
});

app.listen(PORT, () => {
  console.log(`Butler Asia API listening on http://localhost:${PORT}`);
});
