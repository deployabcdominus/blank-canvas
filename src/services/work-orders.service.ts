import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logAudit } from '@/lib/audit';

export type WorkOrderRow = Database['public']['Tables']['production_orders']['Row'];
export type WorkOrderInsert = Database['public']['Tables']['production_orders']['Insert'];
export type WorkOrderUpdate = Database['public']['Tables']['production_orders']['Update'];

export const WorkOrdersService = {
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
        entityLabel: `OT #${result.data.order_number || result.data.id.slice(0, 8)}`,
        details: { status: result.data.status }
      });
    }

    return result;
  },

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
        entityLabel: `OT #${result.data.order_number || result.data.id.slice(0, 8)}`,
        details: updates
      });
    }

    return result;
  },

  async delete(id: string) {
    const { data: order } = await supabase.from('production_orders').select('order_number').eq('id', id).single();

    const result = await supabase
      .from('production_orders')
      .delete()
      .eq('id', id);

    if (order) {
      await logAudit({
        action: 'eliminado',
        entityType: 'orden_produccion',
        entityId: id,
        entityLabel: `OT #${order.order_number || id.slice(0, 8)}`
      });
    }

    return result;
  },

  async deleteByCompany(companyId: string) {
    return await supabase
      .from('production_orders')
      .delete()
      .eq('company_id', companyId);
  }
};
