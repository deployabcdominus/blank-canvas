import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const PremiumEmptyState = ({
  title = "Tu flujo comienza aquí",
  description = "Captura tu primer registro para ver la magia.",
  actionLabel = "Comenzar",
  onAction,
  icon,
}: PremiumEmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className="flex flex-col items-center justify-center py-20 px-8"
    >
      {/* Minimal line illustration */}
      <div className="relative w-32 h-32 mb-8">
        {/* Outer ring */}
        <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="64" cy="64" r="60" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <circle cx="64" cy="64" r="44" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          {/* Orange accent arc */}
          <path
            d="M 64 4 A 60 60 0 0 1 124 64"
            stroke="hsl(25, 95%, 53%)"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.5"
          />
          {/* Center icon placeholder */}
          <circle cx="64" cy="64" r="20" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          {/* Small dots */}
          <circle cx="64" cy="4" r="2" fill="hsl(25, 95%, 53%)" opacity="0.6" />
          <circle cx="124" cy="64" r="2" fill="hsl(25, 95%, 53%)" opacity="0.4" />
          <circle cx="64" cy="124" r="2" fill="rgba(255,255,255,0.15)" />
        </svg>
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {icon || <Plus className="w-6 h-6 text-primary/60" strokeWidth={1.5} />}
        </div>
        {/* Subtle glow */}
        <div className="absolute inset-0 rounded-full bg-primary/[0.03] blur-2xl scale-150" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-500 text-center max-w-sm mb-6 leading-relaxed">{description}</p>

      {onAction && (
        <Button onClick={onAction} className="btn-spring">
          <Plus className="w-4 h-4 mr-1.5" />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};
