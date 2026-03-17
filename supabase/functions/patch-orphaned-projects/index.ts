import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceRoleKey);

  const patches: string[] = [];

  // 1. Fix projects with null client_id — try to find client via leads/proposals
  const { data: orphanedProjects } = await admin
    .from("projects")
    .select("id, project_name, company_id, client_id")
    .is("client_id", null);

  for (const proj of orphanedProjects || []) {
    // Try to find a matching lead → client
    const { data: leads } = await admin
      .from("leads")
      .select("id, client_id, company")
      .eq("company_id", proj.company_id)
      .not("client_id", "is", null);

    if (leads && leads.length > 0) {
      // Use the first client found for this company
      const clientId = leads[0].client_id;
      await admin.from("projects").update({ client_id: clientId }).eq("id", proj.id);
      patches.push(`Project ${proj.id} → client_id = ${clientId}`);
    }
  }

  // 2. Fix work orders with null client_id or project_id
  const { data: orphanedOrders } = await admin
    .from("production_orders")
    .select("id, client, company_id, client_id, project_id, proposal_id");

  for (const order of orphanedOrders || []) {
    const updates: Record<string, string> = {};

    // Fix client_id
    if (!order.client_id && order.proposal_id) {
      const { data: proposal } = await admin
        .from("proposals")
        .select("lead_id, client")
        .eq("id", order.proposal_id)
        .single();

      if (proposal?.lead_id) {
        const { data: lead } = await admin
          .from("leads")
          .select("client_id")
          .eq("id", proposal.lead_id)
          .single();

        if (lead?.client_id) {
          updates.client_id = lead.client_id;
        }
      }

      // Also try by client name
      if (!updates.client_id) {
        const { data: client } = await admin
          .from("clients")
          .select("id")
          .eq("company_id", order.company_id)
          .eq("client_name", order.client)
          .maybeSingle();

        if (client) updates.client_id = client.id;
      }
    }

    // Fix project_id
    if (!order.project_id && order.company_id) {
      const resolvedClientId = updates.client_id || order.client_id;
      if (resolvedClientId) {
        const { data: project } = await admin
          .from("projects")
          .select("id")
          .eq("company_id", order.company_id)
          .eq("client_id", resolvedClientId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (project) updates.project_id = project.id;
      }
    }

    if (Object.keys(updates).length > 0) {
      await admin.from("production_orders").update(updates).eq("id", order.id);
      patches.push(`Order ${order.id} → ${JSON.stringify(updates)}`);
    }
  }

  // 2b. Fix work orders where client field has contact name instead of company name
  for (const order of orphanedOrders || []) {
    const resolvedClientId = order.client_id;
    if (resolvedClientId) {
      const { data: client } = await admin
        .from("clients")
        .select("client_name")
        .eq("id", resolvedClientId)
        .single();

      if (client && client.client_name && client.client_name !== order.client) {
        await admin.from("production_orders").update({ client: client.client_name }).eq("id", order.id);
        patches.push(`Order ${order.id} client: "${order.client}" → "${client.client_name}"`);
      }
    }
  }

  // 3. Fix proposals that store contact name instead of company name
  const { data: proposals } = await admin
    .from("proposals")
    .select("id, client, lead_id")
    .not("lead_id", "is", null);

  for (const prop of proposals || []) {
    const { data: lead } = await admin
      .from("leads")
      .select("name, company")
      .eq("id", prop.lead_id)
      .single();

    if (lead?.company && lead.company !== prop.client && prop.client === lead.name) {
      await admin.from("proposals").update({ client: lead.company }).eq("id", prop.id);
      patches.push(`Proposal ${prop.id} client: "${prop.client}" → "${lead.company}"`);
    }
  }

  return new Response(JSON.stringify({ patches, count: patches.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
