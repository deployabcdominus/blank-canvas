import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EntityResult {
  id: string;
  name: string;
  type: "client" | "lead";
  logoUrl?: string | null;
}

export const useEntitySearchQuery = (query: string) => {
  return useQuery({
    queryKey: ['entity-search', query],
    queryFn: async () => {
      if (query.length < 1) return [];
      
      const pattern = `%${query}%`;
      const [clientsRes, leadsRes] = await Promise.all([
        supabase
          .from("clients")
          .select("id, client_name, logo_url")
          .ilike("client_name", pattern)
          .limit(5),
        supabase
          .from("leads")
          .select("id, name, company, logo_url, status")
          .or(`name.ilike.${pattern},company.ilike.${pattern}`)
          .is("deleted_at", null)
          .limit(5),
      ]);

      const mapped: EntityResult[] = [
        ...(clientsRes.data || []).map((c: any) => ({
          id: c.id,
          name: c.client_name,
          type: "client" as const,
          logoUrl: c.logo_url,
        })),
        ...(leadsRes.data || []).map((l: any) => ({
          id: l.id,
          name: l.company || l.name,
          type: "lead" as const,
          logoUrl: l.logo_url,
        })),
      ];
      
      return mapped;
    },
    enabled: query.length > 0,
    staleTime: 1000 * 60, // 1 minute
  });
};
