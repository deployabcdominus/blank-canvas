
import { useMemo, useState, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewWorkOrderModal } from "@/components/NewWorkOrderModal";
import { useWorkOrdersQuery } from "@/hooks/queries/useWorkOrdersQuery";
import { useUserRole } from "@/hooks/useUserRole";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useLanguage } from "@/i18n/LanguageContext";
import { PlanLimitBanner } from "@/components/PlanLimitBanner";
import { WorkOrderCard } from "@/components/work-orders/WorkOrderCard";
import { WorkOrdersTableView } from "@/components/work-orders/WorkOrdersTableView";
import { WorkOrdersPagination } from "@/components/work-orders/WorkOrdersPagination";
import { EditWorkOrderModal } from "@/components/work-orders/EditWorkOrderModal";
import { ProductionSheetModal } from "@/components/work-orders/ProductionSheetModal";
import { supabase } from "@/integrations/supabase/client";
import {
  ClipboardList, Package, Plus, Trash2, Search, X,
  LayoutGrid, List,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useWorkOrderFilters } from "@/hooks/filters/useWorkOrderFilters";
import { useWorkOrderActions } from "@/hooks/actions/useWorkOrderActions";

type ViewMode = "cards" | "list";

const getStatusOptions = (t: any) => [
  { value: "all", label: t.workOrders.allStatuses || "All Statuses" },
  { value: "Pendiente", label: t.workOrders.statusLabels.pending },
  { value: "En Progreso", label: t.workOrders.statusLabels.inProduction },
  { value: "Control de Calidad", label: t.workOrders.statusLabels.qc },
  { value: "Completada", label: t.workOrders.statusLabels.ready },
  { value: "installed", label: t.workOrders.statusLabels.installed },
];

