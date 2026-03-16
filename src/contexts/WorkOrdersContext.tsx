import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logAudit } from '@/lib/audit';

export interface WorkOrder {
  id: string;
  client: string;
  project: string;
  serviceType: string;
  status: string;
  progress: number;
  materials: Array<{
    item: string;
    quantity: string;
    status: string;
  }>;
  startDate: string;
  estimatedCompletion: string;
  companyId: string | null;
  ownerUserId: string | null;
  projectId: string | null;
  proposalId?: string | null;
  notes?: string | null;
  priority?: string | null;
  estimatedDelivery?: string | null;
  assignedToUserId?: string | null;
  installerCompanyId?: string | null;
  blueprintUrl?: string | null;
  annotations?: any[];
  technicalDetails?: Record<string, any>;
}

// Backward-compatible alias
export type ProductionOrder = WorkOrder;

interface WorkOrdersContextType {
  orders: WorkOrder[];
  loading: boolean;
  addOrder: (order: Omit<WorkOrder, 'id' | 'companyId' | 'ownerUserId'>) => Promise<void>;
  updateOrder: (id: string, updates: Partial<WorkOrder>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  getAvailableForInstallation: () => WorkOrder[];
  clearOrders: () => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const WorkOrdersContext = createContext<WorkOrdersContextType | undefined>(undefined);

export const useWorkOrders = () => {
  const context = useContext(WorkOrdersContext);
  if (!context) {
    throw new Error('useWorkOrders must be used within a WorkOrdersProvider');
  }
  return context;
};

// Backward-compatible alias
export const useProductionOrders = useWorkOrders;

// Map DB statuses to new generic statuses
const STATUS_MAP_FROM_DB: Record<string, string> = {
  'Aguardando Início': 'Pendiente',
  'Materiales Pedidos': 'Pendiente',
  'En Producción': 'En Progreso',
  'Control de Calidad': 'Control de Calidad',
  'Producido': 'Completada',
};

const STATUS_MAP_TO_DB: Record<string, string> = {
  'Pendiente': 'Pendiente',
  'En Progreso': 'En Progreso',
  'Control de Calidad': 'Control de Calidad',
  'Completada': 'Completada',
};

const mapRow = (row: any): WorkOrder => ({
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
  technicalDetails: (row as any).technical_details || {},
});

export const WorkOrdersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const getCompanyId = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('company_id').eq('id', user.id).maybeSingle();
    if (data?.company_id) return data.company_id;
    const { data: comp } = await supabase.from('companies').select('id').eq('user_id', user.id).maybeSingle();
    if (comp?.id) {
      await supabase.from('profiles').update({ company_id: comp.id }).eq('id', user.id);
      return comp.id;
    }
    return null;
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (!user) { setOrders([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('production_orders')
      .select('id, client, project, status, progress, materials, start_date, end_date, company_id, owner_user_id, project_id, notes, priority, estimated_delivery, assigned_to_user_id, installer_company_id, blueprint_url, annotations, technical_details, created_at')
      .order('created_at', { ascending: false });
    if (error) console.error('Error loading work orders:', error);
    else setOrders((data || []).map(mapRow));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const addOrder = async (order: Omit<WorkOrder, 'id' | 'companyId' | 'ownerUserId'>) => {
    if (!user) throw new Error('Not authenticated');
    const companyId = await getCompanyId();
    const { data, error } = await supabase.from('production_orders').insert({
      user_id: user.id,
      company_id: companyId,
      owner_user_id: user.id,
      client: order.client,
      project: order.project,
      status: STATUS_MAP_TO_DB[order.status] || order.status,
      progress: order.progress,
      materials: order.materials as any,
      start_date: order.startDate || new Date().toISOString(),
      end_date: order.estimatedCompletion || null,
      estimated_delivery: order.estimatedDelivery || null,
      project_id: order.projectId || null,
      notes: order.notes || null,
      priority: order.priority || 'media',
      proposal_id: order.proposalId || null,
      assigned_to_user_id: order.assignedToUserId || null,
      installer_company_id: order.installerCompanyId || null,
    }).select().single();
    if (error) throw error;
    logAudit({ action: 'creado', entityType: 'orden_produccion', entityId: data?.id, entityLabel: order.client });
    await fetchOrders();
  };

  const updateOrder = async (id: string, updates: Partial<WorkOrder>) => {
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = STATUS_MAP_TO_DB[updates.status] || updates.status;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.materials !== undefined) dbUpdates.materials = updates.materials;
    if (updates.client !== undefined) dbUpdates.client = updates.client;
    if (updates.project !== undefined) dbUpdates.project = updates.project;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.estimatedCompletion !== undefined) dbUpdates.end_date = updates.estimatedCompletion;
    if (updates.estimatedDelivery !== undefined) dbUpdates.estimated_delivery = updates.estimatedDelivery;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.assignedToUserId !== undefined) dbUpdates.assigned_to_user_id = updates.assignedToUserId;
    if (updates.installerCompanyId !== undefined) dbUpdates.installer_company_id = updates.installerCompanyId;
    if (updates.blueprintUrl !== undefined) dbUpdates.blueprint_url = updates.blueprintUrl;
    if (updates.annotations !== undefined) dbUpdates.annotations = updates.annotations;
    if (updates.technicalDetails !== undefined) dbUpdates.technical_details = updates.technicalDetails;
    const { error } = await supabase.from('production_orders').update(dbUpdates as any).eq('id', id);
    if (error) throw error;
    const order = orders.find(o => o.id === id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    const auditAction = updates.status ? 'cambio_estado' as const : 'editado' as const;
    logAudit({ action: auditAction, entityType: 'orden_produccion', entityId: id, entityLabel: order?.client, details: updates.status ? { before: order?.status, after: updates.status } : dbUpdates });
  };

  const deleteOrder = async (id: string) => {
    const order = orders.find(o => o.id === id);
    const { error } = await supabase.from('production_orders').delete().eq('id', id);
    if (error) throw error;
    setOrders(prev => prev.filter(o => o.id !== id));
    logAudit({ action: 'eliminado', entityType: 'orden_produccion', entityId: id, entityLabel: order?.client });
  };

  const getAvailableForInstallation = () => {
    return orders.filter(order =>
      order.status === "En Progreso" || order.status === "Completada"
    );
  };

  const clearOrders = async () => {
    const companyId = await getCompanyId();
    if (companyId) {
      const { error } = await supabase.from('production_orders').delete().eq('company_id', companyId);
      if (error) throw error;
    }
    setOrders([]);
  };

  return (
    <WorkOrdersContext.Provider value={{
      orders,
      loading,
      addOrder,
      updateOrder,
      deleteOrder,
      getAvailableForInstallation,
      clearOrders,
      refreshOrders: fetchOrders,
    }}>
      {children}
    </WorkOrdersContext.Provider>
  );
};

// Backward-compatible alias
export const ProductionOrdersProvider = WorkOrdersProvider;
