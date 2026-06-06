import { supabase } from "@/integrations/supabase/client";

/**
 * Service for managing leads in the recycle bin (soft-deleted).
 */
export const LeadsRecycleService = {
  /**
   * Fetches all soft-deleted leads for a company.
   */
  async getDeleted(companyId: string) {
    return await supabase
      .from('leads')
      .select('*')
      .eq('company_id', companyId)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
  },

  /**
   * Restores a soft-deleted lead.
   */
  async restore(id: string) {
    return await supabase
      .from('leads')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Permanently deletes a lead from the database.
   */
  async permanentDelete(id: string) {
    return await supabase
      .from('leads')
      .delete()
      .eq('id', id);
  },

  /**
   * Permanently deletes all soft-deleted leads for a company.
   */
  async clearBin(companyId: string) {
    return await supabase
      .from('leads')
      .delete()
      .eq('company_id', companyId)
      .not('deleted_at', 'is', null);
  }
};