const WorkOrders = () => {
  const { companyId, canEdit, canDelete, isAdmin } = useUserRole();
  const { orders, isLoading, updateWorkOrderMutation, deleteWorkOrderMutation, clearWorkOrdersMutation, workOrdersQuery } = useWorkOrdersQuery(companyId);
  const refreshOrders = () => workOrdersQuery.refetch();

  const filter = useWorkOrderFilters(orders);
  const actions = useWorkOrderActions(
    companyId,
    { updateWorkOrderMutation, deleteWorkOrderMutation, clearWorkOrdersMutation }
  );

  const limits = usePlanLimits();
  const { t } = useLanguage();
  const STATUS_OPTIONS = useMemo(() => getStatusOptions(t), [t]);
  const [view, setView] = useState<ViewMode>("cards");

  const [profileMap, setProfileMap] = useState<Record<string, string>>({});
  const assigneeIds = useMemo(() => {
    const ids = new Set<string>();
    orders.forEach(o => { if (o.assignedToUserId) ids.add(o.assignedToUserId); });
    return Array.from(ids);
  }, [orders]);

  useEffect(() => {
    if (assigneeIds.length === 0) return;
    supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", assigneeIds)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((p) => { map[p.id] = p.full_name || "Unknown"; });
          setProfileMap(map);
        }
      });
  }, [assigneeIds]);

  const teamMembers = useMemo(() => {
    return Object.entries(profileMap).map(([id, name]) => ({ id, name }));
  }, [profileMap]);

  const totalPages = Math.ceil(filter.processed.length / filter.pageSize);
  const safePage = Math.min(filter.page, Math.max(totalPages, 1));
  const paginated = filter.processed.slice((safePage - 1) * filter.pageSize, safePage * filter.pageSize);

  return (
    <PageTransition effect="slide-left">
      <ResponsiveLayout>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold mb-1">{t.workOrders.title}</h1>
            <p className="text-muted-foreground text-sm">{t.workOrders.subtitle || "Production floor management"}</p>
          </div>
          <div className="flex gap-2">
            {orders.length > 0 && isAdmin && (
              <Button onClick={() => actions.setIsClearDialogOpen(true)} variant="outline">
                <Trash2 className="w-4 h-4 mr-2" /> {t.workOrders.clearAll || "Clear all"}
              </Button>
            )}
            {canEdit && (
              <Button
                onClick={() => actions.setIsNewOrderModalOpen(true)}
                disabled={limits.work_orders.isAtLimit}
                title={limits.work_orders.isAtLimit ? t.workOrders.limitReached : undefined}
              >
                <Plus className="w-4 h-4 mr-2" /> {t.workOrders.addOrder}
              </Button>
            )}
          </div>
        </div>

        <PlanLimitBanner entity="work_orders" />

        {orders.length === 0 && !isLoading ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">{t.workOrders.noOrdersYet || "No work orders yet"}</h3>
            <p className="text-muted-foreground mb-4">{t.workOrders.createFirstOrder || "Create your first production order"}</p>
            {canEdit && (
              <Button onClick={() => actions.setIsNewOrderModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> {t.workOrders.addOrder}
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.workOrders.searchPlaceholder || "Search by client or project..."}
                  value={filter.search}
                  onChange={e => { filter.setSearch(e.target.value); filter.setPage(1); }}
                  className="pl-9 pr-8"
                />
                {filter.search && (
                  <button onClick={() => filter.setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Select value={filter.statusFilter} onValueChange={v => { filter.setStatusFilter(v); filter.setPage(1); }}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
                </Select>
                <Select value={filter.assigneeFilter} onValueChange={v => { filter.setAssigneeFilter(v); filter.setPage(1); }}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder={t.workOrders.assignee || "Assignee"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.workOrders.allAssignees || "All Assignees"}</SelectItem>
                    {teamMembers.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex rounded-lg border border-border/50 overflow-hidden ml-auto">
                  <button
                    onClick={() => setView("cards")}
                    className={`p-2 transition-colors ${view === "cards" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`p-2 transition-colors ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {view === "cards" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map((order, i) => (
                  <WorkOrderCard
                    key={order.id}
                    order={order}
                    index={i}
                    assigneeName={order.assignedToUserId ? profileMap[order.assignedToUserId] : undefined}
                    canDelete={canDelete}
                    canEdit={canEdit}
                    onOpen={(o) => actions.setSheetOrder(o)}
                    onGeneratePOI={actions.generatePOIToken}
                    onPrintSheet={(o) => actions.setSheetOrder(o)}
                    onDelete={(id) => actions.setDeleteConfirmId(id)}
                  />
                ))}
              </div>
            ) : (
              <WorkOrdersTableView
                orders={paginated}
                profileMap={profileMap}
                canEdit={canEdit}
                canDelete={canDelete}
                onMarkBuilt={(id) => actions.setCompleteConfirmId(id)}
                onDelete={(id) => actions.setDeleteConfirmId(id)}
                onEdit={(o) => { actions.setEditOrder(o); actions.setEditOrderMode(true); }}
                onOpen={(o) => actions.setSheetOrder(o)}
                onGeneratePOI={actions.generatePOIToken}
              />
            )}
            <WorkOrdersPagination
              currentPage={safePage}
              totalItems={filter.processed.length}
              pageSize={filter.pageSize}
              onPageChange={filter.setPage}
              onPageSizeChange={s => { filter.setPageSize(s); filter.setPage(1); }}
            />
          </>
        )}

        <NewWorkOrderModal isOpen={actions.isNewOrderModalOpen} onClose={() => actions.setIsNewOrderModalOpen(false)} />
        <EditWorkOrderModal
          order={actions.editOrder}
          isOpen={!!actions.editOrder}
          onClose={() => actions.setEditOrder(null)}
          startInEditMode={actions.editOrderMode}
        />
        <ProductionSheetModal
          order={actions.sheetOrder}
          isOpen={!!actions.sheetOrder}
          onClose={() => actions.setSheetOrder(null)}
          onRefreshOrder={refreshOrders}
        />

        <AlertDialog open={actions.isClearDialogOpen} onOpenChange={actions.setIsClearDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.workOrders.clearDialogTitle || "Clear all work orders?"}</AlertDialogTitle>
              <AlertDialogDescription>{t.workOrders.clearDialogDesc || "This action cannot be undone."}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={actions.handleClearOrders} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t.workOrders.clearAll || "Clear all"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!actions.completeConfirmId} onOpenChange={(open) => { if (!open) actions.setCompleteConfirmId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.workOrders.markCompleteDialogTitle || "Mark this order as completed?"}</AlertDialogTitle>
              <AlertDialogDescription>{t.workOrders.markCompleteDialogDesc || "This action cannot be undone."}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={actions.confirmMarkCompleted}>{t.common.confirm}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!actions.deleteConfirmId} onOpenChange={(open) => { if (!open) actions.setDeleteConfirmId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.workOrders.deleteDialogTitle || "Delete this work order?"}</AlertDialogTitle>
              <AlertDialogDescription>{t.workOrders.deleteDialogDesc || "This action is permanent."}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={actions.confirmDeleteSingle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t.common.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ResponsiveLayout>
    </PageTransition>
  );
};

export default WorkOrders;
