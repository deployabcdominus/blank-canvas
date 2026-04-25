import { useLanguage, type Locale } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";

const OPTIONS: { value: Locale; label: string; short: string }[] = [
  { value: "es", label: "Español", short: "ES" },
  { value: "en", label: "English", short: "EN" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div className={`relative flex items-center bg-white/5 border border-white/10 rounded-full p-1 ${className}`}>
      {/* Active Indicator Background */}
      <motion.div
        className="absolute h-[calc(100%-8px)] rounded-full bg-primary/20 border border-primary/30"
        initial={false}
        animate={{
          left: locale === "es" ? "4px" : "50%",
          width: "calc(50% - 4px)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      
      {OPTIONS.map((opt) => {
        const isActive = locale === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setLocale(opt.value)}
            className={`relative z-10 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full transition-colors duration-200 min-w-[50px]
              ${isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-white"}`}
            aria-label={`Switch to ${opt.label}`}
          >
            <span className="text-xs font-bold tracking-wider">{opt.short}</span>
          </button>
        );
      })}
    </div>
  );
}
