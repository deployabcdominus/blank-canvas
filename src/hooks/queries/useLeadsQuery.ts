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
      
      // Map to local Lead interface if needed, but LeadsService.getAll should return what we need
      return (data || []).map(item => {
        const client = (item as any).clients;
        const hasClient = !!client && !!item.client_id;
        
        return {
          id: item.id,
          name: hasClient ? (client.contact_name || client.client_name || item.name) : item.name,
          company: hasClient ? (client.client_name || item.company || '') : (item.company || ''),
          service: item.service || '',
          status: item.status || 'Nuevo',
          contact: {
            phone: hasClient ? (client.primary_phone || item.phone || '') : (item.phone || ''),
            email: hasClient ? (client.primary_email || item.email || '') : (item.email || ''),
            location: hasClient ? (client.address || item.location || '') : (item.location || ''),
          },
          value: item.value || '',
          daysAgo: Math.floor((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24)),
          source: item.source || undefined,
          notes: item.notes || undefined,
          website: hasClient ? (client.website || item.website || undefined) : (item.website || undefined),
          logoUrl: hasClient ? (client.logo_url || item.logo_url || undefined) : (item.logo_url || undefined),
          companyId: item.company_id || undefined,
          createdByUserId: item.created_by_user_id || undefined,
          assignedToUserId: item.assigned_to_user_id || undefined,
          clientId: item.client_id || undefined,
          projectId: item.project_id || undefined,
        };
      });
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
