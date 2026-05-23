import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  name: string;
  type: "lead" | "proposal" | "order" | "installation" | "client" | "partner";
  description?: string;
  status?: string;
  path: string;
}

export const useGlobalSearchQuery = (query: string) => {
  return useQuery({
    queryKey: ['global-search', query],
    queryFn: async () => {
      if (query.length < 2) return [];
      
      const pattern = `%${query}%`;
      
      const [leads, proposals, orders, installations, clients, partners] = await Promise.all([
        supabase.from("leads").select("id, name, company, status").or(`name.ilike.${pattern},company.ilike.${pattern}`).is("deleted_at", null).limit(5),
        supabase.from("proposals").select("id, client, project, status").or(`client.ilike.${pattern},project.ilike.${pattern}`).limit(5),
        supabase.from("production_orders").select("id, client, project, wo_number, status").or(`client.ilike.${pattern},project.ilike.${pattern},wo_number.ilike.${pattern}`).limit(5),
        supabase.from("installations").select("id, client, project, location, status").or(`client.ilike.${pattern},project.ilike.${pattern},location.ilike.${pattern}`).limit(5),
        supabase.from("clients").select("id, client_name").ilike("client_name", pattern).limit(5),
        supabase.from("installer_companies").select("id, name").ilike("name", pattern).limit(5),
      ]);

      const results: SearchResult[] = [];

      (leads.data || []).forEach(l => results.push({
        id: l.id,
        name: l.company || l.name,
        type: "lead",
        description: `Lead · ${l.status}`,
        path: `/leads?id=${l.id}`,
      }));

      (proposals.data || []).forEach(p => results.push({
        id: p.id,
        name: p.proposal_number || `Propuesta ${p.id.slice(0, 8)}`,
        type: "proposal",
        description: `Proposal · ${p.status}`,
        path: `/proposals?id=${p.id}`,
      }));

      (orders.data || []).forEach(o => results.push({
        id: o.id,
        name: o.client,
        type: "order",
        description: `${o.wo_number || 'WO'} · ${o.project}`,
        path: `/work-orders?id=${o.id}`,
      }));

      (installations.data || []).forEach(i => results.push({
        id: i.id,
        name: i.client,
        type: "installation",
        description: `Installation · ${i.project}`,
        path: `/installation`,
      }));

      (clients.data || []).forEach(c => results.push({
        id: c.id,
        name: c.client_name,
        type: "client",
        description: "Customer Record",
        path: `/clients`,
      }));

      (partners.data || []).forEach(p => results.push({
        id: p.id,
        name: p.name,
        type: "partner",
        description: "Subcontractor",
        path: `/installer-companies`,
      }));

      return results;
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 30,
  });
};
