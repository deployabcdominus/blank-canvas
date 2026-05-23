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
  // Phase 2: Production Workflow Fields
  internal_status?: string;
  prepared_by_department?: 'Design' | 'Sales' | 'Admin';
  design_review_required?: boolean;
  design_review_completed?: boolean;
  final_width?: number;
  final_height?: number;
  measurement_unit?: string;
  single_or_double_sided?: string;
  indoor_or_outdoor?: string;
  illuminated_or_non?: string;
  substrate_material?: string;
  frame_material?: string;
  mounting_method?: string;
  installation_surface?: string;
  electrical_required?: boolean;
  permit_required?: boolean;
  fabrication_notes?: string;
  production_warnings?: string;
  vinyl_required?: boolean;
  vinyl_brand?: string;
  vinyl_color?: string;
  vinyl_finish?: string;
  vinyl_notes?: string;
  print_required?: boolean;
  print_material?: string;
  print_quality?: string;
  laminate_required?: boolean;
  laminate_type?: string;
  print_notes?: string;
  cutting_required?: boolean;
  cnc_required?: boolean;
  welding_required?: boolean;
  painting_required?: boolean;
  painting_color?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  // Phase 4: Project Closing & Financials
  client_acceptance_required?: boolean;
  client_accepted?: boolean;
  client_acceptance_date?: string;
  client_acceptance_method?: string;
  client_acceptance_notes?: string;
  accepted_by_client_name?: string;
  final_balance_due?: number;
  final_payment_required?: boolean;
  final_payment_received?: boolean;
  final_payment_amount?: number;
  final_payment_date?: string;
  final_payment_method?: string;
  final_payment_reference?: string;
  closing_status?: string;
  closed_at?: string;
  closed_by_user_id?: string;
  closing_notes?: string;
  closeout_checklist_completed?: boolean;
  closing_checklist?: Record<string, boolean>;
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

// Internal statuses for workshop flow
export const PRODUCTION_STATUSES = [
  'Draft',
  'Waiting for Design Details',
  'Ready for Production',
  'In Production',
  'Waiting for Materials',
  'On Hold',
  'Quality Check',
  'Ready for Install',
  'Completed',
  'Canceled'
] as const;

export type ProductionStatus = typeof PRODUCTION_STATUSES[number];

// Map legacy DB statuses to new statuses for display
const STATUS_MAP_FROM_DB: Record<string, string> = {
  'Aguardando Início': 'Ready for Production',
  'Materiales Pedidos': 'Waiting for Materials',
  'En Producción': 'In Production',
  'En Progreso': 'In Production',
  'Control de Calidad': 'Quality Check',
  'Producido': 'Completed',
};

// Keep DB compatible for now while we transition
const STATUS_MAP_TO_DB: Record<string, string> = {
  'Ready for Production': 'Pendiente',
  'In Production': 'En Progreso',
  'Quality Check': 'Control de Calidad',
  'Completed': 'Completada',
};

