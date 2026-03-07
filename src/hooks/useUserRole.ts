import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'superadmin' | 'admin' | 'sales' | 'operations' | 'member' | 'viewer';

interface UserRoleData {
  role: AppRole | null;
  companyId: string | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperadmin: boolean;
  isComercial: boolean;
}

export function useUserRole(): UserRoleData {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Cache resolved user ID to skip re-fetching on stable user ref
  const resolvedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      resolvedUserIdRef.current = null;
      setRole(null);
      setCompanyId(null);
      setLoading(false);
      return;
    }

    // If already resolved for this user, skip DB calls
    if (resolvedUserIdRef.current === user.id) {
      return;
    }

    const load = async () => {
      // Don't set loading=true if we already have data — prevents flash
      if (!resolvedUserIdRef.current) {
        setLoading(true);
      }
      try {
        const [roleResult, profileResult] = await Promise.all([
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle(),
          supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .maybeSingle(),
        ]);

        resolvedUserIdRef.current = user.id;
        setRole((roleResult.data?.role as AppRole) || null);
        setCompanyId(profileResult.data?.company_id || null);
      } catch (e) {
        console.error('Error loading user role:', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  return {
    role,
    companyId,
    loading,
    isAdmin: role === 'admin' || role === 'superadmin',
    isSuperadmin: role === 'superadmin',
    isComercial: role === 'member' || role === 'sales',
  };
}
