import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logAudit } from '@/lib/audit';
import { NotificationsService } from './notifications.service';

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
    const result = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();

    if (result.data) {
      await logAudit({
        action: 'creado',
        entityType: 'lead',
        entityId: result.data.id,
        entityLabel: result.data.name,
        details: { company: result.data.company }
      });
    }

    return result;
  },

  async update(id: string, updates: LeadUpdate) {
    const result = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (result.data) {
      await logAudit({
        action: 'editado',
        entityType: 'lead',
        entityId: result.data.id,
        entityLabel: result.data.name,
        details: updates
      });
    }

    return result;
  },

  async softDelete(id: string) {
    const result = await supabase
      .from('leads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (result.data) {
      await logAudit({
        action: 'eliminado',
        entityType: 'lead',
        entityId: result.data.id,
        entityLabel: result.data.name
      });
    }

    return result;
  },

  async softDeleteBatch(ids: string[]) {
    const result = await supabase
      .from('leads')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', ids)
      .select();

    if (result.data) {
      for (const item of result.data) {
        await logAudit({
          action: 'eliminado',
          entityType: 'lead',
          entityId: item.id,
          entityLabel: item.name
        });
      }
    }

    return result;
  },

  async restore(id: string) {
    const result = await supabase
      .from('leads')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single();

    if (result.data) {
      await logAudit({
        action: 'editado',
        entityType: 'lead',
        entityId: result.data.id,
        entityLabel: result.data.name,
        details: { action: 'restaurado' }
      });
    }

    return result;
  },

  async permanentDelete(id: string) {
    // We fetch before deleting to have the label for the log
    const { data: lead } = await supabase.from('leads').select('name').eq('id', id).single();

    const result = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (lead) {
      await logAudit({
        action: 'eliminado',
        entityType: 'lead',
        entityId: id,
        entityLabel: lead.name,
        details: { type: 'permanente' }
      });
    }

    return result;
  },

  async clearAll(companyId: string) {
    const result = await supabase
      .from('leads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .select();

    if (result.data) {
      await logAudit({
        action: 'eliminado',
        entityType: 'lead',
        details: { count: result.data.length, action: 'vaciar_papelera' }
      });
    }

    return result;
  }
};
