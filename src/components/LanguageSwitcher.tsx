import { useLanguage, type Locale } from "@/i18n/LanguageContext";

const OPTIONS: { value: Locale; flag: string; label: string }[] = [
  { value: "es", flag: "🇪🇸", label: "Español" },
  { value: "en", flag: "🇺🇸", label: "English" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {OPTIONS.map((opt) => {
        const isActive = locale === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setLocale(opt.value)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: isActive ? "rgba(139,92,246,0.2)" : "transparent",
              border: isActive ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.1)",
              color: isActive ? "rgb(196,181,253)" : "rgb(113,113,122)",
            }}
            onMouseEnter={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "rgb(212,212,216)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "rgb(113,113,122)";
            }}
            aria-label={`Switch to ${opt.label}`}
          >
            <span>{opt.flag}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
