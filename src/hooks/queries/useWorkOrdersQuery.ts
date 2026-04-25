import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkOrdersService, WorkOrderInsert, WorkOrderUpdate } from '@/services/work-orders.service';
import { toast } from 'sonner';

// Map DB statuses to new generic statuses
const STATUS_MAP_FROM_DB: Record<string, string> = {
  'Aguardando Início': 'Pendiente',
  'Materiales Pedidos': 'Pendiente',
  'En Producción': 'En Progreso',
  'Control de Calidad': 'Control de Calidad',
  'Producido': 'Completada',
};

const mapRow = (row: any) => ({
  id: row.id,
  client: row.client,
  project: row.project,
  serviceType: '',
  status: STATUS_MAP_FROM_DB[row.status] || row.status || 'Pendiente',
  progress: row.progress || 0,
  materials: Array.isArray(row.materials) ? row.materials : [],
  startDate: row.start_date ? new Date(row.start_date).toISOString().split('T')[0] : '',
  estimatedCompletion: row.end_date ? new Date(row.end_date).toISOString().split('T')[0] : '',
  companyId: row.company_id,
  ownerUserId: row.owner_user_id,
  projectId: row.project_id,
  proposalId: row.proposal_id || null,
  notes: row.notes || null,
  priority: row.priority || 'media',
  estimatedDelivery: row.estimated_delivery || null,
  assignedToUserId: row.assigned_to_user_id || null,
  installerCompanyId: row.installer_company_id || null,
  blueprintUrl: row.blueprint_url || null,
  annotations: Array.isArray(row.annotations) ? row.annotations : [],
  technicalDetails: row.technical_details || {},
  face_material_spec: row.face_material_spec || '',
  returns_material_spec: row.returns_material_spec || '',
  backs_material_spec: row.backs_material_spec || '',
  trim_cap_spec: row.trim_cap_spec || '',
  led_mfg_spec: row.led_mfg_spec || '',
  power_supply_spec: row.power_supply_spec || '',
  responsible_staff: row.responsible_staff || null,
  qc_checklist: row.qc_checklist || null,
  wo_number: row.wo_number || null,
  contact_name: row.contact_name || '',
  contact_phone: row.contact_phone || '',
  contact_email: row.contact_email || '',
  site_address: row.site_address || '',
  project_name: row.project_name || '',
  poi_token_used: row.poi_token_used || false,
  poi_completed_at: row.poi_completed_at || null,
  qc_signature_url: row.qc_signature_url || null,
  product_type: row.product_type || null,
  mockup_urls: Array.isArray(row.mockup_urls) ? row.mockup_urls : [],
  design_notes: row.design_notes || '',
});

export const useWorkOrdersQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const workOrdersQuery = useQuery({
    queryKey: ['work-orders', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await WorkOrdersService.getAll(companyId);
      if (error) throw error;
      return (data || []).map(mapRow);
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

  const clearWorkOrdersMutation = useMutation({
    mutationFn: (companyId: string) => WorkOrdersService.deleteByCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', companyId] });
      toast.success('Todas las órdenes de trabajo han sido eliminadas');
    },
    onError: (error: any) => {
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
