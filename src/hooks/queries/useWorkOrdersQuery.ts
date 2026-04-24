import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkOrdersService, WorkOrderInsert, WorkOrderUpdate } from '@/services/work-orders.service';
import { toast } from 'sonner';

export const useWorkOrdersQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const workOrdersQuery = useQuery({
    queryKey: ['work-orders', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await WorkOrdersService.getAll(companyId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

  const createWorkOrderMutation = useMutation({
    mutationFn: (newOrder: WorkOrderInsert) => WorkOrdersService.create(newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', companyId] });
      toast.success('Orden de trabajo creada');
    },
    onError: (error: any) => {
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
    onError: (error: any) => {
      toast.error('Error al actualizar la orden: ' + error.message);
    },
  });

  const deleteWorkOrderMutation = useMutation({
    mutationFn: (id: string) => WorkOrdersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', companyId] });
      toast.success('Orden de trabajo eliminada');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar la orden: ' + error.message);
    },
  });

  return {
    orders: workOrdersQuery.data || [],
    isLoading: workOrdersQuery.isLoading,
    workOrdersQuery,
    createWorkOrderMutation,
    updateWorkOrderMutation,
    deleteWorkOrderMutation,
  };
};
