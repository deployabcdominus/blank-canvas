import { useMemo, useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { NewWorkOrderModal } from "@/components/NewWorkOrderModal";
import { useWorkOrders, WorkOrder } from "@/contexts/WorkOrdersContext";
import { WorkOrdersControlBar, type SortKey, type ViewMode } from "@/components/work-orders/WorkOrdersControlBar";
import { useUserRole } from "@/hooks/useUserRole";
import { WorkOrderCompactCard } from "@/components/work-orders/WorkOrderCompactCard";
import { WorkOrdersTableView } from "@/components/work-orders/WorkOrdersTableView";
import { WorkOrdersPagination } from "@/components/work-orders/WorkOrdersPagination";
import { ClipboardList, Package, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const WorkOrders = () => {
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const { orders, clearOrders } = useWorkOrders();
  const { canEdit, canDelete } = useUserRole();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<ViewMode>("cards");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const handleMarkCompleted = (id: string) => {
    console.log(`Marking work order ${id} as completed`);
  };

  const handleClearOrders = () => {
    clearOrders();
    setIsClearDialogOpen(false);
    toast({ title: "Órdenes eliminadas", description: "Todas las órdenes fueron eliminadas con éxito." });
  };

  const processed = useMemo(() => {
    let result = [...orders];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.client.toLowerCase().includes(q) ||
        o.project.toLowerCase().includes(q) ||
        String(o.id).includes(q)
      );
    }
    if (statusFilter.length > 0) {
      result = result.filter(o => statusFilter.includes(o.status));
    }
    if (dateFrom) result = result.filter(o => o.startDate >= dateFrom);
    if (dateTo) result = result.filter(o => o.estimatedCompletion <= dateTo);
    result.sort((a, b) => {
      switch (sort) {
        case "newest": return b.id.localeCompare(a.id);
        case "oldest": return a.id.localeCompare(b.id);
        case "status": return a.status.localeCompare(b.status);
        case "targetDate": return (a.estimatedCompletion || "").localeCompare(b.estimatedCompletion || "");
        default: return 0;
      }
    });
    return result;
  }, [orders, search, statusFilter, dateFrom, dateTo, sort]);

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
            <h1 className="text-2xl font-bold mb-1">Órdenes de Servicio</h1>
            <p className="text-muted-foreground text-sm">Gestión y seguimiento de órdenes</p>
          </div>
          <div className="flex gap-2">
            {orders.length > 0 && canDelete && (
              <Button onClick={() => setIsClearDialogOpen(true)} variant="outline" className="btn-glass">
                <Trash2 className="w-4 h-4 mr-2" /> Limpiar
              </Button>
            )}
            {canEdit && (
              <Button onClick={() => setIsNewOrderModalOpen(true)} className="btn-glass bg-lavender text-lavender-foreground hover:bg-lavender-hover">
                <ClipboardList className="w-4 h-4 mr-2" /> Nueva Orden
              </Button>
            )}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 glass-card">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Sin órdenes de servicio</h3>
            <p className="text-muted-foreground mb-4">Comience creando su primera orden</p>
            {canEdit && (
              <Button onClick={() => setIsNewOrderModalOpen(true)} className="btn-glass bg-lavender text-lavender-foreground hover:bg-lavender-hover">
                <Plus className="w-4 h-4 mr-2" /> Nueva Orden
              </Button>
            )}
          </div>
        ) : (
          <>
            <WorkOrdersControlBar
              search={search} onSearchChange={v => { setSearch(v); setPage(1); }}
              sort={sort} onSortChange={setSort}
              view={view} onViewChange={setView}
              statusFilter={statusFilter} onStatusFilterChange={v => { setStatusFilter(v); setPage(1); }}
              dateFrom={dateFrom} onDateFromChange={setDateFrom}
              dateTo={dateTo} onDateToChange={setDateTo}
              totalItems={processed.length}
              showing={showing}
            />
            {view === "cards" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map((order, i) => (
                  <WorkOrderCompactCard key={order.id} order={order} index={i} onMarkBuilt={handleMarkCompleted} />
                ))}
              </div>
            ) : (
              <WorkOrdersTableView orders={paginated} onMarkBuilt={handleMarkCompleted} />
            )}
            <WorkOrdersPagination
              currentPage={safePage}
              totalItems={processed.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={s => { setPageSize(s); setPage(1); }}
            />
          </>
        )}

        <NewWorkOrderModal isOpen={isNewOrderModalOpen} onClose={() => setIsNewOrderModalOpen(false)} />

        <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Limpiar todas las órdenes?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearOrders} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Limpiar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ResponsiveLayout>
    </PageTransition>
  );
};

export default WorkOrders;
