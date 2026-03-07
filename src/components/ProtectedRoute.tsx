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

// Module-level cache shared across all ProtectedRoute instances
// Prevents re-querying role on every route change
let cachedUserId: string | null = null;
let cachedRole: string | null = null;
let cachedHasCompany: boolean | null = null;

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  // Start as false if we already have cached data for this user
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
        const isSuperadmin = cachedRole === 'superadmin';
        if (isSuperadmin && TENANT_ONLY_ROUTES.some(r => location.pathname.startsWith(r))) {
          setRedirectTo('/superadmin');
        } else if (!isSuperadmin && cachedHasCompany === false) {
          setRedirectTo('/onboarding');
        } else {
          setRedirectTo(null);
        }
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

      if (isSuperadmin && TENANT_ONLY_ROUTES.some(r => location.pathname.startsWith(r))) {
        setRedirectTo('/superadmin');
        setIsChecking(false);
        return;
      }

      if (!isSuperadmin && !userHasCompany) {
        setRedirectTo('/onboarding');
        setIsChecking(false);
        return;
      }

      setRedirectTo(null);
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
