import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeadsService, LeadInsert, LeadUpdate } from '@/services/leads.service';
import { toast } from 'sonner';

export const useLeadsQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: ['leads', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await LeadsService.getAll(companyId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', companyId] });
      toast.success('Lead actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar el lead: ' + error.message);
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => LeadsService.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', companyId] });
      toast.success('Lead enviado a la papelera');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar el lead: ' + error.message);
    },
  });

  return {
    leads: leadsQuery.data || [],
    isLoading: leadsQuery.isLoading,
    leadsQuery,
    createLeadMutation,
    updateLeadMutation,
    deleteLeadMutation,
  };
};
