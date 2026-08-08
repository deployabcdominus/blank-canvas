import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InstallationsService, InstallationInsert, InstallationUpdate } from '@/services/installations.service';
import { mapInstallationRow } from '@/lib/mappings';
import { toast } from 'sonner';

export const useInstallationsQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const installationsQuery = useQuery({
    queryKey: ['installations', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await InstallationsService.getAll(companyId);
      if (error) throw error;
      return (data || []).map(mapInstallationRow);
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
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['installations', companyId] });
      const previous = queryClient.getQueryData(['installations', companyId]);
      queryClient.setQueryData(['installations', companyId], (old: any[] | undefined) => 
        old?.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      return { previous };
    },
    onError: (error: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['installations', companyId], context.previous);
      }
      toast.error('Error al actualizar la ejecución: ' + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['installations', companyId] });
    },
    onSuccess: () => {
      toast.success('Ejecución actualizada correctamente');
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