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
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { role, isSuperadmin, loading: roleLoading, companyId } = useUserRole();
  const location = useLocation();

  // 1. Wait for auth
  if (authLoading) {
    return <Spinner />;
  }

  // 2. Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Wait for role to load — never render children or evaluate guards
  if (roleLoading) {
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

  // 6. Role-based route blocking
  console.log('[ProtectedRoute] evaluating guard — role:', role, 'loading:', roleLoading, 'path:', location.pathname, 'isSuperadmin:', isSuperadmin);
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
