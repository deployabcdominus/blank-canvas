import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface HudCardProps {
  label: string;
  desc: string;
  value: number;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
  index: number;
  accentClass?: string;
}

const ACCENT_MAP: Record<string, { bg: string; color: string }> = {
  "hud-indigo":  { bg: "rgba(91, 106, 242, 0.12)",  color: "#5B6AF2" },
  "hud-amber":   { bg: "rgba(217, 119, 6, 0.12)",   color: "#D97706" },
  "hud-cyan":    { bg: "rgba(14, 165, 233, 0.12)",   color: "#0EA5E9" },
  "hud-green":   { bg: "rgba(22, 163, 74, 0.12)",    color: "#16A34A" },
  // Legacy fallbacks
  "hud-violet":  { bg: "rgba(91, 106, 242, 0.12)",   color: "#5B6AF2" },
};

export const HudCard = ({ label, desc, value, icon: Icon, isActive, onClick, index, accentClass = "hud-indigo" }: HudCardProps) => {
  const accent = ACCENT_MAP[accentClass] || ACCENT_MAP["hud-indigo"];

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, type: "spring" }}
      onClick={onClick}
      className={`
        stat-card relative overflow-hidden text-left group
        dash-card card-interactive p-5
        ${isActive ? "ring-2 ring-primary/40 shadow-lg" : ""}
      `}
    >
      {/* Top glow accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)` }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div
            className="w-10 h-10 flex items-center justify-center rounded-[10px]"
            style={{
              background: accent.bg,
            }}
          >
            <Icon className="w-5 h-5" style={{ color: accent.color }} />
          </div>
          {isActive && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: accent.bg, color: accent.color }}
            >
              Filtrado
            </span>
          )}
        </div>

        <p className="font-extrabold text-[32px] leading-none tracking-tight text-foreground">{value}</p>
        <p className="text-sm font-semibold mt-2 text-foreground">{label}</p>
        <p className="text-xs mt-0.5 text-muted-foreground">{desc}</p>
      </div>
    </motion.button>
  );
};
