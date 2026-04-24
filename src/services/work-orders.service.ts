import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

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
    return await supabase
      .from('production_orders')
      .insert(order)
      .select()
      .single();
  },

  async update(id: string, updates: WorkOrderUpdate) {
    return await supabase
      .from('production_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  async delete(id: string) {
    return await supabase
      .from('production_orders')
      .delete()
      .eq('id', id);
  },

  async deleteByCompany(companyId: string) {
    return await supabase
      .from('production_orders')
      .delete()
      .eq('company_id', companyId);
  }
};
