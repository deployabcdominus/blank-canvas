import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InstallationsService, InstallationInsert, InstallationUpdate } from '@/services/installations.service';
import { toast } from 'sonner';

export const useInstallationsQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const installationsQuery = useQuery({
    queryKey: ['installations', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await InstallationsService.getAll(companyId);
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        client: item.client,
        project: item.project,
        status: item.status as "Scheduled" | "In Progress" | "Completed",
        address: item.location || '',
        scheduledDate: item.scheduled_date ? new Date(item.scheduled_date).toISOString().split('T')[0] : '',
        scheduledTime: item.scheduled_date ? new Date(item.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        technician: item.team || '',
        notes: item.notes || '',
        projectId: item.project_id,
        photos: item.photos || [],
      }));
    },
    enabled: !!companyId,
  });

  const createInstallationMutation = useMutation({
    mutationFn: (newInstallation: InstallationInsert) => InstallationsService.create(newInstallation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installations', companyId] });
      toast.success('Ejecución agendada correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al agendar la ejecución: ' + error.message);
    },
  });

  const updateInstallationMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: InstallationUpdate }) => 
      InstallationsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installations', companyId] });
      toast.success('Ejecución actualizada correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar la ejecución: ' + error.message);
    },
  });

  const deleteInstallationMutation = useMutation({
    mutationFn: (id: string) => InstallationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installations', companyId] });
      toast.success('Ejecución eliminada correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar la ejecución: ' + error.message);
    },
  });

  const clearInstallationsMutation = useMutation({
    mutationFn: () => {
      if (!companyId) throw new Error('Company ID is required');
      return InstallationsService.clearAll(companyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installations', companyId] });
      toast.success('Todas las ejecuciones han sido eliminadas');
    },
    onError: (error: any) => {
      toast.error('Error al limpiar ejecuciones: ' + error.message);
    },
  });

  return {
    installations: installationsQuery.data || [],
    isLoading: installationsQuery.isLoading,
    installationsQuery,
    createInstallationMutation,
    updateInstallationMutation,
    deleteInstallationMutation,
    clearInstallationsMutation,
  };
};
