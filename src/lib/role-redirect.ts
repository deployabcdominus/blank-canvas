import { supabase } from "@/integrations/supabase/client";

/**
 * Determines the correct home route for the current user based on their role.
 * Superadmins go to /superadmin, tenant users go to /dashboard.
 */
export async function getHomeRouteForUser(userId: string): Promise<string> {
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (roleData?.role === "superadmin") {
    return "/superadmin";
  }

  return "/dashboard";
}
