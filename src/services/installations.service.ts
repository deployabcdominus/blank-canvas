import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logAudit } from '@/lib/audit';

export type InstallationRow = Database['public']['Tables']['installations']['Row'];
export type InstallationInsert = Database['public']['Tables']['installations']['Insert'];
export type InstallationUpdate = Database['public']['Tables']['installations']['Update'];

export const InstallationsService = {
  async getAll(companyId: string) {
    return await supabase
      .from('installations')
      .select('*')
      .eq('company_id', companyId)
      .order('scheduled_date', { ascending: false });
  },

  async create(installation: InstallationInsert) {
    const result = await supabase
      .from('installations')
      .insert(installation)
      .select()
      .single();

    if (result.data) {
      await logAudit({
        action: 'creado',
        entityType: 'ejecucion',
        entityId: result.data.id,
        entityLabel: result.data.project,
        details: { client: result.data.client }
      });
    }

    return result;
  },

  async update(id: string, updates: InstallationUpdate) {
    const result = await supabase
      .from('installations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (result.data) {
      await logAudit({
        action: 'editado',
        entityType: 'ejecucion',
        entityId: result.data.id,
        entityLabel: result.data.project,
        details: updates
      });
    }

    return result;
  },

  async delete(id: string) {
    const { data: installation } = await supabase.from('installations').select('project').eq('id', id).single();

    const result = await supabase
      .from('installations')
      .delete()
      .eq('id', id);

    if (installation) {
      await logAudit({
        action: 'eliminado',
        entityType: 'ejecucion',
        entityId: id,
        entityLabel: installation.project
      });
    }

    return result;
  },

  async clearAll(companyId: string) {
    const result = await supabase
      .from('installations')
      .delete()
      .eq('company_id', companyId);

    await logAudit({
      action: 'eliminado',
      entityType: 'ejecucion',
      details: { action: 'vaciar_instalaciones' }
    });

    return result;
  }
};