const mapRow = (row: WorkOrderRow): WorkOrder => ({
  id: row.id,
  client: row.client,
  project: row.project || '',
  serviceType: '',
  status: row.status ? (STATUS_MAP_FROM_DB[row.status] || row.status) : 'Pendiente',
  progress: row.progress || 0,
  materials: Array.isArray(row.materials) ? (row.materials as any[]) : [],
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
  annotations: Array.isArray(row.annotations) ? (row.annotations as any[]) : [],
  technicalDetails: (row.technical_details as Record<string, any>) || {},
  // Production Sheet fields
  face_material_spec: row.face_material_spec || (row.technical_details as any)?.face_material || '',
  substrate_material: row.substrate_material || (row.technical_details as any)?.substrate || '',
  final_width: row.final_width || (row.technical_details as any)?.final_width || undefined,
  final_height: row.final_height || (row.technical_details as any)?.final_height || undefined,
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
  mockup_urls: Array.isArray(row.mockup_urls) ? (row.mockup_urls as string[]) : [],
  design_notes: row.design_notes || '',
  internal_status: row.internal_status || 'Draft',
  prepared_by_department: (row.prepared_by_department as any) || 'Sales',
  design_review_required: row.design_review_required || false,
  design_review_completed: row.design_review_completed || false,
  measurement_unit: row.measurement_unit || 'in',
  single_or_double_sided: row.single_or_double_sided || 'Single',
  indoor_or_outdoor: row.indoor_or_outdoor || 'Outdoor',
  illuminated_or_non: row.illuminated_or_non || 'Non-Illuminated',
  frame_material: row.frame_material || '',
  mounting_method: row.mounting_method || '',
  installation_surface: row.installation_surface || '',
  electrical_required: row.electrical_required || false,
  permit_required: row.permit_required || false,
  fabrication_notes: row.fabrication_notes || '',
  production_warnings: row.production_warnings || '',
  vinyl_required: row.vinyl_required || false,
  vinyl_brand: row.vinyl_brand || '',
  vinyl_color: row.vinyl_color || '',
  vinyl_finish: row.vinyl_finish || '',
  vinyl_notes: row.vinyl_notes || '',
  print_required: row.print_required || false,
  print_material: row.print_material || '',
  print_quality: row.print_quality || '',
  laminate_required: row.laminate_required || false,
  laminate_type: row.laminate_type || '',
  print_notes: row.print_notes || '',
  cutting_required: row.cutting_required || false,
  cnc_required: row.cnc_required || false,
  welding_required: row.welding_required || false,
  painting_required: row.painting_required || false,
  painting_color: row.painting_color || '',
  target_completion_date: row.target_completion_date || null,
  actual_completion_date: row.actual_completion_date || null,
  client_acceptance_required: row.client_acceptance_required ?? true,
  client_accepted: row.client_accepted || false,
  client_acceptance_date: row.client_acceptance_date || null,
  client_acceptance_method: row.client_acceptance_method || '',
  client_acceptance_notes: row.client_acceptance_notes || '',
  accepted_by_client_name: row.accepted_by_client_name || '',
  final_balance_due: row.final_balance_due || 0,
  final_payment_required: row.final_payment_required ?? true,
  final_payment_received: row.final_payment_received || false,
  final_payment_amount: row.final_payment_amount || 0,
  final_payment_date: row.final_payment_date || null,
  final_payment_method: row.final_payment_method || '',
  final_payment_reference: row.final_payment_reference || '',
  closing_status: row.closing_status || 'Not Ready',
  closed_at: row.closed_at || null,
  closed_by_user_id: row.closed_by_user_id || null,
  closing_notes: row.closing_notes || '',
  closeout_checklist_completed: row.closeout_checklist_completed || false,
  closing_checklist: (row.closing_checklist as Record<string, boolean>) || {},
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
    const dbUpdates: WorkOrderUpdate = {};
    if (updates.status !== undefined) dbUpdates.status = STATUS_MAP_TO_DB[updates.status] || updates.status;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.materials !== undefined) dbUpdates.materials = updates.materials as any;
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
    if (updates.annotations !== undefined) dbUpdates.annotations = updates.annotations as any;
    if (updates.technicalDetails !== undefined) {
      dbUpdates.technical_details = updates.technicalDetails as any;
      // Sync signage specific fields from JSONB back to columns if they exist
      if (updates.technicalDetails.final_width) dbUpdates.final_width = Number(updates.technicalDetails.final_width);
      if (updates.technicalDetails.final_height) dbUpdates.final_height = Number(updates.technicalDetails.final_height);
      if (updates.technicalDetails.substrate) dbUpdates.substrate_material = String(updates.technicalDetails.substrate);
      if (updates.technicalDetails.face_material) dbUpdates.face_material_spec = String(updates.technicalDetails.face_material);
    }
    
    // Phase 2 mappings
    if (updates.internal_status !== undefined) dbUpdates.internal_status = updates.internal_status;
    if (updates.prepared_by_department !== undefined) dbUpdates.prepared_by_department = updates.prepared_by_department;
    if (updates.design_review_required !== undefined) dbUpdates.design_review_required = updates.design_review_required;
    if (updates.design_review_completed !== undefined) dbUpdates.design_review_completed = updates.design_review_completed;
    if (updates.final_width !== undefined) dbUpdates.final_width = updates.final_width;
    if (updates.final_height !== undefined) dbUpdates.final_height = updates.final_height;
    if (updates.measurement_unit !== undefined) dbUpdates.measurement_unit = updates.measurement_unit;
    if (updates.single_or_double_sided !== undefined) dbUpdates.single_or_double_sided = updates.single_or_double_sided;
    if (updates.indoor_or_outdoor !== undefined) dbUpdates.indoor_or_outdoor = updates.indoor_or_outdoor;
    if (updates.illuminated_or_non !== undefined) dbUpdates.illuminated_or_non = updates.illuminated_or_non;
    if (updates.substrate_material !== undefined) dbUpdates.substrate_material = updates.substrate_material;
    if (updates.frame_material !== undefined) dbUpdates.frame_material = updates.frame_material;
    if (updates.mounting_method !== undefined) dbUpdates.mounting_method = updates.mounting_method;
    if (updates.installation_surface !== undefined) dbUpdates.installation_surface = updates.installation_surface;
    if (updates.electrical_required !== undefined) dbUpdates.electrical_required = updates.electrical_required;
    if (updates.permit_required !== undefined) dbUpdates.permit_required = updates.permit_required;
    if (updates.fabrication_notes !== undefined) dbUpdates.fabrication_notes = updates.fabrication_notes;
    if (updates.production_warnings !== undefined) dbUpdates.production_warnings = updates.production_warnings;
    if (updates.vinyl_required !== undefined) dbUpdates.vinyl_required = updates.vinyl_required;
    if (updates.vinyl_brand !== undefined) dbUpdates.vinyl_brand = updates.vinyl_brand;
    if (updates.vinyl_color !== undefined) dbUpdates.vinyl_color = updates.vinyl_color;
    if (updates.vinyl_finish !== undefined) dbUpdates.vinyl_finish = updates.vinyl_finish;
    if (updates.vinyl_notes !== undefined) dbUpdates.vinyl_notes = updates.vinyl_notes;
    if (updates.print_required !== undefined) dbUpdates.print_required = updates.print_required;
    if (updates.print_material !== undefined) dbUpdates.print_material = updates.print_material;
    if (updates.print_quality !== undefined) dbUpdates.print_quality = updates.print_quality;
    if (updates.laminate_required !== undefined) dbUpdates.laminate_required = updates.laminate_required;
    if (updates.laminate_type !== undefined) dbUpdates.laminate_type = updates.laminate_type;
    if (updates.print_notes !== undefined) dbUpdates.print_notes = updates.print_notes;
    if (updates.cutting_required !== undefined) dbUpdates.cutting_required = updates.cutting_required;
    if (updates.cnc_required !== undefined) dbUpdates.cnc_required = updates.cnc_required;
    if (updates.welding_required !== undefined) dbUpdates.welding_required = updates.welding_required;
    if (updates.painting_required !== undefined) dbUpdates.painting_required = updates.painting_required;
    if (updates.painting_color !== undefined) dbUpdates.painting_color = updates.painting_color;
    if (updates.target_completion_date !== undefined) dbUpdates.target_completion_date = updates.target_completion_date;
    if (updates.actual_completion_date !== undefined) dbUpdates.actual_completion_date = updates.actual_completion_date;
    
    // Phase 4 mappings
    if (updates.client_acceptance_required !== undefined) dbUpdates.client_acceptance_required = updates.client_acceptance_required;
    if (updates.client_accepted !== undefined) dbUpdates.client_accepted = updates.client_accepted;
    if (updates.client_acceptance_date !== undefined) dbUpdates.client_acceptance_date = updates.client_acceptance_date;
    if (updates.client_acceptance_method !== undefined) dbUpdates.client_acceptance_method = updates.client_acceptance_method;
    if (updates.client_acceptance_notes !== undefined) dbUpdates.client_acceptance_notes = updates.client_acceptance_notes;
    if (updates.accepted_by_client_name !== undefined) dbUpdates.accepted_by_client_name = updates.accepted_by_client_name;
    if (updates.final_balance_due !== undefined) dbUpdates.final_balance_due = updates.final_balance_due;
    if (updates.final_payment_required !== undefined) dbUpdates.final_payment_required = updates.final_payment_required;
    if (updates.final_payment_received !== undefined) dbUpdates.final_payment_received = updates.final_payment_received;
    if (updates.final_payment_amount !== undefined) dbUpdates.final_payment_amount = updates.final_payment_amount;
    if (updates.final_payment_date !== undefined) dbUpdates.final_payment_date = updates.final_payment_date;
    if (updates.final_payment_method !== undefined) dbUpdates.final_payment_method = updates.final_payment_method;
    if (updates.final_payment_reference !== undefined) dbUpdates.final_payment_reference = updates.final_payment_reference;
    if (updates.closing_status !== undefined) dbUpdates.closing_status = updates.closing_status;
    if (updates.closed_at !== undefined) dbUpdates.closed_at = updates.closed_at;
    if (updates.closed_by_user_id !== undefined) dbUpdates.closed_by_user_id = updates.closed_by_user_id;
    if (updates.closing_notes !== undefined) dbUpdates.closing_notes = updates.closing_notes;
    if (updates.closeout_checklist_completed !== undefined) dbUpdates.closeout_checklist_completed = updates.closeout_checklist_completed;
    if (updates.closing_checklist !== undefined) dbUpdates.closing_checklist = updates.closing_checklist as any;
    
    const { error } = await WorkOrdersService.update(id, dbUpdates);
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
