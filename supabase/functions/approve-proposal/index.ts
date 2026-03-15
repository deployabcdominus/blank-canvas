import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { approvalToken, signerName, signatureData } = await req.json();

    if (!approvalToken || !signerName?.trim()) {
      return new Response(JSON.stringify({ error: "Token y nombre del firmante son requeridos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Capture client info
    const signerIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || "unknown";
    const signerUserAgent = req.headers.get("user-agent") || "unknown";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Find proposal by approval_token
    const { data: proposal, error: fetchErr } = await admin
      .from("proposals")
      .select("id, client, project, value, status, company_id, lead_id, user_id, approved_at")
      .eq("approval_token", approvalToken)
      .single();

    if (fetchErr || !proposal) {
      return new Response(JSON.stringify({ error: "Propuesta no encontrada" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (proposal.approved_at || proposal.status === "Aprobada") {
      return new Response(JSON.stringify({ error: "Esta propuesta ya fue aprobada", alreadyApproved: true }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date().toISOString();

    // Update proposal to approved
    const { error: updateErr } = await admin
      .from("proposals")
      .update({
        status: "Aprobada",
        approved_at: now,
        approved_total: proposal.value,
        signer_name: signerName.trim(),
        signer_ip: signerIp,
        signer_user_agent: signerUserAgent,
        signature_data: signatureData || null,
      })
      .eq("id", proposal.id);

    if (updateErr) throw updateErr;

    // Create audit log
    await admin.from("audit_logs").insert({
      company_id: proposal.company_id,
      user_id: proposal.user_id,
      user_name: signerName.trim() + " (firma externa)",
      action: "aprobado",
      entity_type: "propuesta",
      entity_id: proposal.id,
      entity_label: proposal.client,
      details: {
        signer_name: signerName.trim(),
        signer_ip: signerIp,
        approved_at: now,
        value: proposal.value,
      },
    });

    // Auto-create Work Order
    const { error: woErr } = await admin.from("production_orders").insert({
      user_id: proposal.user_id,
      company_id: proposal.company_id,
      owner_user_id: proposal.user_id,
      client: proposal.client,
      project: proposal.project || "",
      status: "Pendiente",
      progress: 0,
      priority: "media",
      materials: [],
      start_date: now,
      notes: `Generada automáticamente al aprobarse la propuesta por ${signerName.trim()}.`,
    });

    if (woErr) {
      console.error("Error creating work order:", woErr);
      // Non-blocking — proposal is already approved
    }

    return new Response(JSON.stringify({ success: true, proposalId: proposal.id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("approve-proposal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
