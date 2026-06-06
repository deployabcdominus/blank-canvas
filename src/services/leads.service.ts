import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logAudit } from '@/lib/audit';
import { NotificationsService } from './notifications.service';
import { LeadsRecycleService } from './leads-recycle.service';

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
    return await LeadsRecycleService.getDeleted(companyId);
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

      // Automated Notification: If assigned to a new user
      if (updates.assigned_to_user_id && updates.assigned_to_user_id !== result.data.assigned_to_user_id) {
        await NotificationsService.create({
          userId: updates.assigned_to_user_id,
          companyId: result.data.company_id,
          title: "Nuevo Lead Asignado",
          message: `Se te ha asignado el lead: ${result.data.name}`,
          type: 'lead_assigned',
          link: `/leads`
        });
      }
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
    return await LeadsRecycleService.restore(id);
  },

  async permanentDelete(id: string) {
    return await LeadsRecycleService.permanentDelete(id);
  },

  async clearAll(companyId: string) {
    return await LeadsRecycleService.clearBin(companyId);
  }
};
