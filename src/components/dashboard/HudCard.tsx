import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { useLanguage } from "@/i18n/LanguageContext";

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
  delta?: number;
  sparkline?: number[];
}

const PLACEHOLDER_SPARKLINE = [2, 4, 1, 6, 3, 5, 2];

const Sparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-4 mt-2">
      {data.map((v, i) => {
        const isToday = i === data.length - 1;
        const heightPct = Math.max(0.15, v / max);
        return (
          <div
            key={i}
            className="rounded-sm flex-1"
            style={{
              height: `${Math.round(heightPct * 16)}px`,
              background: `rgba(139,92,246,${isToday ? 1.0 : 0.35})`,
            }}
          />
        );
      })}
    </div>
  );
};

const TrendDelta = ({ delta }: { delta: number }) => {
  if (delta === 0) {
    return (
      <span className="flex items-center gap-0.5 text-[11px] text-zinc-500">
        <Minus className="w-3 h-3" />
        0%
      </span>
    );
  }
  const isUp = delta > 0;
  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-medium ${isUp ? "text-emerald-400" : "text-red-400"}`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isUp ? "+" : ""}{delta}%
    </span>
  );
};

export const HudCard = ({ label, desc, value, icon: Icon, isActive, onClick, index, noAccess, delta, sparkline }: HudCardProps) => {
  const { t } = useLanguage();
  const [glowPulse, setGlowPulse] = useState(false);
  const prevValue = useRef(value);
  const isFirstRender = useRef(true);
  const bars = sparkline ?? PLACEHOLDER_SPARKLINE;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValue.current = value;
      return;
    }
    if (prevValue.current !== value) {
      setGlowPulse(true);
      const timer = setTimeout(() => setGlowPulse(false), 2000);
      prevValue.current = value;
      return () => clearTimeout(timer);
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
        rounded-[10px] border transition-all duration-300 shimmer-hover
        backdrop-blur-2xl
        ${glowPulse
          ? "border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.25)]"
          : isActive
            ? "border-primary/25 bg-[rgba(139,92,246,0.04)]"
            : "border-white/[0.06] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.04)]"
        }
      `}
      style={{
        padding: "16px",
        borderLeft: `2px solid rgba(139,92,246,${isActive || glowPulse ? "0.6" : "0.4"})`,
        transition: "border-color 0.5s ease, box-shadow 1s ease, background 0.3s ease",
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
        {/* Row 1: Icon badge top-right */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1" />
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.2)",
              padding: "6px",
            }}
          >
            <Icon
              className={`transition-colors ${glowPulse ? "text-violet-400" : isActive ? "text-primary" : "text-[#8b5cf6]"}`}
              size={14}
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Row 2: Large number + trend delta */}
        <div className="flex items-end justify-between gap-2">
          {noAccess ? (
            <span className="font-bold text-3xl leading-none tracking-tight text-amber-400/60">—</span>
          ) : (
            <AnimatedCounter value={value} className="font-bold text-3xl leading-none tracking-tight text-zinc-100" />
          )}
          {!noAccess && delta !== undefined && (
            <div className="mb-0.5">
              <TrendDelta delta={delta} />
            </div>
          )}
        </div>

        {/* Row 3: Label */}
        <p className="text-sm font-medium mt-2 text-zinc-100">{label}</p>

        {/* Row 4: Sparkline */}
        {!noAccess && <Sparkline data={bars} />}

        {/* Row 5: Description + filtered badge */}
        <div className="flex items-center justify-between mt-1.5 gap-2">
          <p className={`text-xs ${noAccess ? "text-amber-400/60" : "text-zinc-400"} truncate`}>{desc}</p>
          {isActive && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
              {t.hudCard.filtered}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
};
