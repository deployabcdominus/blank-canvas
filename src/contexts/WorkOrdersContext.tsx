import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resolveCompanyId } from '@/lib/resolve-company';
import { WorkOrdersService, WorkOrderRow, WorkOrderUpdate } from '@/services/work-orders.service';

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
  // Production Sheet fields
  face_material_spec?: string;
  returns_material_spec?: string;
  backs_material_spec?: string;
  trim_cap_spec?: string;
  led_mfg_spec?: string;
  power_supply_spec?: string;
  responsible_staff?: any;
  qc_checklist?: any;
  wo_number?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  site_address?: string;
  project_name?: string;
  // POI & QC fields
  poi_token_used?: boolean;
  poi_completed_at?: string | null;
  qc_signature_url?: string | null;
  product_type?: string | null;
  // Design workspace fields
  mockup_urls?: string[];
  design_notes?: string;
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

const mapRow = (row: WorkOrderRow): WorkOrder => ({
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
  // Production Sheet fields
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
  // POI & QC fields
  poi_token_used: row.poi_token_used || false,
  poi_completed_at: row.poi_completed_at || null,
  qc_signature_url: row.qc_signature_url || null,
  product_type: row.product_type || null,
  // Design workspace fields
  mockup_urls: Array.isArray(row.mockup_urls) ? row.mockup_urls : [],
  design_notes: row.design_notes || '',
});

export const WorkOrdersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const getCompanyId = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    return resolveCompanyId(user.id);
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (!user) { setOrders([]); setLoading(false); return; }
    
    const companyId = await resolveCompanyId(user.id);
    if (!companyId) return;

    const { data, error } = await WorkOrdersService.getAll(companyId);
    
    if (error) console.error('Error loading work orders:', error);
    else setOrders((data || []).map(mapRow));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const addOrder = async (order: Omit<WorkOrder, 'id' | 'companyId' | 'ownerUserId'>) => {
    if (!user) throw new Error('Not authenticated');
    const companyId = await getCompanyId();
    if (!companyId) return;

    const { error } = await WorkOrdersService.create({
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
    });

    if (error) throw error;
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
    
    const { error } = await WorkOrdersService.update(id, dbUpdates as any);
    if (error) throw error;
    
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteOrder = async (id: string) => {
    const { error } = await WorkOrdersService.delete(id);
    if (error) throw error;
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const getAvailableForInstallation = () => {
    return orders.filter(order =>
      order.status === "En Progreso" || order.status === "Completada"
    );
  };

  const clearOrders = async () => {
    const companyId = await getCompanyId();
    if (companyId) {
      const { error } = await WorkOrdersService.deleteByCompany(companyId);
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
