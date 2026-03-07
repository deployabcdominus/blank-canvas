import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasCompany } from "@/lib/auth-helpers";

interface OnboardingGateProps {
  children: React.ReactNode;
}

export const OnboardingGate = ({ children }: OnboardingGateProps) => {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (loading) return;

      if (!user) {
        setRedirectTo('/login');
        setIsChecking(false);
        return;
      }

      // Check if user already has a company (completed onboarding)
      const userHasCompany = await hasCompany(user.id);

      if (userHasCompany) {
        // Company exists - already completed onboarding
        setRedirectTo('/dashboard');
        setIsChecking(false);
        return;
      }

      setIsChecking(false);
    };

    checkOnboarding();
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
