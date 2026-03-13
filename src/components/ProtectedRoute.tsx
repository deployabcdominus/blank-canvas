import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const TENANT_ONLY_ROUTES = [
  "/dashboard", "/clients", "/projects", "/leads", "/proposals",
  "/payments", "/work-orders", "/production", "/installation",
  "/map-hub", "/installer-companies", "/team-management",
];

const ROUTE_ROLE_MAP: Record<string, string[]> = {
  '/work-orders': ['admin', 'operations', 'viewer'],
  '/installation': ['admin', 'operations', 'viewer'],
  '/installer-companies': ['admin', 'operations'],
  '/team-management': ['admin'],
  '/payments': ['admin', 'sales'],
  '/leads': ['admin', 'sales', 'member'],
  '/proposals': ['admin', 'sales', 'member'],
  '/clients': ['admin', 'sales', 'operations', 'member'],
  '/projects': ['admin', 'sales', 'operations', 'member'],
  '/production': ['admin', 'operations'],
  '/map-hub': ['admin', 'operations', 'viewer'],
  '/settings': ['admin', 'sales', 'operations', 'member', 'viewer'],
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { role, isSuperadmin, loading: roleLoading, companyId } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();

  // Imperative redirect when route changes and role is already loaded
  useEffect(() => {
    if (roleLoading || !role || isSuperadmin) return;

    console.log('[ProtectedRoute] useEffect guard — role:', role, 'path:', location.pathname);

    for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_ROLE_MAP)) {
      if (location.pathname.startsWith(routePrefix) && !allowedRoles.includes(role)) {
        console.log('[ProtectedRoute] BLOCKED — redirecting to /dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }
    }
  }, [location.pathname, role, roleLoading, isSuperadmin, navigate]);

  // 1. Wait for auth
  if (authLoading) {
    return <Spinner />;
  }

  // 2. Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Wait for role — MUST be before any role-based guard
  if (roleLoading) {
    return <Spinner />;
  }

  // Defensive guard: if role is not resolved yet, keep waiting to avoid
  // transient redirects (e.g. superadmin briefly evaluated as non-superadmin)
  if (!isSuperadmin && role === null) {
    return <Spinner />;
  }

  // 4. Superadmin cannot access tenant routes
  if (isSuperadmin && TENANT_ONLY_ROUTES.some(r => location.pathname.startsWith(r))) {
    return <Navigate to="/superadmin" replace />;
  }

  // 5. Non-superadmin without company → onboarding
  if (!isSuperadmin && !companyId) {
    return <Navigate to="/onboarding" replace />;
  }

  // 6. Role-based route blocking (render-time fallback)
  console.log('[ProtectedRoute] render guard — role:', role, 'loading:', roleLoading, 'path:', location.pathname, 'isSuperadmin:', isSuperadmin);
  if (role && !isSuperadmin) {
    for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_ROLE_MAP)) {
      if (location.pathname.startsWith(routePrefix) && !allowedRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return <>{children}</>;
};

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
