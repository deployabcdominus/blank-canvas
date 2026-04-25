import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logAudit } from '@/lib/audit';

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
    const result = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();

    if (result.data) {
      await logAudit({
        action: 'creado',
        entityType: 'cliente',
        entityId: result.data.id,
        entityLabel: result.data.client_name,
        details: { contact_name: result.data.contact_name }
      });
    }

    return result;
  },

  async update(id: string, updates: ClientUpdate) {
    const result = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (result.data) {
      await logAudit({
        action: 'editado',
        entityType: 'cliente',
        entityId: result.data.id,
        entityLabel: result.data.client_name,
        details: updates
      });
    }

    return result;
  },

  async delete(id: string) {
    const { data: client } = await supabase.from('clients').select('client_name').eq('id', id).single();

    const result = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (client) {
      await logAudit({
        action: 'eliminado',
        entityType: 'cliente',
        entityId: id,
        entityLabel: client.client_name
      });
    }

    return result;
  }
};
