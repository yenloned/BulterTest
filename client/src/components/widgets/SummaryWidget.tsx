import type { TicketFacets } from '../../types/ticket';
import { OpsGlance } from '../OpsGlance';

interface SummaryWidgetProps {
  facets: TicketFacets | null;
  total: number;
  filteredTotal: number;
  loading: boolean;
}

export function SummaryWidget({ facets, total, filteredTotal, loading }: SummaryWidgetProps) {
  return (
    <OpsGlance
      facets={facets}
      total={total}
      filteredTotal={filteredTotal}
      loading={loading}
    />
  );
}
