import { supabase } from '@/integrations/supabase/client';

/**
 * Shared helper to resolve the current user's company_id.
 * Eliminates the duplicated getCompanyId pattern across all contexts.
 */
export async function resolveCompanyId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userId)
    .maybeSingle();
  if (data?.company_id) return data.company_id;

  // Fallback: check if user owns a company directly
  const { data: comp } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (comp?.id) {
    // Backfill profile for future lookups
    await supabase.from('profiles').update({ company_id: comp.id }).eq('id', userId);
    return comp.id;
  }
  return null;
}
