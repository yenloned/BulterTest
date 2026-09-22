import { useCallback, useEffect, useState } from 'react';
import {
  fetchMeta,
  fetchRawTickets,
  fetchTickets,
  replaceTickets,
  updateTicketStatus,
} from '../api/tickets';
import { useFilters } from '../context/FiltersContext';
import type { MetaResponse, Ticket, TicketFacets, TicketStatus } from '../types/ticket';

interface TicketsState {
  tickets: Ticket[];
  rawTickets: Ticket[];
  facets: TicketFacets | null;
  total: number;
  meta: MetaResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  moveTicket: (id: number, status: TicketStatus) => Promise<void>;
  saveRawTickets: (tickets: Ticket[]) => Promise<void>;
}

const emptyFacets: TicketFacets = {
  status: {},
  priority: {},
  location: {},
  openHigh: 0,
  hotspots: [],
  needsAttention: [],
};

export function useTickets(): TicketsState {
  const { filters } = useFilters();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [rawTickets, setRawTickets] = useState<Ticket[]>([]);
  const [facets, setFacets] = useState<TicketFacets | null>(null);
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reloadMeta = useCallback(() => {
    fetchMeta()
      .then(setMeta)
      .catch(() => {
        /* ignore */
      });
  }, []);

  useEffect(() => {
    reloadMeta();
  }, [reloadMeta, nonce]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const handle = window.setTimeout(() => {
      Promise.all([fetchTickets(filters), fetchRawTickets()])
        .then(([filtered, raw]) => {
          if (cancelled) return;
          setTickets(filtered.tickets);
          setFacets(filtered.facets);
          setTotal(filtered.total);
          setRawTickets(raw);
        })
        .catch((err: Error) => {
          if (cancelled) return;
          setError(err.message || 'Failed to load tickets');
          setTickets([]);
          setFacets(emptyFacets);
          setTotal(0);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [filters, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  const moveTicket = useCallback(async (id: number, status: TicketStatus) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    setRawTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await updateTicketStatus(id, status);
      setNonce((n) => n + 1);
    } catch (err) {
      setNonce((n) => n + 1);
      throw err;
    }
  }, []);

  const saveRawTickets = useCallback(async (next: Ticket[]) => {
    const result = await replaceTickets(next);
    setRawTickets(result.tickets);
    setNonce((n) => n + 1);
  }, []);

  return {
    tickets,
    rawTickets,
    facets,
    total,
    meta,
    loading,
    error,
    refresh,
    moveTicket,
    saveRawTickets,
  };
}
