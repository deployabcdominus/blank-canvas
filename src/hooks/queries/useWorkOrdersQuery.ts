
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkOrdersService, WorkOrderInsert, WorkOrderUpdate } from '@/services/work-orders.service';
import { toast } from 'sonner';
import { mapWorkOrderRow } from '@/lib/mappings';

export const useWorkOrdersQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const workOrdersQuery = useQuery({
    queryKey: ['work-orders', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await WorkOrdersService.getAll(companyId);
      if (error) throw error;
      return (data || []).map(mapWorkOrderRow);
    },
    enabled: !!companyId,
  });

  const createWorkOrderMutation = useMutation({
    mutationFn: (newOrder: WorkOrderInsert) => WorkOrdersService.create(newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', companyId] });
      toast.success('Orden de trabajo creada');
    },
    onError: (error: Error) => {
      toast.error('Error al crear la orden: ' + error.message);
    },
  });

  const updateWorkOrderMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: WorkOrderUpdate }) => 
      WorkOrdersService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', companyId] });
      toast.success('Orden de trabajo actualizada');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar la orden: ' + error.message);
    },
  });

  const deleteWorkOrderMutation = useMutation({
    mutationFn: (id: string) => WorkOrdersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', companyId] });
      toast.success('Orden de trabajo eliminada');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar la orden: ' + error.message);
    },
  });

  const clearWorkOrdersMutation = useMutation({
    mutationFn: (companyId: string) => WorkOrdersService.clearAll(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', companyId] });
      toast.success('Todas las órdenes de trabajo han sido eliminadas');
    },
    onError: (error: Error) => {
      toast.error('Error al limpiar órdenes: ' + error.message);
    },
  });

  return {
    orders: workOrdersQuery.data || [],
    isLoading: workOrdersQuery.isLoading,
    workOrdersQuery,
    createWorkOrderMutation,
    updateWorkOrderMutation,
    deleteWorkOrderMutation,
    clearWorkOrdersMutation,
  };
};
