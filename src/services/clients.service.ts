import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type ClientRow = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export const ClientsService = {
  async getAll(companyId: string) {
    return await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId)
      .order('client_name', { ascending: true });
  },

  async create(client: ClientInsert) {
    return await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();
  },

  async update(id: string, updates: ClientUpdate) {
    return await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  async delete(id: string) {
    return await supabase
      .from('clients')
      .delete()
      .eq('id', id);
  }
};
