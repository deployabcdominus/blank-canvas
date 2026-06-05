import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InstallationsService, InstallationInsert, InstallationUpdate } from '@/services/installations.service';

export interface Installation {
  id: string;
  client: string;
  project: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Installer Assigned" | "Completed Pending Review" | "Needs Follow-up" | "Canceled";
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  technician: string;
  notes: string;
  projectId: string | null;
  photos: string[];
  installer_company_id: string | null;
  assigned_installer_id: string | null;
  installation_address: string | null;
  installation_time_window: string | null;
  site_contact_name: string | null;
  site_contact_phone: string | null;
  access_notes: string | null;
  parking_notes: string | null;
  installation_notes: string | null;
  special_instructions: string | null;
  required_tools_or_equipment: string | null;
  permit_required: boolean | null;
  customer_presence_required: boolean | null;
  completed_at: string | null;
  confirmed_at: string | null;
  confirmed_by_admin_id: string | null;
  confirmation_notes: string | null;
}


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
        status: item.status as "Scheduled" | "In Progress" | "Completed" | "Installer Assigned" | "Completed Pending Review" | "Needs Follow-up" | "Canceled",
        address: item.location || '',
        scheduledDate: item.scheduled_date ? new Date(item.scheduled_date).toISOString().split('T')[0] : '',
        scheduledTime: item.scheduled_date ? new Date(item.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        technician: item.team || '',
        notes: item.notes || '',
        projectId: item.project_id,
        photos: item.photos || [],
        installer_company_id: item.installer_company_id,
        assigned_installer_id: item.assigned_installer_id,
        installation_address: item.installation_address,
        installation_time_window: item.installation_time_window,
        site_contact_name: item.site_contact_name,
        site_contact_phone: item.site_contact_phone,
        access_notes: item.access_notes,
        parking_notes: item.parking_notes,
        installation_notes: item.installation_notes,
        special_instructions: item.special_instructions,
        required_tools_or_equipment: item.required_tools_or_equipment,
        permit_required: item.permit_required,
        customer_presence_required: item.customer_presence_required,
        completed_at: item.completed_at,
        confirmed_at: item.confirmed_at,
        confirmed_by_admin_id: item.confirmed_by_admin_id,
        confirmation_notes: item.confirmation_notes,
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
