import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a user has a company assigned (either self-service or manually provisioned).
 * Uses profiles.company_id as the single source of truth.
 */
export async function hasCompany(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      if (import.meta.env.DEV) console.error('Error checking company:', error);
      return false;
    }

    return !!data?.company_id;
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error checking company:', error);
    return false;
  }
}
