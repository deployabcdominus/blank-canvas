import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const TENANT_ONLY_ROUTES = [
  "/dashboard", "/clients", "/projects", "/leads", "/proposals",
  "/payments", "/work-orders", "/production", "/installation",
  "/map-hub", "/installer-companies", "/team-management", "/taller",
  "/audit-log",
];

const ROUTE_ROLE_MAP: Record<string, string[]> = {
  '/work-orders': ['admin', 'operations', 'viewer'],
  '/installation': ['admin', 'operations', 'viewer'],
  '/installer-companies': ['admin', 'operations'],
  '/team-management': ['admin'],
  '/audit-log': ['admin'],
  '/payments': ['admin', 'sales'],
  '/leads': ['admin', 'sales', 'member'],
  '/proposals': ['admin', 'sales', 'member'],
  '/clients': ['admin', 'sales', 'operations', 'member'],
  '/projects': ['admin', 'sales', 'operations', 'member'],
  '/production': ['admin', 'operations', 'member'],
  '/taller': ['admin', 'operations', 'member'],
  '/map-hub': ['admin', 'operations', 'viewer'],
  '/settings': ['admin', 'sales', 'operations', 'member', 'viewer'],
};

/** Routes that require a specific plan feature */
const ROUTE_PLAN_MAP: Record<string, "access_portal" | "access_previews" | "access_advanced_fields" | "access_audit"> = {
  '/audit-log': 'access_audit',
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { role, isSuperadmin, loading: roleLoading, companyId } = useUserRole();
  const { canAccess } = usePlanAccess();
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = useLanguage();
  const isEn = locale === "en";

  // Imperative redirect when route changes and role is already loaded
  useEffect(() => {
    if (roleLoading || !role || isSuperadmin) return;

    for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_ROLE_MAP)) {
      if (location.pathname.startsWith(routePrefix) && !allowedRoles.includes(role)) {
        navigate('/dashboard', { replace: true });
        return;
      }
    }

    // Plan-based route blocking
    for (const [routePrefix, feature] of Object.entries(ROUTE_PLAN_MAP)) {
      if (location.pathname.startsWith(routePrefix) && !canAccess(feature)) {
        toast({
          title: isEn ? "Premium Feature" : "Función Premium",
          description: isEn ? "Your current plan does not include this feature. Upgrade your subscription to access it." : "Tu plan actual no incluye esta función. Actualiza tu suscripción para acceder.",
          variant: "destructive",
        });
        navigate('/settings?tab=suscripcion', { replace: true });
        return;
      }
    }
  }, [location.pathname, role, roleLoading, isSuperadmin, navigate, canAccess]);

  // 1. Wait for auth
  if (authLoading) {
    return <Spinner />;
  }

  // 2. Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Wait for role
  if (roleLoading) {
    return <Spinner />;
  }

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
