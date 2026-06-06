import { supabase } from "@/integrations/supabase/client";

/**
 * Audit Service for system-wide tracking.
 * This service centralizes all logic for reading and creating audit logs.
 */
export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  details: any;
  created_at: string;
  company_id: string;
}

export const AuditLogsService = {
  /**
   * Fetches recent audit logs for display in dashboards or widgets.
   */
  async getRecent(limit = 5) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.company_id) return [];

    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent audit logs:", error);
      return [];
    }

    return data as AuditLogEntry[];
  },

  /**
   * Fetches all audit logs for a company with pagination support.
   */
  async getAll(companyId: string, page = 0, pageSize = 50) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    return await supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .range(from, to);
  }
};
