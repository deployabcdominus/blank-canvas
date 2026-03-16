import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { en, type TranslationKeys } from "./en";
import { es } from "./es";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();

  // Default to browser language or 'en'
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem("sf_lang") as Locale | null;
    if (stored === "en" || stored === "es") return stored;
    const browserLang = navigator.language.slice(0, 2);
    return browserLang === "es" ? "es" : "en";
  });

  // Load preference from profile on login
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("language_preference")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const pref = (data as any)?.language_preference as string | null;
        if (pref === "en" || pref === "es") {
          setLocaleState(pref);
          localStorage.setItem("sf_lang", pref);
        }
      });
  }, [user?.id]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale);
      localStorage.setItem("sf_lang", newLocale);
      document.documentElement.lang = newLocale;

      // Persist to profile if logged in
      if (user) {
        supabase
          .from("profiles")
          .update({ language_preference: newLocale } as any)
          .eq("id", user.id)
          .then();
      }
    },
    [user]
  );

  // Set html lang attribute and update meta tags
  useEffect(() => {
    document.documentElement.lang = locale;
    const t = dictionaries[locale];
    
    // Update title
    document.title = t.seo.title;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t.seo.description);
    
    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", t.seo.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", t.seo.description);
    
    // Update Twitter tags
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", t.seo.title);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", t.seo.description);
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, t: dictionaries[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}
