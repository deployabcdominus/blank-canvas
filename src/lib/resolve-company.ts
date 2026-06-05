import { supabase } from '@/integrations/supabase/client';

// Simple in-memory cache for the current session
const companyCache = new Map<string, string>();

/**
 * Shared helper to resolve the current user's company_id.
 * Caches the result to avoid redundant DB calls on every provider mount.
 */
export async function resolveCompanyId(userId: string): Promise<string | null> {
  // 1. Check in-memory cache
  if (companyCache.has(userId)) {
    return companyCache.get(userId)!;
  }

  // 2. Check SessionStorage (survives page reloads)
  const cached = sessionStorage.getItem(`company_id_${userId}`);
  if (cached) {
    companyCache.set(userId, cached);
    return cached;
  }

  // 3. Resolve from Supabase
  const { data } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userId)
    .maybeSingle();

  let companyId = data?.company_id;

  if (!companyId) {
    // Fallback: check if user owns a company directly
    const { data: comp } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (comp?.id) {
      companyId = comp.id;
      // Backfill profile for future lookups
      await supabase.from('profiles').update({ company_id: companyId }).eq('id', userId);
    }
  }

  // 4. Update caches if resolved
  if (companyId) {
    companyCache.set(userId, companyId);
    sessionStorage.setItem(`company_id_${userId}`, companyId);
  }

  return companyId || null;
}

/**
 * Clears the company cache. Call this on logout.
 */
export function clearCompanyCache(userId?: string) {
  if (userId) {
    companyCache.delete(userId);
    sessionStorage.removeItem(`company_id_${userId}`);
  } else {
    companyCache.clear();
    // Clear all company_id entries from sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('company_id_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
}
