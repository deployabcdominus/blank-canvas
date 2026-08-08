
import { useState, useMemo } from 'react';
import { WorkOrder } from '@/types/domain';

export const useWorkOrderFilters = (orders: WorkOrder[]) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const processed = useMemo(() => {
    let result = [...orders];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.client.toLowerCase().includes(q) ||
        o.project.toLowerCase().includes(q) ||
        (o.wo_number || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      if (statusFilter === "installed") {
        result = result.filter(o => o.poi_token_used);
      } else {
        result = result.filter(o => o.status === statusFilter && !o.poi_token_used);
      }
    }
    if (assigneeFilter !== "all") {
      result = result.filter(o => o.assignedToUserId === assigneeFilter);
    }
    result.sort((a, b) => b.id.localeCompare(a.id));
    return result;
  }, [orders, search, statusFilter, assigneeFilter]);

  return {
    search, setSearch,
    statusFilter, setStatusFilter,
    assigneeFilter, setAssigneeFilter,
    page, setPage,
    pageSize, setPageSize,
    processed
  };
};
