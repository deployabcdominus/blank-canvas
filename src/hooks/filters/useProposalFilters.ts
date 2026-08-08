
import { useState, useMemo } from 'react';
import { Proposal, ProposalSortKey } from '@/types/domain';

export const useProposalFilters = (proposals: Proposal[]) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProposalSortKey>("updated");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const processed = useMemo(() => {
    let result = [...proposals];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.client.toLowerCase().includes(q) || p.project.toLowerCase().includes(q));
    }
    if (statusFilter.length > 0) result = result.filter(p => statusFilter.includes(p.status));
    if (dateFrom) result = result.filter(p => (p.sentDate || p.createdAt) >= dateFrom);
    if (dateTo) result = result.filter(p => (p.sentDate || p.createdAt) <= dateTo);

    result.sort((a, b) => {
      switch (sort) {
        case "updated": return (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt);
        case "amount_desc": return b.value - a.value;
        case "amount_asc": return a.value - b.value;
        case "status": return a.status.localeCompare(b.status);
        case "sent_date": return (b.sentDate || "").localeCompare(a.sentDate || "");
        default: return 0;
      }
    });
    return result;
  }, [proposals, search, statusFilter, dateFrom, dateTo, sort]);

  return {
    search, setSearch,
    sort, setSort,
    statusFilter, setStatusFilter,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    page, setPage,
    pageSize, setPageSize,
    processed
  };
};
