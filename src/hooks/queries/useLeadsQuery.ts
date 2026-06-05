
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeadsService, LeadInsert, LeadUpdate } from '@/services/leads.service';
import { toast } from 'sonner';
import { mapLeadRow } from '@/lib/mappings';

export const useLeadsQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: ['leads', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await LeadsService.getAll(companyId);
      if (error) throw error;
      return (data || []).map(mapLeadRow);
    },
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const createLeadMutation = useMutation({
    mutationFn: (newLead: LeadInsert) => LeadsService.create(newLead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', companyId] });
      toast.success('Lead creado correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al crear el lead: ' + error.message);
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: LeadUpdate }) => 
      LeadsService.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['leads', companyId] });
      const previousLeads = queryClient.getQueryData(['leads', companyId]);
      
      queryClient.setQueryData(['leads', companyId], (old: any[] | undefined) => {
        return old?.map(lead => lead.id === id ? { ...lead, ...updates } : lead);
      });
      
      return { previousLeads };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads', companyId], context.previousLeads);
      }
      toast.error('Error al actualizar el lead: ' + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', companyId] });
    },
    onSuccess: () => {
      toast.success('Lead actualizado correctamente');
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => LeadsService.softDelete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['leads', companyId] });
      const previousLeads = queryClient.getQueryData(['leads', companyId]);
      
      queryClient.setQueryData(['leads', companyId], (old: any[] | undefined) => {
        return old?.filter(lead => lead.id !== id);
      });
      
      return { previousLeads };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads', companyId], context.previousLeads);
      }
      toast.error('Error al eliminar el lead: ' + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', companyId] });
    },
    onSuccess: () => {
      toast.success('Lead enviado a la papelera');
    },
  });

  const deleteLeadsMutation = useMutation({
    mutationFn: (ids: string[]) => LeadsService.softDeleteBatch(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', companyId] });
      toast.success('Leads eliminados correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar leads: ' + error.message);
    },
  });

  const clearLeadsMutation = useMutation({
    mutationFn: (companyId: string) => LeadsService.clearAll(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', companyId] });
      toast.success('Todos los leads han sido eliminados');
    },
    onError: (error: any) => {
      toast.error('Error al limpiar leads: ' + error.message);
    },
  });

  return {
    leads: leadsQuery.data || [],
    isLoading: leadsQuery.isLoading,
    leadsQuery,
    createLeadMutation,
    updateLeadMutation,
    deleteLeadMutation,
    deleteLeadsMutation,
    clearLeadsMutation,
  };
};
