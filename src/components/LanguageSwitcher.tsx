import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, type Locale } from "@/i18n/LanguageContext";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const flags: Record<Locale, string> = { en: "EN", es: "ES" };

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options: { value: Locale; label: string }[] = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
  ];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl text-zinc-400 hover:text-zinc-200 hover:border-purple-500/20 transition-all duration-300 text-[12px] font-semibold tracking-wide min-h-[36px]"
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{flags[locale]}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 min-w-[140px] rounded-xl border border-white/[0.08] bg-zinc-900/90 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden z-50"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setLocale(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors duration-200 ${
                  locale === opt.value
                    ? "text-purple-400 bg-purple-500/[0.08]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                }`}
              >
                <span className="text-[11px] font-bold tracking-wider opacity-60">
                  {flags[opt.value]}
                </span>
                {opt.label}
                {locale === opt.value && (
                  <motion.div
                    layoutId="lang-check"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400"
                  />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
