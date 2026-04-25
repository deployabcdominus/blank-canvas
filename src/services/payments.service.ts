import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logAudit } from '@/lib/audit';

export type PaymentRow = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export const PaymentsService = {
  async getAll(companyId: string) {
    return await supabase
      .from('payments')
      .select('*')
      .eq('company_id', companyId)
      .order('paid_at', { ascending: false });
  },

  async create(payment: PaymentInsert) {
    const result = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (result.data) {
      await logAudit({
        action: 'creado',
        entityType: 'pago',
        entityId: result.data.id,
        entityLabel: `${result.data.amount} ${result.data.currency}`,
        details: { proposal_id: result.data.proposal_id }
      });
    }

    return result;
  },

  async update(id: string, updates: PaymentUpdate) {
    const result = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (result.data) {
      await logAudit({
        action: 'editado',
        entityType: 'pago',
        entityId: result.data.id,
        entityLabel: `${result.data.amount} ${result.data.currency}`,
        details: updates
      });
    }

    return result;
  },

  async delete(id: string) {
    const { data: payment } = await supabase.from('payments').select('amount, currency').eq('id', id).single();
    
    const result = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (payment) {
      await logAudit({
        action: 'eliminado',
        entityType: 'pago',
        entityId: id,
        entityLabel: `${payment.amount} ${payment.currency}`
      });
    }

    return result;
  }
};
