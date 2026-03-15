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

/* All icons render in zinc-400 by default; active state uses orange primary */
export const HudCard = ({ label, desc, value, icon: Icon, isActive, onClick, index }: HudCardProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, type: "spring" }}
      onClick={onClick}
      className={`
        stat-card relative overflow-hidden text-left group
        rounded-xl border p-5 transition-all duration-200 shimmer-hover
        ${isActive
          ? "border-primary/30 bg-primary/[0.06] shadow-[0_0_20px_-6px_hsl(25_95%_53%/0.25)]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
        }
      `}
    >
      {/* Top glow line */}
      {isActive && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px opacity-50 bg-gradient-to-r from-transparent via-primary to-transparent" />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
              isActive ? "bg-primary/10" : "bg-white/[0.04]"
            }`}
          >
            <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-zinc-400"}`} />
          </div>
          {isActive && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Filtrado
            </span>
          )}
        </div>

        <p className="font-extrabold text-[32px] leading-none tracking-tight text-foreground">{value}</p>
        <p className="text-sm font-semibold mt-2 text-foreground">{label}</p>
        <p className="text-xs mt-0.5 text-zinc-500">{desc}</p>
      </div>
    </motion.button>
  );
};
