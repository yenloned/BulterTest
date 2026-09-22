export type TicketStatus = 'Open' | 'In Progress' | 'Closed';
export type TicketPriority = 'High' | 'Medium' | 'Low';

export interface Ticket {
  id: number;
  title: string;
  status: TicketStatus;
  category: string;
  priority: TicketPriority;
  created: string;
  location?: string;
  assignee?: string;
}

export interface TicketFacets {
  status: Record<string, number>;
  priority: Record<string, number>;
  location: Record<string, number>;
  openHigh: number;
  hotspots: { location: string; active: number }[];
  needsAttention: Ticket[];
}

export interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  facets: TicketFacets;
}

export interface MetaResponse {
  statuses: string[];
  categories: string[];
  priorities: string[];
  locations: string[];
}

export type WidgetId = 'summary' | 'filters' | 'list';

export interface WidgetConfig {
  id: WidgetId;
  visible: boolean;
}

export type ViewMode = 'overview' | 'board';
