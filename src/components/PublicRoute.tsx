import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasCompany } from "@/lib/auth-helpers";
import { getHomeRouteForUser } from "@/lib/role-redirect";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const resolvedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (loading) return;

      if (!user) {
        resolvedUserIdRef.current = null;
        setRedirectTo(null);
        setIsChecking(false);
        return;
      }

      // If already resolved for this user, reuse cached redirect
      if (resolvedUserIdRef.current === user.id) {
        setIsChecking(false);
        return;
      }

      // First-time resolution
      const homeRoute = await getHomeRouteForUser(user.id);
      if (homeRoute === "/superadmin") {
        setRedirectTo("/superadmin");
      } else {
        const userHasCompany = await hasCompany(user.id);
        setRedirectTo(userHasCompany ? "/dashboard" : "/onboarding");
      }

      resolvedUserIdRef.current = user.id;
      setIsChecking(false);
    };

    checkUserStatus();
  }, [user, loading]);

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
