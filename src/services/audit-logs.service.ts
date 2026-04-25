import { supabase } from "@/integrations/supabase/client";

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
}

export const AuditLogsService = {
  async getRecent(limit = 5) {
    return await supabase
      .from("audit_logs")
      .select("id, user_id, user_name, action, entity_type, entity_id, entity_label, details, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
  },

  async getAll(companyId: string, page = 0, pageSize = 50) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    return await supabase
      .from("audit_logs")
      .select("id, user_id, user_name, action, entity_type, entity_id, entity_label, details, created_at", { count: "exact" })
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .range(from, to);
  }
};
