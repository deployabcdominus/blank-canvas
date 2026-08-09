import { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { useLanguage } from "@/i18n/LanguageContext";

interface HudCardProps {
  label: string;
  desc: string;
  value: number;
  isCurrency?: boolean;
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
    <div className="flex items-end gap-1 h-5 mt-3 px-0.5">
      {data.map((v, i) => {
        const isToday = i === data.length - 1;
        const heightPct = Math.max(0.15, v / max);
        return (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${Math.round(heightPct * 20)}px` }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="rounded-full flex-1"
            style={{
              background: isToday 
                ? "linear-gradient(to top, hsl(var(--primary)), hsl(var(--primary) / 0.6))" 
                : "rgba(255,255,255,0.08)",
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

export const HudCard = memo(({ label, desc, value, icon: Icon, isActive, onClick, index, noAccess, delta, sparkline, isCurrency }: HudCardProps) => {
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
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay: index * 0.08, duration: 0.5, type: "spring" }}
      onClick={onClick}
      className={`
        stat-card relative overflow-hidden text-left group
        rounded-2xl border transition-all duration-300 shimmer-hover
        backdrop-blur-3xl p-4 md:p-5 w-full active:scale-[0.98] md:active:scale-[1.01]
        ${glowPulse
          ? "border-primary/50 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
          : isActive
            ? "border-primary/40 bg-primary/10 shadow-lg shadow-black/40"
            : "border-white/[0.08] bg-white/[0.03] hover:border-primary/30 hover:bg-white/[0.05]"
        }
        ${isActive || glowPulse ? "border-l-primary" : "border-l-white/10"}
        border-l-[3px]
      `}
      style={{
        transition: "border-color 0.4s ease, box-shadow 0.6s ease, background 0.3s ease",
      }}

    >
      {/* Ambient background blob */}
      {(isActive || glowPulse) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.03, 0.08, 0.03], scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-primary blur-[40px] pointer-events-none"
        />
      )}

      {/* Top glow line — active filter or pulse */}
      {(isActive || glowPulse) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: glowPulse ? 0.7 : 0.4 }}
          className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${
            glowPulse ? "via-violet-500" : "via-primary"
          } to-transparent z-20`}
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
        <div className="flex items-end justify-between gap-2 flex-wrap sm:flex-nowrap">
          {noAccess ? (
            <span className="font-bold text-2xl md:text-3xl leading-none tracking-tight text-amber-400/60">—</span>
          ) : (
            <AnimatedCounter value={value} isCurrency={isCurrency} className="font-bold text-3xl md:text-4xl leading-none tracking-tighter text-white" />
          )}
          {!noAccess && delta !== undefined && (
            <div className="mb-0.5 shrink-0">
              <TrendDelta delta={delta} />
            </div>
          )}
        </div>

        {/* Row 3: Label */}
        <p className="text-xs font-semibold mt-3 text-zinc-300 uppercase tracking-wider">{label}</p>

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
});
