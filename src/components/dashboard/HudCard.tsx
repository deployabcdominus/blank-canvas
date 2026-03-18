import { useEffect, useRef, useState } from "react";
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
  noAccess?: boolean;
}

export const HudCard = ({ label, desc, value, icon: Icon, isActive, onClick, index, noAccess }: HudCardProps) => {
  const [glowPulse, setGlowPulse] = useState(false);
  const prevValue = useRef(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValue.current = value;
      return;
    }
    if (prevValue.current !== value) {
      setGlowPulse(true);
      const t = setTimeout(() => setGlowPulse(false), 2000);
      prevValue.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  // Detect 0→1 transition for special entrance
  const wasZero = useRef(value === 0);
  const showEntrance = wasZero.current && value > 0;
  if (value > 0) wasZero.current = false;
  if (value === 0) wasZero.current = true;

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{
        opacity: 1,
        y: 0,
        ...(showEntrance ? { scale: [0.9, 1.05, 1] } : {}),
      }}
      transition={{ delay: index * 0.08, duration: 0.5, type: "spring" }}
      onClick={onClick}
      className={`
        stat-card relative overflow-hidden text-left group
        rounded-2xl border p-5 transition-all duration-300 shimmer-hover
        backdrop-blur-2xl
        ${glowPulse
          ? "border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.25)]"
          : isActive
            ? "border-primary/25 bg-zinc-900/60"
            : "border-white/[0.06] bg-zinc-900/40 hover:border-white/[0.10] hover:bg-zinc-900/50"
        }
      `}
      style={{
        transition: "border-color 0.5s ease, box-shadow 1s ease",
      }}
    >
      {/* Top glow line — active filter or pulse */}
      {(isActive || glowPulse) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: glowPulse ? 0.7 : 0.4 }}
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent ${
            glowPulse ? "via-violet-500" : "via-primary"
          } to-transparent`}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
              glowPulse
                ? "bg-violet-500/15"
                : isActive ? "bg-primary/10" : "bg-white/[0.04]"
            }`}
          >
            <Icon
              className={`transition-colors ${
                glowPulse
                  ? "text-violet-400"
                  : isActive ? "text-primary" : "text-zinc-400"
              }`}
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
