import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeadsService, LeadInsert, LeadUpdate } from '@/services/leads.service';
import { toast } from 'sonner';
import { logAudit } from '@/lib/audit';

export interface Lead {
  id: string;
  name: string;
  company: string;
  service: string;
  status: string;
  contact: {
    phone: string;
    email: string;
    location: string;
  };
  value: string;
  daysAgo: number;
  source?: string;
  notes?: string;
  website?: string;
  logoUrl?: string;
  companyId?: string;
  createdByUserId?: string;
  assignedToUserId?: string;
  clientId?: string;
  projectId?: string;
  resolvedName?: string;
  resolvedCompany?: string;
}

const mapRow = (item: any): Lead => {
  const client = item.clients;
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
    resolvedName: hasClient ? (client.contact_name || client.client_name) : undefined,
    resolvedCompany: hasClient ? client.client_name : undefined,
  };
};

export const useLeadsQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: ['leads', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await LeadsService.getAll(companyId);
      if (error) throw error;
      return (data || []).map(mapRow);
    },
    enabled: !!companyId,
  });

  const createLeadMutation = useMutation({
    mutationFn: (newLead: LeadInsert) => LeadsService.create(newLead),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads', companyId] });
      const mapped = mapRow(data.data);
      logAudit({ action: 'creado', entityType: 'lead', entityId: mapped.id, entityLabel: mapped.name });
      toast.success('Lead creado correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al crear el lead: ' + error.message);
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: LeadUpdate }) => 
      LeadsService.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads', companyId] });
      const mapped = mapRow(data.data);
      const auditAction = variables.updates.status ? 'cambio_estado' as const : 'editado' as const;
      logAudit({ 
        action: auditAction, 
        entityType: 'lead', 
        entityId: mapped.id, 
        entityLabel: mapped.name,
        details: variables.updates 
      });
      toast.success('Lead actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar el lead: ' + error.message);
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => LeadsService.softDelete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['leads', companyId] });
      const lead = leadsQuery.data?.find(l => l.id === id);
      logAudit({ action: 'eliminado', entityType: 'lead', entityId: id, entityLabel: lead?.name });
      toast.success('Lead enviado a la papelera');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar el lead: ' + error.message);
    },
  });

  const deleteLeadsMutation = useMutation({
    mutationFn: (ids: string[]) => LeadsService.softDeleteBatch(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['leads', companyId] });
      logAudit({ action: 'eliminado', entityType: 'lead', entityId: ids[0], entityLabel: `${ids.length} leads`, details: { count: ids.length } });
      toast.success(`${ids.length} leads eliminados`);
    },
    onError: (error: any) => {
      toast.error('Error al eliminar leads: ' + error.message);
    },
  });

  const clearLeadsMutation = useMutation({
    mutationFn: (cid: string) => LeadsService.clearAll(cid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', companyId] });
      toast.success('Todos los leads han sido eliminados');
    },
    onError: (error: any) => {
      toast.error('Error al limpiar leads: ' + error.message);
    },
  });

  const assignLeadMutation = useMutation({
    mutationFn: ({ leadId, assignedToUserId }: { leadId: string; assignedToUserId: string | null }) => 
      LeadsService.update(leadId, { assigned_to_user_id: assignedToUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', companyId] });
      toast.success('Lead asignado correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al asignar lead: ' + error.message);
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
    assignLeadMutation,
  };
};
