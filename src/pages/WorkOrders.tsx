import { useMemo, useState, useEffect, useCallback } from "react";
import { PageTransition } from "@/components/PageTransition";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewWorkOrderModal } from "@/components/NewWorkOrderModal";
import { useWorkOrders, WorkOrder } from "@/contexts/WorkOrdersContext";
import { useUserRole } from "@/hooks/useUserRole";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { PlanLimitBanner } from "@/components/PlanLimitBanner";
import { WorkOrderCard } from "@/components/work-orders/WorkOrderCard";
import { WorkOrdersTableView } from "@/components/work-orders/WorkOrdersTableView";
import { WorkOrdersPagination } from "@/components/work-orders/WorkOrdersPagination";
import { EditWorkOrderModal } from "@/components/work-orders/EditWorkOrderModal";
import { ProductionSheetModal } from "@/components/work-orders/ProductionSheetModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

type ViewMode = "cards" | "list";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "Pendiente", label: "Pending" },
  { value: "En Progreso", label: "In Production" },
  { value: "Control de Calidad", label: "QC" },
  { value: "Completada", label: "Ready" },
  { value: "installed", label: "Installed" },
];

const WorkOrders = () => {
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const { orders, clearOrders, updateOrder, deleteOrder, refreshOrders } = useWorkOrders();
  const { canEdit, canDelete, isAdmin } = useUserRole();
  const limits = usePlanLimits();

  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("cards");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [completeConfirmId, setCompleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editOrder, setEditOrder] = useState<WorkOrder | null>(null);
  const [editOrderMode, setEditOrderMode] = useState(false);
  const [sheetOrder, setSheetOrder] = useState<WorkOrder | null>(null);

  // Resolve assignee names
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
          data.forEach((p: any) => { map[p.id] = p.full_name || "Unknown"; });
          setProfileMap(map);
        }
      });
  }, [assigneeIds]);

  const teamMembers = useMemo(() => {
    return Object.entries(profileMap).map(([id, name]) => ({ id, name }));
  }, [profileMap]);

  const generatePOIToken = useCallback(async (order: WorkOrder) => {
    const token = crypto.randomUUID();
    const exp = new Date();
    exp.setHours(exp.getHours() + 72);
    const { error } = await supabase
      .from("production_orders")
      .update({
        poi_token: token,
        poi_token_exp: exp.toISOString(),
        poi_token_used: false,
      } as any)
      .eq("id", order.id);
    if (error) {
      toast.error("Failed to generate POI link");
      return;
    }
    const url = `${window.location.origin}/poi/${order.id}?token=${token}`;
    await navigator.clipboard.writeText(url);
    toast.success("POI link copied — valid 72 hours");
  }, []);

  const confirmMarkCompleted = async () => {
    if (!completeConfirmId) return;
    try {
      await updateOrder(completeConfirmId, { status: "Completada", progress: 100 });
      toast.success("Order marked as completed");
    } catch {
      toast.error("Could not complete order");
    }
    setCompleteConfirmId(null);
  };

  const confirmDeleteSingle = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteOrder(deleteConfirmId);
      toast.success("Order deleted");
    } catch {
      toast.error("Could not delete order");
    }
    setDeleteConfirmId(null);
  };

  const handleClearOrders = () => {
    clearOrders();
    setIsClearDialogOpen(false);
    toast.success("All orders cleared");
  };

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

  const totalPages = Math.ceil(processed.length / pageSize);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const paginated = processed.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <PageTransition>
      <ResponsiveLayout>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold mb-1">Work Orders</h1>
            <p className="text-muted-foreground text-sm">Production floor management</p>
          </div>
          <div className="flex gap-2">
            {orders.length > 0 && isAdmin && (
              <Button onClick={() => setIsClearDialogOpen(true)} variant="outline">
                <Trash2 className="w-4 h-4 mr-2" /> Clear all
              </Button>
            )}
            {canEdit && (
              <Button
                onClick={() => setIsNewOrderModalOpen(true)}
                disabled={limits.work_orders.isAtLimit}
                title={limits.work_orders.isAtLimit ? "Límite alcanzado — upgrade tu plan" : undefined}
              >
                <Plus className="w-4 h-4 mr-2" /> New Order
              </Button>
            )}
          </div>
        </div>

        <PlanLimitBanner entity="work_orders" />

        {orders.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No work orders yet</h3>
            <p className="text-muted-foreground mb-4">Create your first production order</p>
            {canEdit && (
              <Button onClick={() => setIsNewOrderModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> New Order
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="relative min-w-[200px] max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client or project..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9 pr-8"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={assigneeFilter} onValueChange={v => { setAssigneeFilter(v); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Assignee" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
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

            {view === "cards" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map((order, i) => (
                  <WorkOrderCard
                    key={order.id}
                    order={order}
                    index={i}
                    assigneeName={order.assignedToUserId ? profileMap[order.assignedToUserId] : undefined}
                    canDelete={canDelete}
                    onOpen={(o) => setSheetOrder(o)}
                    onGeneratePOI={generatePOIToken}
                    onPrintSheet={(o) => setSheetOrder(o)}
                    onDelete={(id) => setDeleteConfirmId(id)}
                  />
                ))}
              </div>
            ) : (
              <WorkOrdersTableView
                orders={paginated}
                profileMap={profileMap}
                canEdit={canEdit}
                canDelete={canDelete}
                onMarkBuilt={(id) => setCompleteConfirmId(id)}
                onDelete={(id) => setDeleteConfirmId(id)}
                onEdit={(o) => { setEditOrder(o); setEditOrderMode(true); }}
                onOpen={(o) => setSheetOrder(o)}
                onGeneratePOI={generatePOIToken}
              />
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
        <EditWorkOrderModal
          order={editOrder}
          isOpen={!!editOrder}
          onClose={() => setEditOrder(null)}
          startInEditMode={editOrderMode}
        />
        <ProductionSheetModal
          order={sheetOrder}
          isOpen={!!sheetOrder}
          onClose={() => setSheetOrder(null)}
          onRefreshOrder={refreshOrders}
        />

        {/* Clear ALL */}
        <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all work orders?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearOrders} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Clear all
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Complete confirm */}
        <AlertDialog open={!!completeConfirmId} onOpenChange={(open) => { if (!open) setCompleteConfirmId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark this order as completed?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmMarkCompleted}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete confirm */}
        <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this work order?</AlertDialogTitle>
              <AlertDialogDescription>This action is permanent.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteSingle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ResponsiveLayout>
    </PageTransition>
  );
};

export default WorkOrders;
