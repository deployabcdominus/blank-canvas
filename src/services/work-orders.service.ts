import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logAudit } from '@/lib/audit';

export type WorkOrderRow = Database['public']['Tables']['production_orders']['Row'];
export type WorkOrderInsert = Database['public']['Tables']['production_orders']['Insert'];
export type WorkOrderUpdate = Database['public']['Tables']['production_orders']['Update'];

/**
 * Service for managing production orders.
 */
export const WorkOrdersService = {
  /**
   * Fetches all production orders for a company.
   */
  async getAll(companyId: string, page = 0, pageSize = 500) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    return await supabase
      .from('production_orders')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(from, to);
  },

  /**
   * Fetches a single production order by ID.
   */
  async getById(id: string) {
    return await supabase
      .from('production_orders')
      .select('*')
      .eq('id', id)
      .single();
  },

  /**
   * Creates a new production order.
   */
  async create(order: WorkOrderInsert) {
    const result = await supabase
      .from('production_orders')
      .insert(order)
      .select()
      .single();

    if (result.data) {
      await logAudit({
        action: 'creado',
        entityType: 'orden_produccion',
        entityId: result.data.id,
        entityLabel: `${result.data.client} - ${result.data.project}`,
        details: { status: result.data.status }
      });
    }

    return result;
  },

  /**
   * Updates an existing production order.
   */
  async update(id: string, updates: WorkOrderUpdate) {
    const result = await supabase
      .from('production_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (result.data) {
      await logAudit({
        action: 'editado',
        entityType: 'orden_produccion',
        entityId: result.data.id,
        entityLabel: `${result.data.client} - ${result.data.project}`,
        details: updates
      });
    }

    return result;
  },

  /**
   * Deletes a production order (hard delete).
   */
  async delete(id: string) {
    const { data: order } = await supabase
      .from('production_orders')
      .select('client, project')
      .eq('id', id)
      .single();

    const result = await supabase
      .from('production_orders')
      .delete()
      .eq('id', id);

    if (order) {
      await logAudit({
        action: 'eliminado',
        entityType: 'orden_produccion',
        entityId: id,
        entityLabel: `${order.client} - ${order.project}`
      });
    }

    return result;
  },

  /**
   * Clears all production orders for a company.
   */
  async clearAll(companyId: string) {
    return await supabase
      .from('production_orders')
      .delete()
      .eq('company_id', companyId);
  }
};