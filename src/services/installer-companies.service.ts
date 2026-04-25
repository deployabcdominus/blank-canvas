import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type InstallerCompanyRow = Database['public']['Tables']['installer_companies']['Row'];
export type InstallerCompanyInsert = Database['public']['Tables']['installer_companies']['Insert'];
export type InstallerCompanyUpdate = Database['public']['Tables']['installer_companies']['Update'];

export const InstallerCompaniesService = {
  async getAll(companyId: string) {
    return await supabase
      .from('installer_companies')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });
  },

  async create(installerCompany: InstallerCompanyInsert) {
    return await supabase
      .from('installer_companies')
      .insert(installerCompany)
      .select()
      .single();
  },

  async update(id: string, updates: InstallerCompanyUpdate) {
    return await supabase
      .from('installer_companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  async delete(id: string) {
    return await supabase
      .from('installer_companies')
      .delete()
      .eq('id', id);
  }
};
