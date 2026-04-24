import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type LeadRow = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];
export type LeadUpdate = Database['public']['Tables']['leads']['Update'];

export const LeadsService = {
  async getAll(companyId: string, page = 0, pageSize = 500) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    return await supabase
      .from('leads')
      .select('*, clients!leads_client_id_fkey(client_name, contact_name, primary_phone, primary_email, address, website, logo_url)', { count: 'exact' })
      .is('deleted_at', null)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(from, to);
  },

  async getDeleted(companyId: string) {
    return await supabase
      .from('leads')
      .select('*')
      .eq('company_id', companyId)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
  },

  async create(lead: LeadInsert) {
    return await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();
  },

  async update(id: string, updates: LeadUpdate) {
    return await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  async softDelete(id: string) {
    return await supabase
      .from('leads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
  },

  async softDeleteBatch(ids: string[]) {
    return await supabase
      .from('leads')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', ids);
  },

  async restore(id: string) {
    return await supabase
      .from('leads')
      .update({ deleted_at: null })
      .eq('id', id);
  },

  async permanentDelete(id: string) {
    return await supabase
      .from('leads')
      .delete()
      .eq('id', id);
  },

  async clearAll(companyId: string) {
    return await supabase
      .from('leads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('company_id', companyId)
      .is('deleted_at', null);
  }
};
