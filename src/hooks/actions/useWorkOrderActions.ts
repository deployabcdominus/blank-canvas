
import { useState, useCallback } from 'react';
import { WorkOrder } from '@/types/domain';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWorkOrderActions = (
  companyId: string | null,
  mutations: {
    updateWorkOrderMutation: any;
    deleteWorkOrderMutation: any;
    clearWorkOrdersMutation: any;
  }
) => {
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [completeConfirmId, setCompleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editOrder, setEditOrder] = useState<WorkOrder | null>(null);
  const [editOrderMode, setEditOrderMode] = useState(false);
  const [sheetOrder, setSheetOrder] = useState<WorkOrder | null>(null);

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
      })
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
      await mutations.updateWorkOrderMutation.mutateAsync({ id: completeConfirmId, updates: { status: "Completada", progress: 100 } });
      toast.success("Order marked as completed");
    } catch {
      toast.error("Could not complete order");
    }
    setCompleteConfirmId(null);
  };

  const confirmDeleteSingle = async () => {
    if (!deleteConfirmId) return;
    try {
      await mutations.deleteWorkOrderMutation.mutateAsync(deleteConfirmId);
      toast.success("Order deleted");
    } catch {
      toast.error("Could not delete order");
    }
    setDeleteConfirmId(null);
  };

  const handleClearOrders = () => {
    if (companyId) mutations.clearWorkOrdersMutation.mutate(companyId);
    setIsClearDialogOpen(false);
    toast.success("All orders cleared");
  };

  return {
    isNewOrderModalOpen, setIsNewOrderModalOpen,
    isClearDialogOpen, setIsClearDialogOpen,
    completeConfirmId, setCompleteConfirmId,
    deleteConfirmId, setDeleteConfirmId,
    editOrder, setEditOrder,
    editOrderMode, setEditOrderMode,
    sheetOrder, setSheetOrder,
    generatePOIToken,
    confirmMarkCompleted,
    confirmDeleteSingle,
    handleClearOrders
  };
};
