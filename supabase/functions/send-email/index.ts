import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { EmailPayloadSchema } from "../_shared/schemas.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TEMPLATES: Record<string, (data: Record<string, string>) => { subject: string; html: string }> = {
  invitation: (data) => ({
    subject: `Te invitaron a unirte a ${data.companyName} en Sign Flow`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#ffffff">
        <div style="margin-bottom:24px">
          ${data.logoUrl ? `<img src="${data.logoUrl}" style="height:48px;object-fit:contain" />` : `<h2 style="margin:0;color:#E8712A">Sign Flow</h2>`}
        </div>
        <h1 style="font-size:22px;font-weight:700;color:#0F1523;margin:0 0 8px">
          ${data.inviterName} te invita a unirte
        </h1>
        <p style="color:#3D4663;font-size:15px;line-height:1.6;margin:0 0 24px">
          Tienes una invitación para unirte a <strong>${data.companyName}</strong>
          en Sign Flow como <strong>${data.roleName}</strong>.
        </p>
        <a href="${data.inviteUrl}"
           style="display:inline-block;background:#E8712A;color:#ffffff;font-weight:600;
                  font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none">
          Aceptar invitación →
        </a>
        <p style="color:#9BA8C5;font-size:12px;margin-top:24px;line-height:1.5">
          Este enlace expira en 7 días.<br/>
          Si no esperabas esta invitación, ignora este email.
        </p>
        <hr style="border:none;border-top:1px solid #F3F4F6;margin:24px 0" />
        <p style="color:#9BA8C5;font-size:11px;margin:0">${data.companyName} via Sign Flow</p>
      </div>
    `,
  }),

  order_status: (data) => ({
    subject: `Tu orden "${data.orderTitle}" — Estado: ${data.newStatus}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#ffffff">
        <h1 style="font-size:20px;font-weight:700;color:#0F1523;margin:0 0 8px">
          Actualización de orden
        </h1>
        <p style="color:#3D4663;font-size:15px;line-height:1.6;margin:0 0 20px">
          La orden <strong>${data.orderTitle}</strong> ha sido actualizada.
        </p>
        <div style="background:#FFF7ED;border-radius:10px;padding:16px;margin-bottom:20px">
          <p style="margin:0;color:#6B7699;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Nuevo estado</p>
          <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#E8712A">${data.newStatus}</p>
        </div>
        ${data.notes ? `<p style="color:#3D4663;font-size:14px;line-height:1.6">${data.notes}</p>` : ""}
        <hr style="border:none;border-top:1px solid #F3F4F6;margin:24px 0" />
        <p style="color:#9BA8C5;font-size:11px;margin:0">${data.companyName} via Sign Flow</p>
      </div>
    `,
  }),

  proposal_sent: (data) => ({
    subject: `Nueva propuesta de ${data.companyName}: ${data.proposalTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#ffffff">
        <h1 style="font-size:20px;font-weight:700;color:#0F1523;margin:0 0 8px">
          Tienes una nueva propuesta
        </h1>
        <p style="color:#3D4663;font-size:15px;line-height:1.6;margin:0 0 20px">
          <strong>${data.companyName}</strong> te ha enviado una propuesta
          por <strong>${data.amount}</strong>.
        </p>
        <div style="background:#FFF7ED;border-radius:10px;padding:16px;margin-bottom:20px">
          <p style="margin:0;color:#6B7699;font-size:11px;text-transform:uppercase;letter-spacing:0.08em">Propuesta</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#0F1523">${data.proposalTitle}</p>
          ${data.dueDate ? `<p style="margin:6px 0 0;color:#D97706;font-size:12px;font-weight:600">Válida hasta: ${data.dueDate}</p>` : ""}
        </div>
        ${data.notes ? `<p style="color:#3D4663;font-size:14px;line-height:1.6">${data.notes}</p>` : ""}
        <hr style="border:none;border-top:1px solid #F3F4F6;margin:24px 0" />
        <p style="color:#9BA8C5;font-size:11px;margin:0">${data.companyName} via Sign Flow</p>
      </div>
    `,
  }),
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── JWT validation ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const result = EmailPayloadSchema.safeParse(body);

    if (!result.success) {
      return new Response(JSON.stringify({ 
        error: "Validación fallida", 
        details: result.error.format() 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, to, data } = result.data;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const template = TEMPLATES[type]?.(data);
    if (!template) throw new Error(`Unknown email type: ${type}`);

    const fromName = data.companyName || "Sign Flow";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${fromName} <hello@mail.signflowapp.com>`,
        to,
        subject: template.subject,
        html: template.html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Resend error: ${err}`);
    }

    const result = await response.json();
    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
