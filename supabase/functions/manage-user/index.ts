import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ManageUserSchema } from "../_shared/schemas.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const body = await req.json();
    const result = ManageUserSchema.safeParse(body);

    if (!result.success) {
      return new Response(JSON.stringify({ 
        error: "Validación fallida", 
        details: result.error.format() 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, userId, userIds, email, password, fullName, companyId, role } = result.data;

    const { data: { user: caller }, error: authError } = await callerClient.auth.getUser();
    if (authError) console.error("Auth error:", authError.message);
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("Caller:", caller.id, "Action:", action);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if caller is superadmin OR company admin
    const { data: superadminRole } = await adminClient
      .from("user_roles").select("role").eq("user_id", caller.id).eq("role", "superadmin").maybeSingle();
    const isSuperadmin = !!superadminRole;

    if (!isSuperadmin) {
      const { data: callerProfile } = await adminClient.from("profiles").select("company_id").eq("id", caller.id).maybeSingle();
      const { data: callerAdminRole } = await adminClient.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin").maybeSingle();

      if (!callerAdminRole || !callerProfile?.company_id) {
        return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "create" && companyId !== callerProfile.company_id) {
        return new Response(JSON.stringify({ error: "Cannot create users in other companies" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action !== "create" && action !== "list-company-users" && userId) {
        const { data: targetProfile } = await adminClient.from("profiles").select("company_id").eq("id", userId).maybeSingle();
        if (targetProfile?.company_id !== callerProfile.company_id) {
          return new Response(JSON.stringify({ error: "Cannot manage users from other companies" }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (role === "superadmin") {
        return new Response(JSON.stringify({ error: "Cannot assign superadmin role" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const superadminOnlyActions = ["delete-company", "list-all-users", "bulk-activate-users", "bulk-deactivate-users", "bulk-update-role", "bulk-assign-company", "bulk-remove-company"];
      if (superadminOnlyActions.includes(action)) {
        return new Response(JSON.stringify({ error: "Superadmin only" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── CREATE USER ──
    if (action === "create") {
      if (!email || !password || !fullName || !companyId || !role) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const newUserId = newUser.user.id;
      await adminClient.from("profiles").update({ company_id: companyId, full_name: fullName }).eq("id", newUserId);
      await adminClient.from("user_roles").insert({ user_id: newUserId, role });
      return new Response(JSON.stringify({ success: true, userId: newUserId }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── UPDATE ROLE ──
    if (action === "update-role") {
      if (!userId || !role) {
        return new Response(JSON.stringify({ error: "Missing userId or role" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await adminClient.from("user_roles").delete().eq("user_id", userId);
      await adminClient.from("user_roles").insert({ user_id: userId, role });
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── TOGGLE ACTIVE ──
    if (action === "toggle-active") {
      if (!userId) {
        return new Response(JSON.stringify({ error: "Missing userId" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: profile } = await adminClient.from("profiles").select("is_active").eq("id", userId).maybeSingle();
      const newStatus = !(profile?.is_active ?? true);
      await adminClient.from("profiles").update({ is_active: newStatus }).eq("id", userId);
      if (!newStatus) {
        await adminClient.auth.admin.updateUserById(userId, { ban_duration: "876600h" });
      } else {
        await adminClient.auth.admin.updateUserById(userId, { ban_duration: "none" });
      }
      return new Response(JSON.stringify({ success: true, isActive: newStatus }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── BULK ACTIVATE USERS ──
    if (action === "bulk-activate-users") {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return new Response(JSON.stringify({ error: "Missing userIds" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      for (const uid of userIds) {
        await adminClient.from("profiles").update({ is_active: true }).eq("id", uid);
        await adminClient.auth.admin.updateUserById(uid, { ban_duration: "none" });
      }
      return new Response(JSON.stringify({ success: true, count: userIds.length }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── BULK DEACTIVATE USERS ──
    if (action === "bulk-deactivate-users") {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return new Response(JSON.stringify({ error: "Missing userIds" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      for (const uid of userIds) {
        await adminClient.from("profiles").update({ is_active: false }).eq("id", uid);
        await adminClient.auth.admin.updateUserById(uid, { ban_duration: "876600h" });
      }
      return new Response(JSON.stringify({ success: true, count: userIds.length }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── BULK UPDATE ROLE ──
    if (action === "bulk-update-role") {
      if (!userIds || !Array.isArray(userIds) || !role) {
        return new Response(JSON.stringify({ error: "Missing userIds or role" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      for (const uid of userIds) {
        await adminClient.from("user_roles").delete().eq("user_id", uid);
        await adminClient.from("user_roles").insert({ user_id: uid, role });
      }
      return new Response(JSON.stringify({ success: true, count: userIds.length }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── BULK ASSIGN COMPANY ──
    if (action === "bulk-assign-company") {
      if (!userIds || !Array.isArray(userIds) || !companyId) {
        return new Response(JSON.stringify({ error: "Missing userIds or companyId" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      for (const uid of userIds) {
        await adminClient.from("profiles").update({ company_id: companyId }).eq("id", uid);
      }
      return new Response(JSON.stringify({ success: true, count: userIds.length }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── BULK REMOVE COMPANY ──
    if (action === "bulk-remove-company") {
      if (!userIds || !Array.isArray(userIds)) {
        return new Response(JSON.stringify({ error: "Missing userIds" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      for (const uid of userIds) {
        await adminClient.from("profiles").update({ company_id: null }).eq("id", uid);
      }
      return new Response(JSON.stringify({ success: true, count: userIds.length }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── LIST COMPANY USERS ──
    if (action === "list-company-users") {
      if (!companyId) {
        return new Response(JSON.stringify({ error: "Missing companyId" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: profiles } = await adminClient.from("profiles").select("id, full_name, company_id, is_active, avatar_url, created_at").eq("company_id", companyId);
      const uids = (profiles || []).map(p => p.id);
      if (uids.length === 0) {
        return new Response(JSON.stringify({ users: [] }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: roles } = await adminClient.from("user_roles").select("user_id, role").in("user_id", uids);
      const usersWithEmail = await Promise.all(uids.map(async (uid) => {
        const { data } = await adminClient.auth.admin.getUserById(uid);
        return { id: uid, email: data?.user?.email || "" };
      }));
      const result = (profiles || []).map(p => ({
        ...p, role: roles?.find(r => r.user_id === p.id)?.role || "viewer",
        email: usersWithEmail.find(u => u.id === p.id)?.email || "",
      }));
      return new Response(JSON.stringify({ users: result }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── LIST ALL USERS (superadmin only) ──
    if (action === "list-all-users") {
      const { data: allProfiles } = await adminClient.from("profiles").select("id, full_name, company_id, is_active, created_at").order("created_at", { ascending: false });
      const uids = (allProfiles || []).map(p => p.id);
      if (uids.length === 0) {
        return new Response(JSON.stringify({ users: [] }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: allRoles } = await adminClient.from("user_roles").select("user_id, role").in("user_id", uids);
      const { data: allCompanies } = await adminClient.from("companies").select("id, name");
      const usersWithEmail = await Promise.all(uids.map(async (uid) => {
        const { data } = await adminClient.auth.admin.getUserById(uid);
        return { id: uid, email: data?.user?.email || "" };
      }));
      const companyMap = Object.fromEntries((allCompanies || []).map(c => [c.id, c.name]));
      const result = (allProfiles || []).map(p => ({
        ...p, role: allRoles?.find(r => r.user_id === p.id)?.role || "—",
        email: usersWithEmail.find(u => u.id === p.id)?.email || "",
        company_name: p.company_id ? (companyMap[p.company_id] || "—") : "Sin empresa",
      }));
      return new Response(JSON.stringify({ users: result }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DELETE COMPANY (superadmin only) ──
    if (action === "delete-company") {
      if (!companyId) {
        return new Response(JSON.stringify({ error: "Missing companyId" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: companyProfiles } = await adminClient.from("profiles").select("id").eq("company_id", companyId);
      const userIdsToClean = (companyProfiles || []).map(p => p.id);

      await adminClient.from("payments").delete().eq("company_id", companyId);
      await adminClient.from("production_orders").delete().eq("company_id", companyId);
      const { data: companyProposals } = await adminClient.from("proposals").select("id").eq("company_id", companyId);
      if (companyProposals && companyProposals.length > 0) {
        await adminClient.from("payments").delete().in("proposal_id", companyProposals.map(p => p.id));
      }
      await adminClient.from("proposals").delete().eq("company_id", companyId);
      await adminClient.from("leads").delete().eq("company_id", companyId);
      // Soft-delete projects instead of hard delete
      await adminClient.from("projects").update({ deleted_at: new Date().toISOString() }).eq("company_id", companyId);
      await adminClient.from("clients").delete().eq("company_id", companyId);
      await adminClient.from("invitations").delete().eq("company_id", companyId);
      await adminClient.from("purchases").delete().eq("company_id", companyId);

      if (userIdsToClean.length > 0) {
        await adminClient.from("user_roles").delete().in("user_id", userIdsToClean);
        await adminClient.from("profiles").update({ company_id: null }).in("id", userIdsToClean);
      }

      const { error: deleteError } = await adminClient.from("companies").delete().eq("id", companyId);
      if (deleteError) {
        console.error("Delete company error:", deleteError);
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── REMOVE USER FROM COMPANY (tenant admin) ──
    if (action === "remove-from-company") {
      if (!userId) {
        return new Response(JSON.stringify({ error: "Missing userId" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (userId === caller.id) {
        return new Response(JSON.stringify({ error: "Cannot remove yourself" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Remove company association and role
      await adminClient.from("profiles").update({ company_id: null }).eq("id", userId);
      await adminClient.from("user_roles").delete().eq("user_id", userId);
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── RESET PASSWORD (superadmin only) ──
    if (action === "reset-password") {
      if (!isSuperadmin) {
        return new Response(JSON.stringify({ error: "Superadmin only" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!userId || !password) {
        return new Response(JSON.stringify({ error: "Missing userId or password" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error: resetError } = await adminClient.auth.admin.updateUserById(userId, { password });
      if (resetError) {
        return new Response(JSON.stringify({ error: resetError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DELETE USER (superadmin only) ──
    if (action === "delete-user") {
      if (!isSuperadmin) {
        return new Response(JSON.stringify({ error: "Superadmin only" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!userId) {
        return new Response(JSON.stringify({ error: "Missing userId" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Prevent self-deletion
      if (userId === caller.id) {
        return new Response(JSON.stringify({ error: "Cannot delete yourself" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Clean up related data
      await adminClient.from("user_roles").delete().eq("user_id", userId);
      await adminClient.from("user_settings").delete().eq("user_id", userId);
      await adminClient.from("profiles").delete().eq("id", userId);
      // Delete from auth
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteError) {
        console.error("Delete user error:", deleteError);
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
