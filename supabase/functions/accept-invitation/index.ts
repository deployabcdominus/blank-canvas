import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();
    if (!token) throw new Error("Token requerido");

    // Extract user from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No autorizado");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // User client to get authenticated user
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();
    if (userError || !user) throw new Error("No autorizado");

    // Admin client to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Validate invitation
    const { data: invitation, error: invError } = await supabaseAdmin
      .from("invitations")
      .select("*")
      .eq("token", token)
      .is("accepted_at", null)
      .single();

    if (invError || !invitation) throw new Error("Invitación inválida o ya utilizada");

    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error("Invitación expirada");
    }

    // Verify email matches
    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error(
        `Esta invitación fue enviada a ${invitation.email}. Estás conectado como ${user.email}.`
      );
    }

    // Update profile with company_id
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ company_id: invitation.company_id })
      .eq("id", user.id);
    if (profileError) throw new Error("Error actualizando perfil: " + profileError.message);

    // Check if user already has a role for this company
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingRole) {
      // Update existing role to match invitation
      await supabaseAdmin
        .from("user_roles")
        .update({ role: invitation.role })
        .eq("id", existingRole.id);
    } else {
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: user.id, role: invitation.role });
      if (roleError) throw new Error("Error asignando rol: " + roleError.message);
    }

    // Ensure profile exists (handles re-invited/deleted users)
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      await supabaseAdmin
        .from("profiles")
        .insert({ id: user.id, company_id: invitation.company_id, full_name: user.user_metadata?.full_name || null });
    }

    // Mark invitation as accepted
    const { error: acceptError } = await supabaseAdmin
      .from("invitations")
      .update({ accepted_at: new Date().toISOString(), used: true })
      .eq("id", invitation.id);
    if (acceptError) throw new Error("Error actualizando invitación: " + acceptError.message);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
