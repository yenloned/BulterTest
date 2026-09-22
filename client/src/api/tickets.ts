import type { MetaResponse, Ticket, TicketsResponse, TicketStatus } from '../types/ticket';

export interface TicketQuery {
  status: string[];
  category: string[];
  priority: string[];
  location: string[];
  q: string;
}

function toParams(query: TicketQuery): string {
  const params = new URLSearchParams();
  if (query.status.length) params.set('status', query.status.join(','));
  if (query.category.length) params.set('category', query.category.join(','));
  if (query.priority.length) params.set('priority', query.priority.join(','));
  if (query.location.length) params.set('location', query.location.join(','));
  if (query.q.trim()) params.set('q', query.q.trim());
  const s = params.toString();
  return s ? `?${s}` : '';
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function fetchTickets(query: TicketQuery): Promise<TicketsResponse> {
  return request(`/api/tickets${toParams(query)}`);
}

export function fetchMeta(): Promise<MetaResponse> {
  return request('/api/meta');
}

export function fetchRawTickets(): Promise<Ticket[]> {
  return request('/api/tickets/raw');
}

export function replaceTickets(tickets: Ticket[]): Promise<{ ok: boolean; count: number; tickets: Ticket[] }> {
  return request('/api/tickets', {
    method: 'PUT',
    body: JSON.stringify(tickets),
  });
}

export function updateTicketStatus(id: number, status: TicketStatus): Promise<Ticket> {
  return request(`/api/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
