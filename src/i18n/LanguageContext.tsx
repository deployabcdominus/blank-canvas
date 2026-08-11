import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { en, type TranslationKeys } from "./en";
import { es } from "./es";
import { supabase } from "@/integrations/supabase/client";
import { validateTranslations } from "./audit";

export type Locale = "en" | "es";

interface LanguageContextType {
  locale: Locale;
  t: TranslationKeys;
  setLocale: (locale: Locale) => void;
}

const dictionaries: Record<Locale, TranslationKeys> = { en, es };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

/** Shorthand hook — returns just the translation object */
export function useT() {
  return useLanguage().t;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Default to 'en' unless explicitly stored
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sf_lang") as Locale | null;
      if (stored === "en" || stored === "es") return stored;
    }
    return "en";
  });

  // Load preference from profile on login
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("language_preference")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        const pref = data?.language_preference;
        if (pref === "en" || pref === "es") {
          setLocaleState(pref);
          localStorage.setItem("sf_lang", pref);
        }
      });
  }, [userId]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale);
      localStorage.setItem("sf_lang", newLocale);
      document.documentElement.lang = newLocale;

      // Persist to profile if logged in
      if (userId) {
        supabase
          .from("profiles")
          .update({ language_preference: newLocale })
          .eq("id", userId)
          .then();
      }
    },
    [userId]
  );

  // Set html lang attribute and update meta tags
  useEffect(() => {
    document.documentElement.lang = locale;
    const t = dictionaries[locale];
    
    // Update title
    document.title = (t.seo as any)?.title || "SignFlow";
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", (t.seo as any)?.description || "");
    
    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", (t.seo as any)?.title || "SignFlow");
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", (t.seo as any)?.description || "");
    
    // Update Twitter tags
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", (t.seo as any)?.title || "SignFlow");
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", (t.seo as any)?.description || "");
    if (import.meta.env.DEV) {
      validateTranslations();
    }
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, t: dictionaries[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}
