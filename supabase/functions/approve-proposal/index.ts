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
    }

    // ── Send email notification to admin ──
    try {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY && proposal.company_id) {
        // Get admin emails
        const { data: admins } = await admin
          .from("user_roles")
          .select("user_id")
          .in("role", ["admin", "superadmin"]);

        if (admins && admins.length > 0) {
          // Get admin profiles with company match
          const adminIds = admins.map((a: any) => a.user_id);
          const { data: profiles } = await admin
            .from("profiles")
            .select("id")
            .eq("company_id", proposal.company_id)
            .in("id", adminIds);

          if (profiles && profiles.length > 0) {
            // Get emails from auth
            const emails: string[] = [];
            for (const p of profiles) {
              const { data: authUser } = await admin.auth.admin.getUserById(p.id);
              if (authUser?.user?.email) emails.push(authUser.user.email);
            }

            // Get company name
            const { data: comp } = await admin
              .from("companies")
              .select("name, logo_url")
              .eq("id", proposal.company_id)
              .single();

            const companyName = comp?.name || "Sign Flow";
            const logoHtml = comp?.logo_url
              ? `<img src="${comp.logo_url}" style="height:40px;object-fit:contain;margin-bottom:16px" />`
              : `<h2 style="margin:0 0 16px;color:#E8712A;font-size:24px">Sign Flow</h2>`;

            const formattedValue = proposal.value
              ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(proposal.value)
              : "—";

            for (const email of emails) {
              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                  from: `${companyName} <hello@mail.signflowapp.com>`,
                  to: email,
                  subject: `🚀 ¡Propuesta Aprobada! - ${proposal.client}`,
                  html: `
                    <div style="font-family:'Inter',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#e4e4e7;border-radius:12px">
                      ${logoHtml}
                      <div style="background:linear-gradient(135deg,rgba(249,115,22,0.15),rgba(249,115,22,0.05));border:1px solid rgba(249,115,22,0.2);border-radius:12px;padding:24px;margin-bottom:24px">
                        <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#a1a1aa">Propuesta aprobada</p>
                        <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#f97316">🚀 ¡${proposal.client} ha firmado!</h1>
                        <p style="margin:0;color:#d4d4d8;font-size:15px;line-height:1.6">
                          La propuesta <strong>${proposal.project || proposal.client}</strong> ha sido aprobada
                          y firmada por <strong>${signerName.trim()}</strong>.
                        </p>
                      </div>
                      <div style="display:flex;gap:16px;margin-bottom:24px">
                        <div style="flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px;text-align:center">
                          <p style="margin:0;font-size:11px;color:#71717a;text-transform:uppercase">Monto</p>
                          <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#f97316">${formattedValue}</p>
                        </div>
                        <div style="flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px;text-align:center">
                          <p style="margin:0;font-size:11px;color:#71717a;text-transform:uppercase">Firmado por</p>
                          <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#e4e4e7">${signerName.trim()}</p>
                        </div>
                      </div>
                      <p style="color:#52525b;font-size:11px;margin:0;text-align:center">
                        Se ha creado automáticamente una orden de trabajo · ${companyName} via Sign Flow
                      </p>
                    </div>
                  `,
                }),
              });
            }
          }
        }
      }
    } catch (emailErr) {
      console.error("Error sending approval email:", emailErr);
      // Non-blocking
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
