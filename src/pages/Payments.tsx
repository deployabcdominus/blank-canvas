import { useState, useMemo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { usePayments, Payment } from "@/contexts/PaymentsContext";
import { useProposals } from "@/contexts/ProposalsContext";
import { PaymentsKPIBar } from "@/components/payments/PaymentsKPIBar";
import { PaymentsControlBar, type PaymentSortKey, type ViewMode } from "@/components/payments/PaymentsControlBar";
import { PaymentsTableView } from "@/components/payments/PaymentsTableView";
import { PaymentsCardView } from "@/components/payments/PaymentsCardView";
import { WorkOrdersPagination } from "@/components/work-orders/WorkOrdersPagination";
import { DollarSign } from "lucide-react";

const Payments = () => {
  const { payments, loading } = usePayments();
  const { proposals } = useProposals();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<PaymentSortKey>("date_desc");
  const [view, setView] = useState<ViewMode>("table");
  const [methodFilter, setMethodFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Build a map of proposal id -> proposal for enrichment
  const proposalMap = useMemo(() => {
    const map = new Map<string, { client: string; project: string }>();
    proposals.forEach(p => map.set(p.id, { client: p.client, project: p.project }));
    return map;
  }, [proposals]);

  const processed = useMemo(() => {
    let result = [...payments];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => {
        const info = proposalMap.get(p.proposalId);
        return (
          info?.client.toLowerCase().includes(q) ||
          info?.project.toLowerCase().includes(q) ||
          p.method.toLowerCase().includes(q) ||
          p.note?.toLowerCase().includes(q)
        );
      });
    }

    if (methodFilter.length > 0) {
      result = result.filter(p => methodFilter.includes(p.method));
    }
    if (statusFilter.length > 0) {
      result = result.filter(p => statusFilter.includes(p.status));
    }
    if (dateFrom) result = result.filter(p => p.paidAt >= dateFrom);
    if (dateTo) result = result.filter(p => p.paidAt <= dateTo + "T23:59:59");

    result.sort((a, b) => {
      switch (sort) {
        case "date_desc": return b.paidAt.localeCompare(a.paidAt);
        case "date_asc": return a.paidAt.localeCompare(b.paidAt);
        case "amount_desc": return b.amount - a.amount;
        case "amount_asc": return a.amount - b.amount;
        default: return 0;
      }
    });

    return result;
  }, [payments, search, methodFilter, statusFilter, dateFrom, dateTo, sort, proposalMap]);

  const totalPages = Math.ceil(processed.length / pageSize);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const paginated = processed.slice((safePage - 1) * pageSize, safePage * pageSize);
  const showing = processed.length > 0
    ? `Mostrando ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, processed.length)} de ${processed.length}`
    : "Sin resultados";

  return (
    <PageTransition>
      <ResponsiveLayout>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold mb-1">Pagos</h1>
            <p className="text-muted-foreground text-sm">Historial de pagos recibidos</p>
          </div>
        </div>

        <PaymentsKPIBar payments={payments} />

        <PaymentsControlBar
          search={search} onSearchChange={v => { setSearch(v); setPage(1); }}
          sort={sort} onSortChange={setSort}
          view={view} onViewChange={setView}
          methodFilter={methodFilter} onMethodFilterChange={v => { setMethodFilter(v); setPage(1); }}
          statusFilter={statusFilter} onStatusFilterChange={v => { setStatusFilter(v); setPage(1); }}
          dateFrom={dateFrom} onDateFromChange={setDateFrom}
          dateTo={dateTo} onDateToChange={setDateTo}
          totalItems={processed.length}
          showing={showing}
        />

        {loading ? (
          <div className="text-center py-12 glass-card">
            <p className="text-muted-foreground">Cargando pagos...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Sin pagos registrados</h3>
            <p className="text-muted-foreground">Los pagos se registran desde las propuestas aprobadas</p>
          </div>
        ) : view === "table" ? (
          <PaymentsTableView payments={paginated} proposalMap={proposalMap} />
        ) : (
          <PaymentsCardView payments={paginated} proposalMap={proposalMap} />
        )}

        <WorkOrdersPagination
          currentPage={safePage}
          totalItems={processed.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={s => { setPageSize(s); setPage(1); }}
        />
      </ResponsiveLayout>
    </PageTransition>
  );
};

export default Payments;
