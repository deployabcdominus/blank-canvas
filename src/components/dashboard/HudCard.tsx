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

export const HudCard = ({ label, desc, value, icon: Icon, isActive, onClick, index, accentClass = "hud-cyan" }: HudCardProps) => {
  const accentColor = accentClass === "hud-violet" ? "rgba(162,89,255,0.5)" : "rgba(0,210,255,0.5)";
  const glowColor = accentClass === "hud-violet" ? "rgba(162,89,255,0.15)" : "rgba(0,210,255,0.15)";

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, type: "spring" }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl text-left transition-all duration-300 group
        backdrop-blur-[24px] border p-5
        ${isActive
          ? "scale-[1.03] shadow-2xl"
          : "hover:scale-[1.01] hover:shadow-xl"
        }
      `}
      style={{
        background: "rgba(15,18,30,0.55)",
        borderColor: isActive ? accentColor : "rgba(255,255,255,0.08)",
        boxShadow: isActive ? `0 0 32px -4px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)` : "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="hud-scan-line" />
      </div>

      {/* Top glow accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div
            className="p-2 rounded-xl border"
            style={{
              background: glowColor,
              borderColor: `${accentColor}40`,
            }}
          >
            <Icon className="w-4 h-4" style={{ color: accentColor.replace("0.5", "1") }} />
          </div>
          {isActive && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: glowColor, color: accentColor.replace("0.5", "1") }}
            >
              Filtrado
            </span>
          )}
        </div>

        <p className="font-bold text-3xl tracking-tight text-white/90">{value}</p>
        <p className="text-sm font-medium mt-1 text-white/80">{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
      </div>
    </motion.button>
  );
};
