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
  isOperations: boolean;
  isMember: boolean;
  isViewer: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewFinancials: boolean;
  canViewOperations: boolean;
  canManageLeads: boolean;
}

export function useUserRole(): UserRoleData {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(() => {
    if (!user) return null;
    const cached = sessionStorage.getItem(`user_role_${user.id}`);
    return (cached as AppRole) || null;
  });
  const [companyId, setCompanyId] = useState<string | null>(() => {
    if (!user) return null;
    return sessionStorage.getItem(`company_id_${user.id}`);
  });
  const [loading, setLoading] = useState(!role && user !== null);
  const resolvedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      resolvedUserIdRef.current = null;
      setRole(null);
      setCompanyId(null);
      setLoading(false);
      return;
    }

    if (resolvedUserIdRef.current === user.id && role) {
      setLoading(false);
      return;
    }

    const load = async () => {
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
        const resolvedRole = (roleResult.data?.role as AppRole) || null;
        const resolvedCompanyId = profileResult.data?.company_id || null;
        
        setRole(resolvedRole);
        setCompanyId(resolvedCompanyId);
        
        if (resolvedRole) sessionStorage.setItem(`user_role_${user.id}`, resolvedRole);
        if (resolvedCompanyId) sessionStorage.setItem(`company_id_${user.id}`, resolvedCompanyId);
      } catch (e) {
        // Silent error handling for roles
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, role]);


  const isSuperadmin = role === 'superadmin';
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isOperations = role === 'operations';
  const isMember = role === 'member';
  const isViewer = role === 'viewer';

  return {
    role,
    companyId,
    loading,
    isAdmin,
    isSuperadmin,
    isComercial: role === 'member' || role === 'sales',
    isOperations,
    isMember,
    isViewer,
    // viewer cannot edit; all other tenant roles can
    canEdit: !isViewer && role !== null,
    // only admin (includes superadmin) can delete
    canDelete: isAdmin,
    // admin or sales can see financials
    canViewFinancials: isAdmin || role === 'sales',
    // admin or operations can see operations
    canViewOperations: isAdmin || isOperations,
    // admin or sales can manage leads (assign, bulk clear)
    canManageLeads: isAdmin || role === 'sales',
  };
}
