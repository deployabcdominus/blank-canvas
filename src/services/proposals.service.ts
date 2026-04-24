import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type ProposalRow = Database['public']['Tables']['proposals']['Row'];
export type ProposalInsert = Database['public']['Tables']['proposals']['Insert'];
export type ProposalUpdate = Database['public']['Tables']['proposals']['Update'];

export const ProposalsService = {
  async getAll(companyId: string, page = 0, pageSize = 500) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    // Fetch proposals and existing order links in parallel
    const [proposalsRes, ordersRes] = await Promise.all([
      supabase
        .from('proposals')
        .select(`
          id, client, project, value, description, status, sent_date, sent_method, 
          created_at, updated_at, lead_id, approved_total, approved_at, 
          approval_token, mockup_url,
          leads!proposals_lead_id_fkey(
            name, company, logo_url, client_id, 
            clients!leads_client_id_fkey(
              client_name, contact_name, primary_phone, primary_email, logo_url
            )
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .range(from, to),
      supabase
        .from('production_orders')
        .select('proposal_id')
        .not('proposal_id', 'is', null)
        .eq('company_id', companyId)
    ]);

    return {
      proposals: proposalsRes.data || [],
      orders: ordersRes.data || [],
      error: proposalsRes.error || ordersRes.error,
      count: proposalsRes.count
    };
  },

  async create(proposal: ProposalInsert) {
    return await supabase
      .from('proposals')
      .insert(proposal)
      .select()
      .single();
  },

  async update(id: string, updates: ProposalUpdate) {
    return await supabase
      .from('proposals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  async delete(id: string) {
    return await supabase
      .from('proposals')
      .delete()
      .eq('id', id);
  }
};
