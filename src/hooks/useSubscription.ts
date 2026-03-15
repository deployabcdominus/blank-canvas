import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionState {
  subscribed: boolean;
  tier: string;
  subscriptionStatus: string;
  subscriptionEnd: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
}

export function useSubscription(): SubscriptionState {
  const { session } = useAuth();
  const [state, setState] = useState<Omit<SubscriptionState, "loading" | "checkSubscription">>({
    subscribed: false,
    tier: "start",
    subscriptionStatus: "none",
    subscriptionEnd: null,
  });
  const [loading, setLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data) {
        setState({
          subscribed: data.subscribed ?? false,
          tier: data.tier ?? "start",
          subscriptionStatus: data.subscription_status ?? "none",
          subscriptionEnd: data.subscription_end ?? null,
        });
      }
    } catch (e) {
      console.error("Error checking subscription:", e);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  // Check on mount and every 60 seconds
  useEffect(() => {
    if (!session) return;
    checkSubscription();
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [session, checkSubscription]);

  return { ...state, loading, checkSubscription };
}
