import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InstallerCompaniesService, InstallerCompanyInsert, InstallerCompanyUpdate } from '@/services/installer-companies.service';
import { toast } from 'sonner';

export const useInstallerCompaniesQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const installerCompaniesQuery = useQuery({
    queryKey: ['installer-companies', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await InstallerCompaniesService.getAll(companyId);
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        contact: item.contact,
        email: item.email,
        logoUrl: item.logo_url,
        services: item.services || [],
      }));
    },
    enabled: !!companyId,
  });

  const createInstallerCompanyMutation = useMutation({
    mutationFn: (newCompany: InstallerCompanyInsert) => InstallerCompaniesService.create(newCompany),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installer-companies', companyId] });
      toast.success('Empresa instaladora creada correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al crear la empresa instaladora: ' + error.message);
    },
  });

  const updateInstallerCompanyMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: InstallerCompanyUpdate }) => 
      InstallerCompaniesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installer-companies', companyId] });
      toast.success('Empresa instaladora actualizada correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar la empresa instaladora: ' + error.message);
    },
  });

  const deleteInstallerCompanyMutation = useMutation({
    mutationFn: (id: string) => InstallerCompaniesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installer-companies', companyId] });
      toast.success('Empresa instaladora eliminada correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar la empresa instaladora: ' + error.message);
    },
  });

  return {
    installerCompanies: installerCompaniesQuery.data || [],
    isLoading: installerCompaniesQuery.isLoading,
    installerCompaniesQuery,
    createInstallerCompanyMutation,
    updateInstallerCompanyMutation,
    deleteInstallerCompanyMutation,
  };
};
