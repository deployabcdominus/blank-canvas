import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logAudit } from '@/lib/audit';
import { NotificationsService } from './notifications.service';

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
    const result = await supabase
      .from('proposals')
      .insert(proposal)
      .select()
      .single();

    if (result.data) {
      await logAudit({
        action: 'creado',
        entityType: 'propuesta',
        entityId: result.data.id,
        entityLabel: `${result.data.client} - ${result.data.project}`,
        details: { value: result.data.value }
      });
    }

    return result;
  },

  async update(id: string, updates: ProposalUpdate) {
    const result = await supabase
      .from('proposals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (result.data) {
      const isApproved = updates.status === 'approved' || updates.status === 'Aprobada';
      
      await logAudit({
        action: isApproved ? 'aprobado' : 'editado',
        entityType: 'propuesta',
        entityId: result.data.id,
        entityLabel: `${result.data.client} - ${result.data.project}`,
        details: updates
      });

      // Automated Notification for Approval
      if (isApproved && result.data.company_id) {
        // Find admins to notify them
        const { data: admins } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('company_id', result.data.company_id)
          .eq('role', 'admin');

        if (admins) {
          for (const admin of admins) {
            await NotificationsService.create({
              userId: admin.user_id,
              companyId: result.data.company_id,
              title: "Propuesta Aprobada",
              message: `La propuesta de ${result.data.client} ha sido aprobada por un valor de $${result.data.value}`,
              type: 'proposal_approved',
              link: `/proposals`
            });
          }
        }
      }
    }

    return result;
  },

  async delete(id: string) {
    const { data: proposal } = await supabase.from('proposals').select('client, project').eq('id', id).single();

    const result = await supabase
      .from('proposals')
      .delete()
      .eq('id', id);

    if (proposal) {
      await logAudit({
        action: 'eliminado',
        entityType: 'propuesta',
        entityId: id,
        entityLabel: `${proposal.client} - ${proposal.project}`
      });
    }

    return result;
  }
};
