import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, companyName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // Track the current user ID to avoid unnecessary re-renders on TOKEN_REFRESHED
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let initialLoadDone = false;

    const updateAuthState = (newSession: Session | null) => {
      if (!isMounted) return;
      const newUserId = newSession?.user?.id ?? null;

      // Only update user/session references if the user actually changed
      // This prevents all downstream useEffect([user]) from re-firing on TOKEN_REFRESHED
      if (newUserId !== currentUserIdRef.current) {
        currentUserIdRef.current = newUserId;
        setSession(newSession);
        setUser(newSession?.user ?? null);
      } else if (newSession && newUserId) {
        // Same user — silently update session (for fresh token) without changing user ref
        setSession(newSession);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT') {
          currentUserIdRef.current = null;
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        updateAuthState(session);

        // Only set loading=false on initial load; subsequent events stay silent
        if (!initialLoadDone) {
          initialLoadDone = true;
          setLoading(false);
        }
      }
    );

    // Initial session check — validate user only once on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;

      if (session) {
        const { data, error } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (error || !data?.user) {
          await supabase.auth.signOut();
          localStorage.clear();
          currentUserIdRef.current = null;
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
      }

      currentUserIdRef.current = session?.user?.id ?? null;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, companyName: string) => {
    const redirectUrl = `${window.location.origin}/onboarding`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          company_name: companyName,
        }
      }
    });

    if (error) {
      toast({
        title: "Error al crear cuenta",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signOut errors (e.g. user already deleted)
    }
    localStorage.clear();
    currentUserIdRef.current = null;
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};
