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

    const signerIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || "unknown";
    const signerUserAgent = req.headers.get("user-agent") || "unknown";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Find proposal with lead data
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

    // ── Auto-create Client from Lead if not already linked ──
    let clientId: string | null = null;

    if (proposal.lead_id) {
      const { data: lead } = await admin
        .from("leads")
        .select("id, name, company, email, phone, location, website, logo_url, service, client_id, notes")
        .eq("id", proposal.lead_id)
        .single();

      if (lead) {
        if (lead.client_id) {
          // Lead already converted — reuse existing client
          clientId = lead.client_id;
        } else {
          // Check if a client with same name already exists in this company
          const clientName = lead.company || lead.name || proposal.client;
          const { data: existingClient } = await admin
            .from("clients")
            .select("id")
            .eq("company_id", proposal.company_id)
            .eq("client_name", clientName)
            .maybeSingle();

          if (existingClient) {
            clientId = existingClient.id;
          } else {
            // Create new client from lead data
            const { data: newClient, error: clientErr } = await admin
              .from("clients")
              .insert({
                company_id: proposal.company_id,
                client_name: clientName,
                contact_name: lead.name || "",
                primary_email: lead.email || null,
                primary_phone: lead.phone || null,
                address: lead.location || "",
                website: lead.website || "",
                service_type: lead.service || "",
                notes: lead.notes || null,
                logo_url: lead.logo_url || null,
              })
              .select("id")
              .single();

            if (!clientErr && newClient) {
              clientId = newClient.id;
            } else {
              console.error("Error creating client:", clientErr);
            }
          }

          // Link client back to lead
          if (clientId) {
            await admin.from("leads").update({
              client_id: clientId,
              status: "Convertido",
            }).eq("id", lead.id);
          }
        }
      }
    }

    // If no lead, try to find/create client by proposal.client name
    if (!clientId && proposal.client) {
      const { data: existingClient } = await admin
        .from("clients")
        .select("id")
        .eq("company_id", proposal.company_id)
        .eq("client_name", proposal.client)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient } = await admin
          .from("clients")
          .insert({
            company_id: proposal.company_id,
            client_name: proposal.client,
            contact_name: "",
            address: "",
          })
          .select("id")
          .single();
        if (newClient) clientId = newClient.id;
      }
    }

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
        auto_client_created: !!clientId,
      },
    });

    // Auto-create Project linked to client
    let projectId: string | null = null;
    {
      const clientName = clientId
        ? (await admin.from("clients").select("client_name").eq("id", clientId).single()).data?.client_name || proposal.client
        : proposal.client;

      const { data: newProject, error: projErr } = await admin
        .from("projects")
        .insert({
          company_id: proposal.company_id,
          client_id: clientId,
          project_name: proposal.project || clientName,
          install_address: "",
          status: "Production",
          owner_user_id: proposal.user_id,
        })
        .select("id")
        .single();

      if (!projErr && newProject) {
        projectId = newProject.id;
      } else {
        console.error("Error creating project:", projErr);
      }
    }

    // Auto-create Work Order linked to client and project
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
      client_id: clientId,
      project_id: projectId,
      proposal_id: proposal.id,
      notes: `Generada automáticamente al aprobarse la propuesta por ${signerName.trim()}.`,
    });

    if (woErr) {
      console.error("Error creating work order:", woErr);
    }

    // ── Send email notification to admin ──
    try {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY && proposal.company_id) {
        const { data: admins } = await admin
          .from("user_roles")
          .select("user_id")
          .in("role", ["admin", "superadmin"]);

        if (admins && admins.length > 0) {
          const adminIds = admins.map((a: any) => a.user_id);
          const { data: profiles } = await admin
            .from("profiles")
            .select("id")
            .eq("company_id", proposal.company_id)
            .in("id", adminIds);

          if (profiles && profiles.length > 0) {
            const emails: string[] = [];
            for (const p of profiles) {
              const { data: authUser } = await admin.auth.admin.getUserById(p.id);
              if (authUser?.user?.email) emails.push(authUser.user.email);
            }

            const { data: comp } = await admin
              .from("companies")
              .select("name, logo_url")
              .eq("id", proposal.company_id)
              .single();

            const companyName = comp?.name || "Sign Flow";
            const logoHtml = comp?.logo_url
              ? `<img src="${comp.logo_url}" style="height:40px;object-fit:contain;margin-bottom:16px" />`
              : `<h2 style="margin:0 0 16px;color:#7c3aed;font-size:24px">Sign Flow</h2>`;

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
                      <div style="background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(124,58,237,0.05));border:1px solid rgba(124,58,237,0.2);border-radius:12px;padding:24px;margin-bottom:24px">
                        <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#a1a1aa">Propuesta aprobada</p>
                        <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#8b5cf6">🚀 ¡${proposal.client} ha firmado!</h1>
                        <p style="margin:0;color:#d4d4d8;font-size:15px;line-height:1.6">
                          La propuesta <strong>${proposal.project || proposal.client}</strong> ha sido aprobada
                          y firmada por <strong>${signerName.trim()}</strong>.
                        </p>
                      </div>
                      <div style="display:flex;gap:16px;margin-bottom:24px">
                        <div style="flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px;text-align:center">
                          <p style="margin:0;font-size:11px;color:#71717a;text-transform:uppercase">Monto</p>
                          <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#8b5cf6">${formattedValue}</p>
                        </div>
                        <div style="flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px;text-align:center">
                          <p style="margin:0;font-size:11px;color:#71717a;text-transform:uppercase">Firmado por</p>
                          <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#e4e4e7">${signerName.trim()}</p>
                        </div>
                      </div>
                      <p style="color:#52525b;font-size:11px;margin:0;text-align:center">
                        Cliente registrado y orden de trabajo creada automáticamente · ${companyName} via Sign Flow
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
    }

    return new Response(JSON.stringify({
      success: true,
      proposalId: proposal.id,
      clientId,
      clientAutoCreated: !!clientId,
    }), {
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
