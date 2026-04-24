import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export const ProjectsService = {
  async getAll(companyId: string, page = 0, pageSize = 500) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    return await supabase
      .from('projects')
      .select(`
        id, company_id, client_id, project_name, install_address, status, 
        owner_user_id, assigned_to_user_id, folder_relative_path, folder_full_path, 
        created_at, updated_at, 
        clients!projects_client_id_fkey(client_name), 
        leads!leads_project_id_fkey(name, company)
      `, { count: 'exact' })
      .is('deleted_at', null)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(from, to);
  },

  async create(project: ProjectInsert) {
    return await supabase
      .from('projects')
      .insert(project)
      .select('*, clients!projects_client_id_fkey(client_name)')
      .single();
  },

  async update(id: string, updates: ProjectUpdate) {
    return await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  async softDelete(id: string) {
    return await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
  }
};
