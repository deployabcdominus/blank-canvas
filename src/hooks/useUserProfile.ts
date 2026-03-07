import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfile {
  fullName: string;
  email: string;
  initials: string;
}

/**
 * Resolves user display name and email from auth metadata + profiles table.
 * Replaces all localStorage.getItem('userName') / localStorage.getItem('userEmail') usage.
 */
export function useUserProfile(): UserProfile {
  const { user } = useAuth();
  const [fullName, setFullName] = useState<string>(() => {
    return user?.user_metadata?.full_name || "Usuario";
  });

  const email = user?.email || "";

  useEffect(() => {
    if (!user) {
      setFullName("Usuario");
      return;
    }

    // Use metadata first (instant)
    const metaName = user.user_metadata?.full_name;
    if (metaName) {
      setFullName(metaName);
    }

    // Then hydrate from profiles for accuracy
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) {
          setFullName(data.full_name);
        }
      });
  }, [user?.id]);

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return { fullName, email, initials };
}
