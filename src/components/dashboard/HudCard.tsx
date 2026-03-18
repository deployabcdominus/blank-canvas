import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

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

export const HudCard = ({ label, desc, value, icon: Icon, isActive, onClick, index }: HudCardProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, type: "spring" }}
      onClick={onClick}
      className={`
        stat-card relative overflow-hidden text-left group
        rounded-2xl border p-5 transition-all duration-300 shimmer-hover
        backdrop-blur-2xl
        ${isActive
          ? "border-primary/25 bg-zinc-900/60"
          : "border-white/[0.06] bg-zinc-900/40 hover:border-white/[0.10] hover:bg-zinc-900/50"
        }
      `}
    >
      {/* Top glow line */}
      {isActive && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px opacity-40 bg-gradient-to-r from-transparent via-primary to-transparent" />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
              isActive ? "bg-primary/10" : "bg-white/[0.04]"
            }`}
          >
            <Icon
              className={`transition-colors ${isActive ? "text-primary" : "text-zinc-400"}`}
              size={20}
              strokeWidth={1.5}
            />
          </div>
          {isActive && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Filtrado
            </span>
          )}
        </div>

        <AnimatedCounter value={value} className="font-semibold text-[32px] leading-none tracking-tight text-zinc-100" />
        <p className="text-sm font-medium mt-2 text-zinc-100">{label}</p>
        <p className="text-xs mt-0.5 text-zinc-400">{desc}</p>
      </div>
    </motion.button>
  );
};
