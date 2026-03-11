import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasCompany } from "@/lib/auth-helpers";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Tenant-only routes that superadmin should NOT access
const TENANT_ONLY_ROUTES = [
  "/dashboard", "/clients", "/projects", "/leads", "/proposals",
  "/payments", "/work-orders", "/production", "/installation",
  "/map-hub", "/installer-companies", "/team-management",
];

// Role-based route restrictions (roles that CAN access each route)
const ROUTE_ROLE_MAP: Record<string, string[]> = {
  '/settings': ['admin', 'superadmin', 'sales', 'operations', 'member', 'viewer'],
  '/team-management': ['admin', 'superadmin'],
  '/payments': ['admin', 'sales', 'superadmin'],
  '/leads': ['admin', 'sales', 'member', 'superadmin'],
  '/proposals': ['admin', 'sales', 'member', 'superadmin'],
  '/clients': ['admin', 'sales', 'operations', 'member', 'superadmin'],
  '/projects': ['admin', 'sales', 'operations', 'member', 'superadmin'],
  '/work-orders': ['admin', 'operations', 'viewer', 'superadmin'],
  '/installation': ['admin', 'operations', 'viewer', 'superadmin'],
  '/installer-companies': ['admin', 'operations', 'superadmin'],
};

// Module-level cache shared across all ProtectedRoute instances
let cachedUserId: string | null = null;
let cachedRole: string | null = null;
let cachedHasCompany: boolean | null = null;

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(() => {
    if (!user) return true;
    return cachedUserId !== user.id;
  });
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      if (!user) {
        cachedUserId = null;
        cachedRole = null;
        cachedHasCompany = null;
        setRedirectTo('/login');
        setIsChecking(false);
        return;
      }

      // If already resolved for this user, skip DB calls — just re-check route
      if (cachedUserId === user.id) {
        const redirect = getRedirectForRole(cachedRole, cachedHasCompany!, location.pathname);
        setRedirectTo(redirect);
        setIsChecking(false);
        return;
      }

      // First-time resolution for this user
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      const role = roleData?.role || null;
      const isSuperadmin = role === 'superadmin';

      let userHasCompany = true;
      if (!isSuperadmin) {
        userHasCompany = await hasCompany(user.id);
      }

      // Cache results
      cachedUserId = user.id;
      cachedRole = role;
      cachedHasCompany = userHasCompany;

      const redirect = getRedirectForRole(role, userHasCompany, location.pathname);
      setRedirectTo(redirect);
      setIsChecking(false);
    };

    checkAccess();
  }, [user, loading, location.pathname]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

function getRedirectForRole(role: string | null, userHasCompany: boolean, pathname: string): string | null {
  const isSuperadmin = role === 'superadmin';

  // Superadmin cannot access tenant routes
  if (isSuperadmin && TENANT_ONLY_ROUTES.some(r => pathname.startsWith(r))) {
    return '/superadmin';
  }

  // Non-superadmin without company → onboarding
  if (!isSuperadmin && !userHasCompany) {
    return '/onboarding';
  }

  // Role-based route blocking
  if (role && !isSuperadmin) {
    for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_ROLE_MAP)) {
      if (pathname.startsWith(routePrefix) && !allowedRoles.includes(role)) {
        return '/dashboard';
      }
    }
  }

  return null;
}
